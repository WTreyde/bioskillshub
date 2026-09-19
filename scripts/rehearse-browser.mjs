import {chromium} from 'playwright';
import pg from 'pg';
import net from 'node:net';
import {randomBytes,scryptSync,createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const origin=process.env.APP_ORIGIN||'http://localhost:3004';
function privateUrl(value){try{return new URL(value);}catch{throw Error('Invalid private database/origin configuration.');}}
const appUrl=privateUrl(origin);
assert.ok(['localhost','127.0.0.1'].includes(appUrl.hostname),'Use a local rehearsal origin');
const schema=`rehearsal_${Date.now()}`;
const evidence=`.local/rehearsal/${schema}`;
await mkdir(evidence,{recursive:true,mode:0o700});
const url=privateUrl(process.env.DATABASE_URL);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.equal(url.port,process.env.REHEARSAL_DB_PORT||'5442');
const admin=new pg.Client({connectionString:url.toString()});
// Refuse to test an existing service on the allocated app port.
await new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',reject);probe.listen(Number(appUrl.port||3004),'127.0.0.1',()=>probe.close(resolve));});
await admin.connect();
let db,server,browser;
const steps=[];
const pass=s=>{steps.push(s);console.log(`PASS: ${s}`);};
try {
 await admin.query(`CREATE SCHEMA ${schema}`);
 url.searchParams.set('options',`-c search_path=${schema}`);
 db=new pg.Client({connectionString:url.toString()});await db.connect();
 await db.query(await readFile('db/schema.sql','utf8'));
 const passwords={};
 for(const id of ['wojtek','efe']) {
  const password=randomBytes(24).toString('hex'),salt=randomBytes(24).toString('hex');passwords[id]=password;
  await db.query('INSERT INTO users VALUES($1,$2,$3,$4)',[id,`${id} (rehearsal)`,'Synthetic software fixture',`${salt}:${scryptSync(password,salt,64).toString('hex')}`]);
 }
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',appUrl.port||'3004'],{env:{...process.env,DATABASE_URL:url.toString(),APP_ORIGIN:origin,OPENAI_API_KEY:'',OPENAI_MODEL:'',GITHUB_CLIENT_ID:'',GITHUB_CLIENT_SECRET:''},stdio:'ignore'});
 for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Rehearsal server could not start');try{if((await fetch(origin+'/api/auth/me')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 let page=await browser.newPage({viewport:{width:1440,height:1000},recordVideo:{dir:evidence,size:{width:1440,height:1000}}});
 const errors=[];page.on('pageerror',e=>errors.push(e.name));
 async function login(id){await page.goto(origin);await page.getByLabel('Team account').selectOption(id);await page.getByLabel('Password',{exact:true}).fill(passwords[id]);await page.getByRole('button',{name:'Enter workspace'}).click();await page.getByRole('button',{name:'Creator studio',exact:true}).waitFor();}
 await page.goto(origin+'/browse');await page.getByRole('heading',{name:/Expertise/}).waitFor();
 await login('wojtek');pass('public browse and browser sign-in');
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'No narrow-screen overflow');
 assert.equal(await page.getByRole('button',{name:'Sign out',exact:true}).isVisible(),true,'Mobile sign-out reachable');
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Creator studio',exact:true}).click();
 const title='Synthetic rehearsal protocol';
 await page.getByLabel('Skill title',{exact:true}).fill(title);
 await page.getByLabel('Short description').fill('A harmless synthetic fixture for the marketplace rehearsal; no scientific results.');
 for(const label of ['Use cases','Inputs','Outputs','Procedure','Expert decisions','Limitations','Examples']) await page.getByLabel(label,{exact:true}).fill(`Synthetic rehearsal ${label.toLowerCase()}; no scientific validation claimed.`);
 await page.getByRole('button',{name:'Use structured template',exact:true}).click();
 await page.getByLabel('Skill instructions').waitFor();
 const content=await page.getByLabel('Skill instructions').inputValue();
 await page.getByLabel('Validation evidence / status').fill('Synthetic software fixture; scientifically unvalidated');
 await page.getByLabel('Release notes').fill('Rehearsal version 1');
 assert.equal(await page.getByRole('button',{name:'Publish reviewed version'}).isDisabled(),true);
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Draft saved'}).waitFor();
 pass('guided template and draft save; publish disabled before review');
 assert.equal((await db.query('SELECT count(*) FROM versions')).rows[0].count,'0');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Publish reviewed version'}).click();
 await page.getByRole('status').filter({hasText:'Published immutable version 1'}).waitFor();
 const skill=(await db.query('SELECT skill_id FROM versions')).rows[0].skill_id;
 pass('review and immutable version 1 publication');
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await login('efe');
 await page.getByRole('button',{name:new RegExp(title)}).click();
 await page.getByRole('dialog').waitFor();
 assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Close details');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>Boolean(document.activeElement?.closest('dialog'))),true,'Focus stays inside dialog');
 await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
 assert.ok((await page.evaluate(()=>document.activeElement?.textContent))?.includes(title),'Focus returns to skill card');
 await page.getByRole('button',{name:new RegExp(title)}).click();
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Dialog fits narrow screen');
 await page.getByRole('button',{name:/Add to library/}).click();
 await page.getByRole('button',{name:'Confirm demo acquisition'}).click();
 await page.getByRole('button',{name:'Read selected version'}).click();
 await page.locator('.skill-content').waitFor();assert.equal(await page.locator('.skill-content').textContent(),content);
 await page.screenshot({path:evidence+'/acquired-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Close details'}).click();
 await page.getByRole('button',{name:/^My library/}).click();await page.getByRole('button',{name:new RegExp(title)}).waitFor();
 pass('buyer browse, simulated acquisition, library, pinned content, keyboard focus and mobile layout');
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin+'/browse');await page.getByRole('heading',{name:title,exact:true}).waitFor();
 assert.equal(await page.locator('body').textContent().then(t=>t.includes('## Procedure')),false,'Public page omits instructions');
 await page.screenshot({path:evidence+'/public-catalog.png',fullPage:true});
 await page.context().close(); // Stop fallback recording before any token is created.
 page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.name));await login('efe');
 await page.getByRole('button',{name:'Connect agent',exact:true}).click();
 await page.getByLabel('Workspace name').fill('Disposable rehearsal');
 await page.getByRole('button',{name:'Create token',exact:true}).click();
 await page.locator('.token-secret code').waitFor();
 const token=await page.locator('.token-secret code').textContent();
 await page.getByRole('button',{name:/saved it.*hide token/}).click();
 const env={...process.env,BIOSKILLS_URL:origin,BIOSKILLS_TOKEN:token};
 const list=JSON.parse(execFileSync('python3',['scripts/agent_client.py','list'],{env,stdio:['ignore','pipe','pipe']}));
 assert.equal(list.skills.length,1);assert.equal(list.skills[0].id,skill);
 execFileSync('python3',['scripts/agent_client.py','get',skill,'1','--output',evidence+'/SKILL.md'],{env,stdio:'pipe'});
 const manifest=JSON.parse(await readFile(evidence+'/SKILL.md.manifest.json','utf8'));
 assert.equal(manifest.number,1);assert.equal(manifest.sha256,createHash('sha256').update(content).digest('hex'));
 pass('UI token transported privately to Python helper; pinned content and SHA-256 verified');
 await page.getByRole('button',{name:'Revoke',exact:true}).click();await page.getByRole('button',{name:'Revoked',exact:true}).waitFor();
 let revoked=false;try{execFileSync('python3',['scripts/agent_client.py','list'],{env,stdio:'pipe'});}catch{revoked=true;}assert.equal(revoked,true);
 assert.deepEqual(errors,[]);pass('revocation rejects helper access; no browser page errors');
 await writeFile(evidence+'/result.json',JSON.stringify({time:new Date().toISOString(),scope:'Disposable schema in Wojtek database; synthetic software only',steps},null,2),{mode:0o600});
} catch(e) {console.error('Rehearsal failed:',e.name,'after',steps.at(-1)||'startup','(details suppressed to protect credentials)');process.exitCode=1;}
finally {
 await browser?.close();
 if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(r=>server.once('exit',r));}
 await db?.end();await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin.end();
 console.log('Temporary server stopped and rehearsal schema removed.');
 console.log(`Private rehearsal evidence: ${evidence}`);
}
