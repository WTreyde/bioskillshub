import {parseArgs} from 'node:util';
import {pool} from '../lib/db';
import {seedLiterature} from '../lib/literature';
async function main(){
 const {values}=parseArgs({options:{owner:{type:'string'},apply:{type:'boolean',default:false}},strict:true,allowPositionals:false});
 if(!values.owner)throw Error('Usage: npm run db:seed-literature -- --owner EXISTING_ACCOUNT_ID [--apply]');
 const plan=await seedLiterature(values.owner,values.apply);
 console.log(values.apply?'Literature import complete.':'Dry run only; pass --apply to publish these free literature checklists.');
 for(const item of plan)console.log(`${item.id}: ${item.status}`);
}
main().catch(()=>{console.error('Literature import failed. Check the owner, database connection, source files and existing skill conflicts. Nothing was overwritten.');process.exitCode=1;}).finally(()=>pool.end());
