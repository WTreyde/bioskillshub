import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import pg from 'pg';

test('adversarial requests and concurrent marketplace operations',async t=>{
 const schema=`audit_${randomUUID().replaceAll('-','')}`;
 const url=new URL(process.env.DATABASE_URL!);assert.ok(['localhost','127.0.0.1'].includes(url.hostname),'Audit requires an isolated local database');
 const admin=new pg.Client({connectionString:url.toString()});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
 url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();process.env.APP_ORIGIN='http://localhost:3004';process.env.OPENAI_API_KEY='';
 const {pool,query}=await import('../lib/db');const {hash,rateLimit}=await import('../lib/auth');const routes=await import('../app/api/[...path]/route');
 try{
 await query(await readFile('db/schema.sql','utf8'));
 for(const id of ['owner','buyer','outsider']){await query('INSERT INTO users VALUES($1,$1,$1,$1)',[id]);await query("INSERT INTO sessions VALUES($1,$2,now()+interval '1 hour')",[hash(`synthetic-${id}`),id]);}
 const content=['Use cases','Inputs','Outputs','Procedure','Expert decisions','Limitations','Examples'].map(x=>`## ${x}\nSynthetic fixture only, no scientific result.`).join('\n\n');
 const draft={title:'Concurrent fixture workflow',summary:'Synthetic audit protocol for validating concurrency and access control.',domain:'Physics',price_cents:0,content,validation:'Software fixture only'};
 async function call(path:string,data?:unknown,user='owner',method=data===undefined?'GET':'POST'){
  const request=new Request(`http://localhost:3004/api/${path}`,{method,headers:{origin:'http://localhost:3004','content-type':'application/json',cookie:`bsh_session=synthetic-${user}`},body:method==='GET'?undefined:JSON.stringify(data)});
  const res=await routes[method as 'GET'|'POST'](request,{params:Promise.resolve({path:path.split('/')})});return {status:res.status,data:await res.json()};
 }
 await t.test('malformed JSON values are client errors, not server failures',async()=>{
  for(const value of [null,[],true,42,'text'])for(const path of ['skills/missing/publish','skills/missing/acquire','skills/missing/restore','skill-import','skill-chat','recommend','generate'])assert.equal((await call(path,value)).status,400,`${path}: ${JSON.stringify(value)}`);
 });
 await t.test('unexpected trailing path segments cannot read or mutate a skill',async()=>{
  const {data:{id}}=await call('skills',draft);
  for(const [action,body] of [['draft',draft],['publish',{reviewed:true}],['acquire',{confirm:true}],['restore',{number:1}]] as const)assert.equal((await call(`skills/${id}/${action}/unexpected`,body)).status,404,action);
  assert.equal((await call(`skills/${id}/draft/unexpected`)).status,404);
  assert.equal((await query('SELECT count(*) FROM versions WHERE skill_id=$1',[id]))[0].count,'0');
 });
 await t.test('parallel publication, restore and acquisition preserve integrity',async()=>{
  const {data:{id}}=await call('skills',draft);
  const publication=await Promise.all(Array.from({length:10},()=>call(`skills/${id}/publish`,{reviewed:true})));
  assert.equal(publication.filter(r=>r.status===200).length,1);assert.equal(publication.filter(r=>r.status===409).length,9);
  const acquisition=await Promise.all(Array.from({length:20},()=>call(`skills/${id}/acquire`,{confirm:true},'buyer')));assert.ok(acquisition.every(r=>r.status===200));
  assert.equal((await query('SELECT count(*) FROM entitlements WHERE skill_id=$1 AND user_id=$2',[id,'buyer']))[0].count,'1');
  const restores=await Promise.all(Array.from({length:10},()=>call(`skills/${id}/restore`,{number:1})));assert.ok(restores.every(r=>r.status===200));assert.equal(new Set(restores.map(r=>r.data.number)).size,10);
  assert.deepEqual((await query('SELECT number FROM versions WHERE skill_id=$1 ORDER BY number',[id])).map(r=>r.number),Array.from({length:11},(_,i)=>i+1));
  assert.equal((await call(`skills/${id}/versions/1`,undefined,'buyer')).data.content,content);assert.equal((await call(`skills/${id}/versions/11`,undefined,'outsider')).status,403);
  assert.equal((await call(`skills/${id}/draft`,draft,'outsider')).status,403);assert.equal((await call(`skills/${id}/restore`,{number:1},'outsider')).status,403);
 });
 await t.test('rate limits remain atomic under concurrent requests',async()=>{
  const results=await Promise.allSettled(Array.from({length:20},()=>rateLimit('audit-fixture',5,60)));assert.equal(results.filter(r=>r.status==='fulfilled').length,5);assert.ok(results.filter(r=>r.status==='rejected').every(r=>r.reason.status===429));
 });
 await t.test('expired sessions cannot access the workspace API',async()=>{
  await query("UPDATE sessions SET expires_at=now()-interval '1 second' WHERE user_id='outsider'");assert.equal((await call('catalog',undefined,'outsider')).status,401);
 });
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
