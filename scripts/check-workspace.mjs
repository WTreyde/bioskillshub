import os from 'node:os';
import fs from 'node:fs';
import pg from 'pg';
const allocation={efe:[3001,5439],leandre:[3002,5440],maxim:[3003,5441],wojtek:[3004,5442],integration:[3000,5438]};
const username=os.userInfo().username;
const expected=allocation[username];
const checks={personalAccount:Boolean(expected),node22:Number(process.versions.node.split('.')[0])>=22,privateEnv:false,allocatedPorts:false,database:false};
let db;
try{
 checks.privateEnv=(fs.statSync('.env').mode&0o077)===0;
 const url=new URL(process.env.DATABASE_URL);
 const origin=new URL(process.env.APP_ORIGIN);
 checks.allocatedPorts=Boolean(expected&&['localhost','127.0.0.1'].includes(url.hostname)&&Number(url.port)===expected[1]&&Number(origin.port)===expected[0]&&['localhost','127.0.0.1'].includes(origin.hostname));
 if(checks.allocatedPorts){db=new pg.Client({connectionString:url.toString(),connectionTimeoutMillis:5000});await db.connect();await db.query('SELECT 1');checks.database=true;}
}catch{/* Print only checklist booleans, never connection details. */}
finally{await db?.end();}
console.log(JSON.stringify({account:username,checks,scope:'Local shell/configuration check; browser login and laptop SSH are separate checks.'},null,2));
if(Object.values(checks).some(ok=>!ok))process.exitCode=1;
