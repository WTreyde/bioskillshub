import {parseArgs} from 'node:util';
import {pool} from '../lib/db';
import {seedak} from '../lib/ak';
async function main(){
 const {values}=parseArgs({options:{apply:{type:'boolean',default:false}},strict:true,allowPositionals:false});
 const plan=await seedak(values.apply);
 console.log(values.apply?'ak catalogue import complete.':'Dry run only; pass --apply to import the ak contributor workflow.');
 for(const item of plan)console.log(`${item.id}: ${item.status}`);
}
main().catch(()=>{console.error('ak import failed. Check database access, profile-name conflicts and existing content. No partial changes applied.');process.exitCode=1;}).finally(()=>pool.end());
