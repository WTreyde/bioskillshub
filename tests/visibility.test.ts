import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import pg from 'pg';

test('hiding exact skill IDs is reversible and preserves immutable releases and acquired access',async()=>{
 const schema=`visibility_${Date.now()}`;
 const admin=new pg.Client({connectionString:process.env.DATABASE_URL});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
 const url=new URL(process.env.DATABASE_URL!);url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();process.env.APP_ORIGIN='http://localhost:3004';
 const {pool,query}=await import('../lib/db');
 try{
  const sql=await readFile('db/schema.sql','utf8');await query(sql.split('-- Reversible discovery control;')[0]);
  await query("INSERT INTO users VALUES('owner','Owner','Fixture','unused'),('buyer','Buyer','Fixture','unused')");
  for(const id of ['test','real']){
   await query("INSERT INTO skills(id,owner_id) VALUES($1,'owner')",[id]);
   await query("INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content) VALUES($1,$1,1,$1,'Fixture','Other',0,'# Immutable fixture')",[id]);
  }
  await query(sql);await query(sql); // Upgrade is additive, idempotent and defaults to visible.
  const {catalog,acquire,retrieve}=await import('../lib/catalog');
  const {setSkillVisibility,listSkillVisibility}=await import('../lib/skill-visibility');
  const {seedDemoFeedback}=await import('../lib/feedback');
  const {hash}=await import('../lib/auth');
  const routes=await import('../app/api/[...path]/route');
  await query("INSERT INTO sessions VALUES($1,'buyer',now()+interval '1 hour')",[hash('visibility-session')]);
  await query("INSERT INTO api_tokens(id,user_id,name,token_hash) VALUES('token','buyer','Fixture',$1)",[hash('visibility-token')]);
  async function get(path:string,agent=false){
   const headers:Record<string,string>=agent?{authorization:'Bearer visibility-token'}:{cookie:'bsh_session=visibility-session'};
   return routes.GET(new Request(`http://localhost:3004/api/${path}`,{headers}),{params:Promise.resolve({path:path.split('/')})});
  }
  await acquire('buyer','test');
  const before=await query('SELECT * FROM versions ORDER BY id');
  assert.ok((await listSkillVisibility()).every(s=>!s.hidden));
  await setSkillVisibility(['test'],true);assert.equal((await catalog('')).length,2);
  await assert.rejects(setSkillVisibility(['test','unknown'],true,true));
  await assert.rejects(setSkillVisibility([],true,true));
  await assert.rejects(setSkillVisibility(['test','test'],true,true));
  assert.equal((await catalog('')).length,2);
  await setSkillVisibility(['test'],true,true);await setSkillVisibility(['test'],true,true);
  for(const path of ['public/catalog','catalog','agent/skills']){
   const result=await (await get(path,path.startsWith('agent/'))).json();
   assert.ok(!result.skills.some((s:{id:string})=>s.id==='test'),path);
  }
  assert.equal((await get('skills/test')).status,404);
  assert.deepEqual((await catalog('buyer')).map(s=>s.id),['real']);
  assert.deepEqual((await seedDemoFeedback()).map(s=>s.id),['real']);
  await assert.rejects(acquire('owner','test'),/Published skill not found/);
  assert.equal((await retrieve('buyer','test',1)).content,'# Immutable fixture');
  assert.equal((await get('agent/skills/test/versions/1',true)).status,200);
  assert.deepEqual(await query('SELECT * FROM versions ORDER BY id'),before);
  await assert.rejects(query("DELETE FROM versions WHERE skill_id='test'"),/immutable/);
  await setSkillVisibility(['test'],false,true);
  assert.equal((await catalog('buyer')).length,2);assert.equal((await get('skills/test')).status,200);
  assert.equal((await catalog('buyer')).find(s=>s.id==='test')!.acquired,true);
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
