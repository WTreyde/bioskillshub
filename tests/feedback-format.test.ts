import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import pg from 'pg';
import {unzipSync,strFromU8} from 'fflate';
import {agentSkillMetadata,makeAgentSkill} from '../lib/agent-skill-format';

test('Agent Skills metadata validation and non-AI conversion preserve instructions',()=>{
 const original='# Custom method\nInspect the inputs and stop on unexpected data.';
 const formatted=makeAgentSkill(original,'An example method','Inspect inputs when checking an example workflow.');
 assert.ok(formatted.endsWith(original));assert.equal(agentSkillMetadata(formatted).name,'an-example-method');assert.equal(makeAgentSkill(formatted,'Ignored title','Ignored summary'),formatted);
 for(const name of ['Uppercase','-leading','trailing-','two--hyphens','x'.repeat(65),'../escape'])assert.throws(()=>agentSkillMetadata(`---\nname: ${name}\ndescription: Example\n---\nBody`));
 for(const header of ['name: good\ndescription: ""','name: good\ndescription: Fine\nmetadata:\n  version: 1','name: good\nname: duplicate\ndescription: Fine','name: &n good\ndescription: *n','name: good\ndescription: Fine\nunknown: bad','name: good\ndescription: Fine\ncompatibility: '+ 'x'.repeat(501)])assert.throws(()=>agentSkillMetadata(`---\n${header}\n---\nBody`));
 assert.throws(()=>makeAgentSkill('---\nname: Bad\n---\nOriginal','Title','Summary'),/Correct the existing/);
 assert.throws(()=>agentSkillMetadata('---\nname: good\ndescription: Fine\n---\n'));
});

