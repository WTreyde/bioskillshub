import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import pg from 'pg';
test('literature import is attributed, atomic, repeatable and preserves existing data',async()=>{
 const schema=`literature_${Date.now()}`;
 const admin=new pg.Client({connectionString:process.env.DATABASE_URL});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
 const url=new URL(process.env.DATABASE_URL!);url.searchParams.set('options',`-c search_path=${schema}`);process.env.DATABASE_URL=url.toString();
 const {pool,query}=await import('../lib/db');
 try{
  await query(await readFile('db/schema.sql','utf8'));
  await query("INSERT INTO users VALUES('curator','Curator','Literature curator','unchanged-password-hash')");
  const {loadLiterature,seedLiterature}=await import('../lib/literature');
  const entries=await loadLiterature();assert.equal(entries.length,4);assert.equal(new Set(entries.map(e=>e.domain)).size,4);
  for(const entry of entries){assert.equal(entry.price_cents,0);assert.match(entry.content,/not authored or endorsed/);assert.ok(entry.content.includes(entry.source.url));}
  await assert.rejects(seedLiterature('missing',true),/existing account/);
  assert.ok((await seedLiterature('curator')).every(e=>e.status==='would-insert'));assert.equal((await query('SELECT * FROM skills')).length,0);
  // A collision in the final entry must not insert the earlier entries.
  await query('INSERT INTO skills(id,owner_id) VALUES($1,$2)',[entries.at(-1)!.id,'curator']);
  await assert.rejects(seedLiterature('curator',true),/conflicts/);assert.equal((await query('SELECT * FROM skills')).length,1);
  await query('DELETE FROM skills WHERE id=$1',[entries.at(-1)!.id]);
  assert.ok((await seedLiterature('curator',true)).every(e=>e.status==='inserted'));
  assert.ok((await seedLiterature('curator',true)).every(e=>e.status==='existing'));
  assert.equal((await query('SELECT * FROM versions')).length,4);assert.equal((await query('SELECT * FROM users'))[0].password_hash,'unchanged-password-hash');
  const {saveDraft,acquire,retrieve,catalog}=await import('../lib/catalog');
  assert.equal((await catalog('')).length,4);await assert.rejects(retrieve('curator',entries[0].id,1));
  await acquire('curator',entries[0].id);assert.equal((await retrieve('curator',entries[0].id,1)).content,entries[0].content);
  await saveDraft('curator',{...entries[0],title:'My protected in-progress draft'},entries[0].id);
  await assert.rejects(seedLiterature('curator',true),/conflicts/);assert.equal((await query('SELECT title FROM drafts'))[0].title,'My protected in-progress draft');
  assert.equal((await query('SELECT * FROM entitlements')).length,1);
  const {loadRosalind,seedRosalind}=await import('../lib/rosalind');
  const rosalind=await loadRosalind();assert.equal(rosalind.length,3);
  for(const entry of rosalind){assert.equal(entry.price_cents,0);assert.match(entry.validation,/Workbench execution unverified/);assert.ok(entry.content.includes(entry.source_url));}
  assert.ok((await seedRosalind()).every(e=>e.status==='would-insert'));
  assert.equal((await query('SELECT * FROM versions')).length,4);
  assert.equal((await query("SELECT * FROM users WHERE id='rosalind'")).length,0,'Dry run does not create profile');
  const {seedCatalog}=await import('../lib/seed-catalog');
  await query("INSERT INTO users VALUES('other-rosalind','Rosalind','Existing user','preserved')");
  await assert.rejects(seedRosalind(true),/another account/);
  assert.equal((await query('SELECT * FROM versions')).length,4);
  await query("DELETE FROM users WHERE id='other-rosalind'");
  await seedCatalog('curator',rosalind,true); // Earlier deployments assigned these to the importing user.
  await acquire('curator',rosalind[1].id);
  const before=await query('SELECT * FROM versions ORDER BY id');
  assert.ok((await seedRosalind()).every(e=>e.status==='would-reassign'));
  assert.ok((await seedRosalind(true)).every(e=>e.status==='reassigned'));
  assert.equal((await retrieve('curator',rosalind[1].id,1)).content,rosalind[1].content,'Existing buyer access survives transfer');
  assert.deepEqual(await query('SELECT * FROM versions ORDER BY id'),before,'Ownership transfer preserves immutable releases');
  assert.equal((await query("SELECT name FROM users WHERE id='rosalind'"))[0].name,'Rosalind');
  assert.equal((await catalog('')).filter(s=>s.id.startsWith('rosalind-')).every(s=>s.author==='Rosalind'),true);
  const profile=await query("SELECT * FROM users WHERE id='rosalind'");

  assert.ok((await seedRosalind(true)).every(e=>e.status==='existing'));
  assert.deepEqual(await query("SELECT * FROM users WHERE id='rosalind'"),profile,'Repeat import preserves profile credentials');
  assert.equal((await query('SELECT * FROM versions')).length,7);
  await assert.rejects(retrieve('curator',rosalind[0].id,1));await acquire('curator',rosalind[0].id);
  assert.equal((await retrieve('curator',rosalind[0].id,1)).content,rosalind[0].content);
  assert.equal((await query('SELECT title FROM drafts'))[0].title,'My protected in-progress draft');
  const {loadAnthropic,seedAnthropic}=await import('../lib/anthropic');
  const [anthropic]=await loadAnthropic();assert.ok(anthropic.content.includes(anthropic.source_revision));assert.equal(anthropic.price_cents,0);
  assert.equal((await seedAnthropic())[0].status,'would-insert');
  assert.equal((await query("SELECT id FROM users WHERE id='anthropic'")).length,0);
  await query("INSERT INTO users VALUES('conflicting-anthropic','Anthropic','Existing identity','preserve')");
  await assert.rejects(seedAnthropic(true),/another account/);
  assert.equal((await query('SELECT id FROM skills WHERE id=$1',[anthropic.id])).length,0);
  await query("DELETE FROM users WHERE id='conflicting-anthropic'");
  assert.equal((await seedAnthropic(true))[0].status,'inserted');
  const beforeAnthropic=await query("SELECT * FROM users WHERE id='anthropic'");
  assert.equal((await seedAnthropic(true))[0].status,'existing');
  assert.deepEqual(await query("SELECT * FROM users WHERE id='anthropic'"),beforeAnthropic);
  const listed=(await catalog('')).find(s=>s.id===anthropic.id);assert.ok(listed);assert.equal(listed.author,'Anthropic');assert.equal(listed.owner_id,'anthropic');
  await assert.rejects(retrieve('curator',anthropic.id,1));await acquire('curator',anthropic.id);
  assert.equal((await retrieve('curator',anthropic.id,1)).content,anthropic.content);
  await assert.rejects(query('UPDATE versions SET content=$1 WHERE skill_id=$2',['tampered',entries[0].id]),/immutable/);
 }finally{await pool.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
});
