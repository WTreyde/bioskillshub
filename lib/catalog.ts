import {randomUUID} from 'node:crypto';
import {query,transaction} from './db';
import {HttpError} from './auth';
import {draftSchema,validateContent} from './validation';
export async function catalog(userId:string) {
 return query(`SELECT s.id,s.owner_id,u.name AS author,u.expertise,v.number,v.title,v.summary,v.domain,v.price_cents,v.validation,v.published_at,
 EXISTS(SELECT 1 FROM entitlements e WHERE e.skill_id=s.id AND e.user_id=$1) AS acquired
 FROM skills s JOIN users u ON u.id=s.owner_id JOIN LATERAL(SELECT * FROM versions WHERE skill_id=s.id ORDER BY number DESC LIMIT 1) v ON true ORDER BY s.created_at`,[userId]);
}
export async function owned(userId:string,id:string) {const [s]=await query('SELECT * FROM skills WHERE id=$1',[id]);if(!s)throw new HttpError(404,'Skill not found.');if(s.owner_id!==userId)throw new HttpError(403,'Only the creator can edit this skill.');return s;}
export async function saveDraft(userId:string,input:unknown,id?:string) {
 const d=draftSchema.parse(input);try{validateContent(d.content,false);}catch(e){throw new HttpError(400,(e as Error).message);}
 if(id)await owned(userId,id); const skillId=id??randomUUID();
 await transaction(async c=>{if(!id)await c.query('INSERT INTO skills(id,owner_id) VALUES($1,$2)',[skillId,userId]);
 await c.query(`INSERT INTO drafts(skill_id,title,summary,domain,price_cents,content,validation,release_notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
 ON CONFLICT(skill_id) DO UPDATE SET title=$2,summary=$3,domain=$4,price_cents=$5,content=$6,validation=$7,release_notes=$8,updated_at=now()`,[skillId,d.title,d.summary,d.domain,d.price_cents,d.content,d.validation,d.release_notes]);});return skillId;
}
export async function publish(userId:string,id:string) {
 await owned(userId,id);
 return transaction(async c=>{await c.query('SELECT id FROM skills WHERE id=$1 FOR UPDATE',[id]);const {rows:[d]}=await c.query('SELECT * FROM drafts WHERE skill_id=$1 FOR UPDATE',[id]);if(!d)throw new HttpError(409,'Save a draft before publishing.');validateContent(d.content,false);
 const {rows:[v]}=await c.query(`INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation,release_notes)
 SELECT $1,$2,COALESCE(MAX(number),0)+1,$3,$4,$5,$6,$7,$8,$9 FROM versions WHERE skill_id=$2 RETURNING number`,[randomUUID(),id,d.title,d.summary,d.domain,d.price_cents,d.content,d.validation,d.release_notes]);
 await c.query('DELETE FROM drafts WHERE skill_id=$1',[id]);return v.number;});
}
export async function restore(userId:string,id:string,number:number) {
 await owned(userId,id);
 return transaction(async c=>{await c.query('SELECT id FROM skills WHERE id=$1 FOR UPDATE',[id]);const {rows:[v]}=await c.query('SELECT * FROM versions WHERE skill_id=$1 AND number=$2',[id,number]);if(!v)throw new HttpError(404,'Version not found.');
 const {rows:[result]}=await c.query(`INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation,release_notes)
 SELECT $1,$2,COALESCE(MAX(number),0)+1,$3,$4,$5,$6,$7,$8,$9 FROM versions WHERE skill_id=$2 RETURNING number`,[randomUUID(),id,v.title,v.summary,v.domain,v.price_cents,v.content,v.validation,`Restored version ${number}`]);return result.number;});
}
export async function acquire(userId:string,id:string) {const [v]=await query('SELECT id FROM versions WHERE skill_id=$1 LIMIT 1',[id]);if(!v)throw new HttpError(404,'Published skill not found.');await query('INSERT INTO entitlements(user_id,skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[userId,id]);}
export async function retrieve(userId:string,id:string,version:number) {
 const [entitlement]=await query('SELECT 1 FROM entitlements WHERE user_id=$1 AND skill_id=$2',[userId,id]);if(!entitlement)throw new HttpError(403,'Acquire this skill in BioSkillsHub before retrieving it.');
 const [v]=await query('SELECT skill_id,number,title,content,validation,published_at FROM versions WHERE skill_id=$1 AND number=$2',[id,version]);if(!v)throw new HttpError(404,'Requested version is unavailable.');return v;
}
