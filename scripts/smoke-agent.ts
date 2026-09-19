// Real HTTP + Python client smoke test; uses a temporary identity and never prints credentials.
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFile,mkdir} from 'node:fs/promises';
import {query,pool} from '../lib/db';
import {hash,secret,passwordHash} from '../lib/auth';
const user=`smoke-${randomUUID()}`;const token=`bsh_${secret()}`;
try{
 await query('INSERT INTO users VALUES($1,$2,$3,$4)',[user,'Smoke test','Ephemeral test identity',passwordHash(secret())]);
 await query('INSERT INTO entitlements(user_id,skill_id) VALUES($1,$2)',[user,'imagej-foci']);
 await query('INSERT INTO api_tokens(id,user_id,name,token_hash) VALUES($1,$2,$3,$4)',[randomUUID(),user,'Smoke test',hash(token)]);
 await mkdir('results/agent-smoke',{recursive:true});
 const env={...process.env,BIOSKILLS_URL:process.env.APP_ORIGIN||'http://localhost:3000',BIOSKILLS_TOKEN:token};
 const list=JSON.parse(execFileSync('python3',['scripts/agent_client.py','list'],{env,encoding:'utf8'}));
 if(list.skills.length!==1||list.skills[0].id!=='imagej-foci')throw new Error('Agent list did not match entitlement.');
 execFileSync('python3',['scripts/agent_client.py','get','imagej-foci','1','--output','results/agent-smoke/SKILL.md'],{env,stdio:'pipe'});
 const manifest=JSON.parse(await readFile('results/agent-smoke/SKILL.md.manifest.json','utf8'));
 if(manifest.number!==1||manifest.skill_id!=='imagej-foci')throw new Error('Wrong provenance.');
 await query('UPDATE api_tokens SET revoked_at=now() WHERE user_id=$1',[user]);
 let rejected=false;try{execFileSync('python3',['scripts/agent_client.py','list'],{env,stdio:'pipe'});}catch{rejected=true;}if(!rejected)throw new Error('Revoked token was accepted.');
 console.log('PASS: real HTTP list, pinned download, provenance hash and immediate revocation.');
}finally{await query('DELETE FROM api_tokens WHERE user_id=$1',[user]);await query('DELETE FROM entitlements WHERE user_id=$1',[user]);await query('DELETE FROM users WHERE id=$1',[user]);await pool.end();}
