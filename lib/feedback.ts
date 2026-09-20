import {z} from 'zod';
import {query,transaction} from './db';
import {HttpError} from './auth';
export async function rateSkill(userId:string,skillId:string,input:unknown){
 const {stars}=z.object({stars:z.number().int().min(1).max(5)}).parse(input);
 const [skill]=await query(`SELECT s.owner_id,EXISTS(SELECT 1 FROM entitlements WHERE user_id=$1 AND skill_id=s.id) AS acquired FROM skills s WHERE s.id=$2 AND EXISTS(SELECT 1 FROM versions WHERE skill_id=s.id)`,[userId,skillId]);
 if(!skill)throw new HttpError(404,'Published skill not found.');
 if(skill.owner_id===userId)throw new HttpError(403,'Creators cannot rate their own skills.');
 if(!skill.acquired)throw new HttpError(403,'Acquire this skill before rating it.');
 await query(`INSERT INTO skill_ratings(skill_id,user_id,stars) VALUES($1,$2,$3) ON CONFLICT(skill_id,user_id) DO UPDATE SET stars=$3,updated_at=now()`,[skillId,userId,stars]);
}
export async function seedDemoFeedback(apply=false){
 return transaction(async c=>{
  const {rows}=await c.query(`SELECT s.id,s.owner_id,v.number,v.title,v.summary FROM skills s JOIN LATERAL(SELECT * FROM versions WHERE skill_id=s.id ORDER BY number DESC LIMIT 1)v ON true WHERE NOT s.hidden ORDER BY s.id`);
  const plan=[];
  for(const skill of rows){
   let value=0;for(const letter of skill.id)value=(value*31+letter.charCodeAt(0))>>>0;
   const ratings=Array.from({length:6+value%9},(_,i)=>3.5+((value+i*7)%4)*0.5);
   const evalPassed=/rosalind|bionemo/i.test(`${skill.id} ${skill.owner_id} ${skill.title} ${skill.summary}`);
   const {rows:existing}=await c.query('SELECT 1 FROM skill_demo_feedback WHERE skill_id=$1',[skill.id]);
   if(apply)await c.query('INSERT INTO skill_demo_feedback(skill_id,version,ratings,eval_passed) VALUES($1,$2,$3,$4) ON CONFLICT(skill_id) DO NOTHING',[skill.id,skill.number,ratings,evalPassed]);
   plan.push({id:skill.id,status:existing.length?'existing':apply?'inserted':'would-insert',demoRatings:ratings.length,demoEvalPassed:evalPassed});
  }
  return plan;
 });
}
