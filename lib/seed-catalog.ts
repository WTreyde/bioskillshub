import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {passwordHash,secret} from './auth';
import {transaction} from './db';
type SeedEntry=z.infer<typeof draftSchema>&{id:string};
// Atomic import. An explicit profile policy may create a curator or reassign unchanged seeds.
// Existing credentials, drafts, entitlements and published releases are never modified.
export async function seedCatalog(owner:string,entries:SeedEntry[],apply=false,profile?:{name:string;expertise:string;reassignMatching:boolean}){
 for(const entry of entries){draftSchema.parse(entry);validateContent(entry.content);}
 if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Duplicate catalogue IDs');
 return transaction(async c=>{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('bioskillshub-catalog-import'))");
  const {rows:[account]}=await c.query('SELECT id,name FROM users WHERE id=$1',[owner]);
  if(!account&&!profile)throw Error('Import owner must be an existing account');
  if(profile){
   if(account&&account.name!==profile.name)throw Error('Reserved curator account has a different name');
   const duplicates=await c.query('SELECT id FROM users WHERE lower(name)=lower($1) AND id<>$2',[profile.name,owner]);
   if(duplicates.rowCount)throw Error('Curator name already belongs to another account; resolve identity before importing');
  }
  const plan:{id:string;status:'existing'|'inserted'|'would-insert'|'reassigned'|'would-reassign'}[]=[];
  for(const entry of entries){
   const {rows:[existing]}=await c.query('SELECT owner_id FROM skills WHERE id=$1',[entry.id]);
   if(existing){
    const {rows:versions}=await c.query('SELECT * FROM versions WHERE skill_id=$1 ORDER BY number',[entry.id]);
    const draft=await c.query('SELECT 1 FROM drafts WHERE skill_id=$1',[entry.id]);
    const v=versions[0];
    if((existing.owner_id!==owner&&!profile?.reassignMatching)||draft.rowCount||versions.length!==1||v.number!==1||(['title','summary','domain','price_cents','content','validation','release_notes'] as const).some(key=>v[key]!==entry[key]))throw Error(`Existing skill conflicts with catalogue import: ${entry.id}. No changes applied.`);
    plan.push({id:entry.id,status:existing.owner_id===owner?'existing':apply?'reassigned':'would-reassign'});
   }else plan.push({id:entry.id,status:apply?'inserted':'would-insert'});
  }
  if(apply&&!account&&profile)await c.query('INSERT INTO users(id,name,expertise,password_hash) VALUES($1,$2,$3,$4)',[owner,profile.name,profile.expertise,passwordHash(secret())]);
  if(apply)for(const entry of entries){
   if(plan.find(p=>p.id===entry.id)!.status==='reassigned')await c.query('UPDATE skills SET owner_id=$1 WHERE id=$2',[owner,entry.id]);
   if(plan.find(p=>p.id===entry.id)!.status!=='inserted')continue;
   await c.query('INSERT INTO skills(id,owner_id) VALUES($1,$2)',[entry.id,owner]);
   await c.query('INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation,release_notes) VALUES($1,$2,1,$3,$4,$5,$6,$7,$8,$9)',[randomUUID(),entry.id,entry.title,entry.summary,entry.domain,entry.price_cents,entry.content,entry.validation,entry.release_notes]);
  }
  return plan;
 });
}
