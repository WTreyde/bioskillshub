import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import pg from 'pg';

test('complete marketplace and agent access lifecycle against PostgreSQL',async()=>{
 const schema=`test_${Date.now()}`;
 const admin=new pg.Client({connectionString:process.env.DATABASE_URL});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
 const url=new URL(process.env.DATABASE_URL!);url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();process.env.APP_ORIGIN='http://localhost:3000';process.env.OPENAI_API_KEY='';
 const {pool,query}=await import('../lib/db');
 try{
 await query(await readFile('db/schema.sql','utf8'));
 const {passwordHash,hash}=await import('../lib/auth');
 const routes=await import('../app/api/[...path]/route');
 for(const id of ['creator','buyer','outsider'])await query('INSERT INTO users VALUES($1,$2,$3,$4)',[id,id,'test expertise',passwordHash('test-password-123')]);
 async function call(path:string,method='GET',data?:unknown,cookie?:string,token?:string,origin='http://localhost:3000'){
 const headers:Record<string,string>={origin};if(data)headers['content-type']='application/json';if(cookie)headers.cookie=cookie;if(token)headers.authorization=`Bearer ${token}`;
 const req=new Request(`http://localhost:3000/api/${path}`,{method,headers,body:data?JSON.stringify(data):undefined});
 const res=await routes[method as 'GET'|'POST'|'DELETE'](req,{params:Promise.resolve({path:path.split('/')})});return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};}
 assert.equal((await call('catalog')).status,401);
 assert.equal((await call('auth/login','POST',{id:'buyer',password:'bad'})).status,401);
 const c=(await call('auth/login','POST',{id:'creator',password:'test-password-123'})).cookie!;
 const b=(await call('auth/login','POST',{id:'buyer',password:'test-password-123'})).cookie!;
 const o=(await call('auth/login','POST',{id:'outsider',password:'test-password-123'})).cookie!;
 assert.equal((await call('auth/me','GET',undefined,b)).data.user.id,'buyer');
 const content=await readFile('science/imagej/SKILL.md','utf8');
 const draft={title:'Fluorescence test workflow',summary:'A reproducible fluorescence workflow for testing entitlement boundaries.',domain:'Imaging',price_cents:500,content,validation:'Test fixture only',release_notes:'Initial release'};
 assert.equal((await call('skills','POST',{...draft,content:'Malformed without required sections'},c)).status,400);
 assert.equal((await call('skills','POST',draft,c,undefined,'https://evil.example')).status,403);
 const created=await call('skills','POST',draft,c);assert.equal(created.status,201);const id=created.data.id;
 assert.equal((await call('catalog','GET',undefined,b)).data.skills.length,0,'Draft must not be listed');
 assert.equal((await call(`skills/${id}/draft`,'GET',undefined,b)).status,403);
 assert.equal((await call(`skills/${id}/publish`,'POST',{reviewed:true},b)).status,403);
 assert.equal((await call(`skills/${id}/publish`,'POST',{reviewed:false},c)).status,400);
 assert.equal((await call(`skills/${id}/publish`,'POST',{reviewed:true},c)).data.number,1);
 const list=await call('catalog','GET',undefined,b);assert.equal(list.data.skills.length,1);assert.ok(!JSON.stringify(list.data).includes('## Procedure'),'Catalogue must not contain instructions');
 assert.equal((await call(`skills/${id}/versions/1`,'GET',undefined,b)).status,403);
 const bt=(await call('tokens','POST',{name:'test agent'},b)).data.token;
 const ot=(await call('tokens','POST',{name:'outsider agent'},o)).data.token;
 assert.equal((await call('agent/skills','GET',undefined,undefined,bt)).data.skills.length,0);
 assert.equal((await call(`agent/skills/${id}/versions/1`,'GET',undefined,undefined,bt)).status,403);
 assert.equal((await call(`skills/${id}/acquire`,'POST',{confirm:false},b)).status,400);
 await call(`skills/${id}/acquire`,'POST',{confirm:true},b);await call(`skills/${id}/acquire`,'POST',{confirm:true},b);
 assert.equal((await query('SELECT * FROM entitlements')).length,1,'Acquisition is idempotent');
 const result=await call(`agent/skills/${id}/versions/1`,'GET',undefined,undefined,bt);assert.equal(result.status,200);assert.equal(result.data.sha256,hash(content));assert.equal(result.data.content,content);
 assert.equal((await call(`agent/skills/${id}/versions/1`,'GET',undefined,undefined,ot)).status,403);
 assert.equal((await call(`agent/skills/${id}/versions/999`,'GET',undefined,undefined,bt)).status,404);
 assert.equal((await call('agent/skills','GET',undefined,undefined,'bad')).status,401);
 await assert.rejects(query('UPDATE versions SET content=$1 WHERE skill_id=$2',['changed',id]),/immutable/);
 const updated=content+'\nAdditional expert note.\n';await call(`skills/${id}/draft`,'POST',{...draft,content:updated},c);
 assert.equal((await call(`skills/${id}/publish`,'POST',{reviewed:true},c)).data.number,2);
 assert.equal((await call(`skills/${id}/restore`,'POST',{number:1},c)).data.number,3);
 assert.equal((await call(`agent/skills/${id}/versions/3`,'GET',undefined,undefined,bt)).data.content,content);
 assert.equal((await call(`agent/skills/${id}/versions/2`,'GET',undefined,undefined,bt)).data.content,updated);
 const recommendation=await call('recommend','POST',{prompt:'fluorescence workflow'},b);assert.equal(recommendation.data.mode,'keyword');assert.equal(recommendation.data.recommendations[0].id,id);
 assert.equal((await query('SELECT * FROM entitlements')).length,1,'Recommendations must not buy skills');
 const originalFetch=globalThis.fetch;process.env.OPENAI_API_KEY='test-only-not-a-real-key';process.env.OPENAI_MODEL='test-model';
 try {
 globalThis.fetch=async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({recommendations:[{id,reason:'Relevant imaging workflow'},{id:'invented-id',reason:'Must be removed'}]})}]}],usage:{input_tokens:10,output_tokens:20}}));
 const ai=await call('recommend','POST',{prompt:'fluorescence workflow'},b);assert.equal(ai.data.mode,'llm');assert.deepEqual(ai.data.recommendations.map((r:{id:string})=>r.id),[id]);
 assert.equal((await query('SELECT * FROM entitlements')).length,1,'LLM cannot acquire a skill');
 globalThis.fetch=async()=>new Response('provider failed',{status:500});assert.equal((await call('recommend','POST',{prompt:'fluorescence workflow'},b)).status,502);
 globalThis.fetch=async()=>new Response(JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:'not JSON'}]}]}));assert.equal((await call('recommend','POST',{prompt:'fluorescence workflow'},b)).status,502);
 } finally {globalThis.fetch=originalFetch;process.env.OPENAI_API_KEY='';}
 const ts=await call('tokens','GET',undefined,b);assert.ok(!JSON.stringify(ts.data).includes(bt));assert.ok(!JSON.stringify(ts.data).includes(hash(bt)));
 await call(`tokens/${ts.data.tokens[0].id}`,'DELETE',undefined,o);assert.equal((await call('agent/skills','GET',undefined,undefined,bt)).status,200,'Other accounts cannot revoke tokens');
 await call(`tokens/${ts.data.tokens[0].id}`,'DELETE',undefined,b);assert.equal((await call('agent/skills','GET',undefined,undefined,bt)).status,401);
 await call('auth/logout','POST',{},b);assert.equal((await call('catalog','GET',undefined,b)).status,401);
 // A fresh connection verifies state is committed, not held in app memory.
 const fresh=new pg.Client({connectionString:process.env.DATABASE_URL});await fresh.connect();assert.equal((await fresh.query('SELECT count(*) FROM versions')).rows[0].count,'3');await fresh.end();
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
