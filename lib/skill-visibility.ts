import {query,transaction} from './db';

// Administrator-only maintenance helper; never exposed as an HTTP mutation.
export async function listSkillVisibility(){
 return query(`SELECT s.id,s.owner_id,s.hidden,v.title,v.number FROM skills s
 JOIN LATERAL(SELECT title,number FROM versions WHERE skill_id=s.id ORDER BY number DESC LIMIT 1)v ON true
 ORDER BY lower(v.title),s.id`);
}

export async function setSkillVisibility(ids:string[],hidden:boolean,apply=false){
 if(!ids.length||ids.some(id=>!id.trim())||new Set(ids).size!==ids.length)throw Error('Select unique, nonempty skill IDs.');
 return transaction(async c=>{
  const {rows}=await c.query(`SELECT s.id,s.owner_id,s.hidden,v.title FROM skills s
  JOIN LATERAL(SELECT title FROM versions WHERE skill_id=s.id ORDER BY number DESC LIMIT 1)v ON true
  WHERE s.id=ANY($1::text[]) ORDER BY s.id FOR UPDATE OF s`,[ids]);
  if(rows.length!==ids.length)throw Error('Every selected ID must identify a published skill.');
  if(apply)await c.query('UPDATE skills SET hidden=$2 WHERE id=ANY($1::text[])',[ids,hidden]);
  return rows.map(row=>({...row,target_hidden:hidden,applied:apply}));
 });
}
