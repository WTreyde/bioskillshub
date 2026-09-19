import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {transaction} from './db';
const entrySchema=draftSchema.omit({content:true}).extend({id:z.string().regex(/^bp-[a-z0-9-]+$/),file:z.string().regex(/^[a-z0-9-]+\.md$/),source:z.object({authors:z.string().min(1),year:z.string().regex(/^\d{4}$/),title:z.string().min(1),doi:z.string().regex(/^10\.\d{4,9}\/\S+$/),url:z.string().url(),license:z.string().min(1),checked:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
export async function loadLiterature(){
 const root=new URL('../science/literature/',import.meta.url);
 const entries=z.array(entrySchema).min(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Duplicate literature IDs');
 return Promise.all(entries.map(async entry=>{
  const content=await readFile(new URL(entry.file,root),'utf8');
  draftSchema.parse({...entry,content});validateContent(content);
  if(entry.source.url!==`https://doi.org/${entry.source.doi}`||!content.includes(entry.source.url)||!content.includes('not experimentally validated'))throw Error('Literature provenance or status is missing');
  return {...entry,content};
 }));
}
// One atomic import; never changes accounts, existing drafts, entitlements or releases.
export async function seedLiterature(owner:string,apply=false){
 const entries=await loadLiterature();
 return transaction(async c=>{
  await c.query("SELECT pg_advisory_xact_lock(hashtext('bioskillshub-literature-import'))");
  if(!(await c.query('SELECT id FROM users WHERE id=$1',[owner])).rowCount)throw Error('Import owner must be an existing account');
  const plan:{id:string;status:'existing'|'inserted'|'would-insert'}[]=[];
  for(const entry of entries){
   const {rows:[existing]}=await c.query('SELECT owner_id FROM skills WHERE id=$1',[entry.id]);
   if(existing){
    const {rows:versions}=await c.query('SELECT * FROM versions WHERE skill_id=$1 ORDER BY number',[entry.id]);
    const draft=await c.query('SELECT 1 FROM drafts WHERE skill_id=$1',[entry.id]);
    const v=versions[0];
    if(existing.owner_id!==owner||draft.rowCount||versions.length!==1||v.number!==1||(['title','summary','domain','price_cents','content','validation','release_notes'] as const).some(key=>v[key]!==entry[key]))throw Error(`Existing skill conflicts with literature import: ${entry.id}. No changes applied.`);
    plan.push({id:entry.id,status:'existing'});
   }else plan.push({id:entry.id,status:apply?'inserted':'would-insert'});
  }
  if(apply)for(const entry of entries){
   if(plan.find(p=>p.id===entry.id)!.status!=='inserted')continue;
   await c.query('INSERT INTO skills(id,owner_id) VALUES($1,$2)',[entry.id,owner]);
   await c.query('INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation,release_notes) VALUES($1,$2,1,$3,$4,$5,$6,$7,$8,$9)',[randomUUID(),entry.id,entry.title,entry.summary,entry.domain,entry.price_cents,entry.content,entry.validation,entry.release_notes]);
  }
  return plan;
 });
}