test('real ratings, demo badges, immutable eval status and authorized Agent Skills packages',async()=>{
 const schema=`feedback_${Date.now()}`;const admin=new pg.Client({connectionString:process.env.DATABASE_URL});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
 const url=new URL(process.env.DATABASE_URL!);url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();process.env.APP_ORIGIN='http://localhost:3004';process.env.OPENAI_API_KEY='';
 const {pool,query}=await import('../lib/db');
 try{
  const sql=await readFile('db/schema.sql','utf8');await query(sql.split('-- Additive upgrade:')[0]);
  const {hash}=await import('../lib/auth');
  for(const id of ['owner','buyer','outsider']){await query('INSERT INTO users VALUES($1,$1,$1,$1)',[id]);await query("INSERT INTO sessions VALUES($1,$2,now()+interval '1 hour')",[hash(`fixture-${id}`),id]);}
  await query("INSERT INTO skills(id,owner_id) VALUES('legacy','owner')");await query("INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation) VALUES('legacy-v1','legacy',1,'Legacy protocol','A previously published plain Markdown protocol.','Other',0,'# Original immutable instructions','Not evaluated')");
  await query(sql);await query(sql); // Idempotent additive migration over an old release.
  const {saveDraft,publish,acquire,catalog,retrieve}=await import('../lib/catalog');const {seedDemoFeedback}=await import('../lib/feedback');const routes=await import('../app/api/[...path]/route');
  async function call(path:string,method:'GET'|'POST'='GET',data?:unknown,user='buyer',token?:string,origin='http://localhost:3004'){
   const headers:Record<string,string>={origin,'content-type':'application/json'};if(user)headers.cookie=`bsh_session=fixture-${user}`;if(token)headers.authorization=`Bearer ${token}`;
   return routes[method](new Request(`http://localhost:3004/api/${path}`,{method,headers,body:method==='POST'?JSON.stringify(data):undefined}),{params:Promise.resolve({path:path.split('/')})});
  }
  const input={title:'Rosalind workflow fixture',summary:'Synthetic fixture for rating and format tests.',domain:'Other',price_cents:0,content:makeAgentSkill('# Instructions\nInspect a synthetic input.','Rosalind fixture','A synthetic workflow for platform testing.'),validation:'Not scientifically validated',eval_status:'not_evaluated'};
  const id=await saveDraft('owner',input);await publish('owner',id);
  const bio=await saveDraft('owner',{...input,title:'BioNeMo workflow fixture'});await publish('owner',bio);
  const before=await query('SELECT * FROM versions ORDER BY id');assert.equal((await seedDemoFeedback()).length,3);assert.equal((await query('SELECT * FROM skill_demo_feedback')).length,0);await seedDemoFeedback(true);assert.ok((await seedDemoFeedback(true)).every(r=>r.status==='existing'));assert.deepEqual(await query('SELECT * FROM versions ORDER BY id'),before);
  let skill=(await catalog('buyer')).find(s=>s.id===id)!;assert.equal(skill.eval_status,'demo');assert.equal(skill.rating_count,0);assert.ok(skill.demo_rating_average>=3.5&&skill.demo_rating_average<=5);
  assert.equal((await catalog('buyer')).find(s=>s.id===bio)!.eval_status,'demo');
  assert.equal((await call(`skills/${id}/rating`,'POST',{stars:5},'')).status,401);assert.equal((await call(`skills/${id}/rating`,'POST',{stars:5})).status,403);
  await acquire('buyer',id);await acquire('owner',id);
  assert.equal((await call(`skills/${id}/rating`,'POST',{stars:5},'owner')).status,403);
  for(const stars of [0,6,3.5,'5'])assert.equal((await call(`skills/${id}/rating`,'POST',{stars})).status,400);
  assert.equal((await call(`skills/${id}/rating`,'POST',{stars:5},'buyer',undefined,'https://wrong.example')).status,403);
  assert.equal((await call(`skills/${id}/rating`,'POST',{stars:5})).status,200);assert.equal((await call(`skills/${id}/rating`,'POST',{stars:4})).status,200);
  skill=(await catalog('buyer')).find(s=>s.id===id)!;assert.equal(skill.rating_average,4);assert.equal(skill.rating_count,1);assert.equal(skill.my_rating,4);assert.ok(skill.demo_rating_count>0);
  const publicSkill=(await (await call('public/catalog','GET',undefined,'')).json()).skills.find((s:{id:string})=>s.id===id);assert.equal(publicSkill.my_rating,null);assert.ok(!JSON.stringify(publicSkill).includes('# Instructions'));
  assert.equal((await call(`skills/${id}/versions/1/package`,'GET',undefined,'outsider')).status,403);
  await acquire('buyer','legacy');const response=await call('skills/legacy/versions/1/package');assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/zip');
  const files=unzipSync(new Uint8Array(await response.arrayBuffer()));const entry=Object.keys(files).find(p=>p.endsWith('/SKILL.md'))!;const text=strFromU8(files[entry]);assert.equal(entry,`${agentSkillMetadata(text).name}/SKILL.md`);assert.ok(text.endsWith('# Original immutable instructions'));
  const provenance=JSON.parse(strFromU8(files[entry.replace('SKILL.md','bioskillshub-provenance.json')]));assert.equal(provenance.source_sha256,hash('# Original immutable instructions'));assert.equal(provenance.package_skill_sha256,hash(text));assert.equal((await retrieve('buyer','legacy',1)).content,'# Original immutable instructions');
  const token=await (await call('tokens','POST',{name:'Package fixture'})).json();assert.equal((await call(`agent/skills/${id}/versions/1/package`,'GET',undefined,'',token.token)).status,200);assert.equal((await call(`agent/skills/${id}/rating`,'POST',{stars:5},'',token.token)).status,405);
  const invalid=await saveDraft('owner',{...input,content:'# Missing frontmatter'});await assert.rejects(publish('owner',invalid),/Agent Skills format/);
  await saveDraft('owner',{...input,eval_status:'creator_reported'},id);await publish('owner',id);skill=(await catalog('buyer')).find(s=>s.id===id)!;assert.equal(skill.eval_status,'creator_reported');assert.equal(skill.demo_rating_count,0);assert.equal(skill.rating_count,1);
  await assert.rejects(query("UPDATE versions SET eval_status='creator_reported' WHERE skill_id='legacy'"),/immutable/);
  assert.equal((await query("SELECT eval_status FROM versions WHERE skill_id='legacy'"))[0].eval_status,'not_evaluated');
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
