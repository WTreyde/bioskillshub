// Read the source database, restore into a uniquely named disposable database, then drop only that database.
import pg from 'pg';
import {randomUUID,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdir,chmod,writeFile} from 'node:fs/promises';
import path from 'node:path';

let source:URL;
try{source=new URL(process.env.DATABASE_URL||'');}catch{console.error('Set a valid private DATABASE_URL before recovery verification.');process.exit(1);}
if(!['localhost','127.0.0.1','::1'].includes(source.hostname))throw Error('Recovery verification requires a local database or SSH tunnel.');
if(process.argv[2]!=='--confirm-local')throw Error('Pass --confirm-local after checking DATABASE_URL points to your personal database.');
const target=`bsh_restore_${randomUUID().replaceAll('-','')}`;
const directory=path.resolve('.local/recovery',target);
const tables=['users','skills','versions','drafts','entitlements','api_tokens','sessions','rate_limits','ai_usage','github_identities','oauth_states'];
const client=new pg.Client({connectionString:source.toString()});
let restored:pg.Client|undefined,created=false,connected=false,stage='connect';
const env={...process.env,PGHOST:source.hostname,PGPORT:source.port||'5432',PGUSER:decodeURIComponent(source.username),PGPASSWORD:decodeURIComponent(source.password),PGDATABASE:decodeURIComponent(source.pathname.slice(1)),PGOPTIONS:''};
function tool(binary:string,args:string[]){try{execFileSync(binary,args,{env,stdio:['ignore','pipe','pipe'],timeout:120000});}catch{throw Error('PostgreSQL backup/restore command failed; inspect local configuration privately.');}}
async function fingerprint(db:pg.Client){
 const values:Record<string,{rows:number;sha256:string}>={};
 for(const table of tables){
  const result=await db.query(`SELECT row_to_json(t)::text AS row FROM public.${table} t ORDER BY row_to_json(t)::text`);
  values[table]={rows:result.rowCount||0,sha256:createHash('sha256').update(JSON.stringify(result.rows.map(r=>r.row))).digest('hex')};
 }
 return values;
}
try{
 await client.connect();connected=true;await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);
 // Export one snapshot for both pg_dump and source fingerprints, even if writers are active.
 stage='snapshot';
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 const snapshot=(await client.query('SELECT pg_export_snapshot() AS snapshot')).rows[0].snapshot;
 const before=await fingerprint(client);
 const backup=path.join(directory,'database.dump');
 stage='backup';
 tool(process.env.PG_DUMP_BIN||'pg_dump',['--format=custom','--no-owner','--no-privileges',`--snapshot=${snapshot}`,`--file=${backup}`]);
 await chmod(backup,0o600);await client.query('COMMIT');
 stage='create disposable database';
 await client.query(`CREATE DATABASE ${target}`);created=true;
 stage='restore';
 tool(process.env.PG_RESTORE_BIN||'pg_restore',['--exit-on-error','--no-owner','--no-privileges','--dbname',target,backup]);
 const restoredUrl=new URL(source);restoredUrl.pathname=`/${target}`;restoredUrl.search='';
 restored=new pg.Client({connectionString:restoredUrl.toString()});await restored.connect();
 stage='verify';
 const after=await fingerprint(restored);
 if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Restored database contents differ from the backup snapshot.');
 const trigger=await restored.query("SELECT 1 FROM pg_trigger WHERE tgname='immutable_versions' AND tgrelid='public.versions'::regclass AND tgenabled='O'");
 if(trigger.rowCount!==1)throw Error('Restored database lacks the published-version immutability trigger.');
 await writeFile(path.join(directory,'verification.json'),JSON.stringify({verified_at:new Date().toISOString(),source:'local personal database',tables:before,immutable_trigger:true,backup:'database.dump'},null,2),{mode:0o600});
 console.log('PASS: backup restored; all eleven tables match the snapshot and the immutability trigger is enabled.');
 console.log(`Private evidence: ${directory}`);
}catch(error){console.error(`Recovery verification failed during ${stage}; no source data was changed.`);process.exitCode=1;}
finally{
 await restored?.end();
 try{if(connected){await client.query('ROLLBACK');if(created){await client.query(`DROP DATABASE ${target} WITH (FORCE)`);console.log('Disposable restore database removed.');}}}
 catch{console.error(`Cleanup failed; administrator should inspect disposable database ${target}.`);process.exitCode=1;}
 finally{await client.end();}
}
