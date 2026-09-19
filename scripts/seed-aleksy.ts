import {parseArgs} from 'node:util';
import {pool} from '../lib/db';
import {seedAleksy} from '../lib/aleksy';
async function main(){
 const {values}=parseArgs({options:{apply:{type:'boolean',default:false}},strict:true,allowPositionals:false});
 const plan=await seedAleksy(values.apply);
 console.log(values.apply?'Aleksy catalogue import complete.':'Dry run only; pass --apply to import the Aleksy contributor workflow.');
 for(const item of plan)console.log(`${item.id}: ${item.status}`);
}
main().catch(()=>{console.error('Aleksy import failed. Check database access, profile-name conflicts and existing content. No partial changes applied.');process.exitCode=1;}).finally(()=>pool.end());
