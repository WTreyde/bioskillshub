import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import net from 'node:net';
import pg from 'pg';
const origin=process.env.APP_ORIGIN||'http://localhost:3004',app=new URL(origin),url=new URL(process.env.DATABASE_URL);
assert.ok(['localhost','127.0.0.1'].includes(app.hostname)&&['localhost','127.0.0.1'].includes(url.hostname),'Local isolated audit only');
assert.equal(url.port,process.env.REHEARSAL_DB_PORT||'5442');
await new Promise((resolve,reject)=>{const p=net.createServer();p.once('error',reject);p.listen(Number(app.port||3004),'127.0.0.1',()=>p.close(resolve));});
const schema=`load_${randomUUID().replaceAll('-','')}`,evidence=`.local/qa/${schema}`;
const admin=new pg.Client({connectionString:url.toString()});await admin.connect();await admin.query(`CREATE SCHEMA ${schema}`);
url.searchParams.set('options',`-c search_path=${schema}`);const db=new pg.Client({connectionString:url.toString()});
let server;const metrics=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 await db.connect();await db.query(await readFile('db/schema.sql','utf8'));await mkdir(evidence,{recursive:true,mode:0o700});
 for(let i=0;i<10;i++){await db.query('INSERT INTO users VALUES($1,$1,$1,$1)',[`actor${i}`]);await db.query("INSERT INTO sessions VALUES($1,$2,now()+interval '1 hour')",[createHash('sha256').update(`synthetic-${i}`).digest('hex'),`actor${i}`]);}
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',app.port||'3004'],{env:{...process.env,DATABASE_URL:url.toString(),APP_ORIGIN:origin,OPENAI_API_KEY:'',OPENAI_MODEL:'',GITHUB_CLIENT_ID:'',GITHUB_CLIENT_SECRET:''},stdio:'ignore'});
 for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Audit server exited');try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await pause(100);}
 async function call(path,data,actor=0){const start=performance.now();const r=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{origin,'content-type':'application/json',cookie:`bsh_session=synthetic-${actor}`},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(10000)});return {status:r.status,body:await r.json(),ms:performance.now()-start};}
 async function batch(name,count,concurrency,fn,allowed=[200]){const values=[],start=performance.now();for(let i=0;i<count;i+=concurrency){const tick=performance.now();const rows=await Promise.all(Array.from({length:Math.min(concurrency,count-i)},(_,j)=>fn(i+j)));for(const r of rows){assert.ok(allowed.includes(r.status),`${name}: unexpected HTTP ${r.status}`);values.push(r);}await pause(Math.max(0,concurrency*50-(performance.now()-tick)));}const sorted=values.map(r=>r.ms).sort((a,b)=>a-b);const result={name,count,concurrency,elapsed_ms:Math.round(performance.now()-start),p50_ms:Math.round(sorted[Math.floor(sorted.length*.5)]),p95_ms:Math.round(sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]),statuses:values.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{})};metrics.push(result);console.log(JSON.stringify(result));return values;}
 const content=['Use cases','Inputs','Outputs','Procedure','Expert decisions','Limitations','Examples'].map(h=>`## ${h}\nSynthetic load fixture. No scientific output.`).join('\n\n');
 const draft={title:'Load audit fixture',summary:'Synthetic disposable fixture for bounded HTTP verification only.',domain:'Statistics',content,validation:'Fixture only',price_cents:0};
 const created=await call('skills',draft);assert.equal(created.status,201);const id=created.body.id;
 const published=await batch('concurrent publish',10,10,()=>call(`skills/${id}/publish`,{reviewed:true}),[200,409]);assert.equal(published.filter(r=>r.status===200).length,1);
 for(const concurrency of [1,5,10])await batch('public catalogue',50,concurrency,()=>call('public/catalog'));
 await batch('authenticated catalogue',50,10,i=>call('catalog',undefined,i%10));
 await batch('distinct-user draft saves',30,10,i=>call('skills',{...draft,title:`Load draft ${i}`},i%10),[201]);
 await batch('malformed JSON',30,10,()=>call(`skills/${id}/publish`,null),[400]);
 await batch('unknown route suffix',10,5,()=>call(`skills/${id}/publish/extra`,{reviewed:true}),[404]);
 await batch('duplicate acquisition',20,10,()=>call(`skills/${id}/acquire`,{confirm:true},1));
 const versions=await batch('concurrent restore',10,10,()=>call(`skills/${id}/restore`,{number:1}));assert.equal(new Set(versions.map(r=>r.body.number)).size,10);
 const quotas=await batch('token quota',25,5,()=>call('tokens',{name:'Synthetic load token'},2),[201,429]);assert.equal(quotas.filter(r=>r.status===201).length,20);assert.equal(quotas.filter(r=>r.status===429).length,5);
 assert.equal((await db.query('SELECT count(*) FROM entitlements WHERE skill_id=$1 AND user_id=$2',[id,'actor1'])).rows[0].count,'1');
 assert.deepEqual((await db.query('SELECT number FROM versions WHERE skill_id=$1 ORDER BY number',[id])).rows.map(r=>r.number),Array.from({length:11},(_,i)=>i+1));
 assert.equal((await call(`skills/${id}/versions/1`,undefined,1)).body.content,content);
 // Verify persistence after an actual process restart, using the same disposable DB.
 server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',app.port||'3004'],{env:{...process.env,DATABASE_URL:url.toString(),APP_ORIGIN:origin,OPENAI_API_KEY:'',OPENAI_MODEL:'',GITHUB_CLIENT_ID:'',GITHUB_CLIENT_SECRET:''},stdio:'ignore'});
 for(let i=0;i<100;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}await pause(100);}
 assert.equal((await call(`skills/${id}/versions/11`,undefined,1)).body.content,content);
 await writeFile(evidence+'/results.json',JSON.stringify({time:new Date().toISOString(),scope:'Synthetic local isolated HTTP audit; no production/provider traffic',metrics,integrity:true,restart:true},null,2),{mode:0o600});
 console.log('PASS: integrity and process-restart persistence. Evidence: '+evidence+'/results.json');
}catch(e){console.error('Load audit failed:',e instanceof assert.AssertionError?e.message:e.name);process.exitCode=1;}
finally{if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));}await db.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();}
