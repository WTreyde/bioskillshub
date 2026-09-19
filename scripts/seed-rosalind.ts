import {parseArgs} from 'node:util';
import {pool} from '../lib/db';
import {seedRosalind} from '../lib/rosalind';
async function main(){
 const {values}=parseArgs({options:{owner:{type:'string'},apply:{type:'boolean',default:false}},strict:true,allowPositionals:false});
 if(!values.owner)throw Error('Usage: npm run db:seed-rosalind -- --owner EXISTING_ACCOUNT_ID [--apply]');
 const plan=await seedRosalind(values.owner,values.apply);
 console.log(values.apply?'Rosalind import complete.':'Dry run only; pass --apply to publish these free unverified Workbench skills.');
 for(const item of plan)console.log(`${item.id}: ${item.status}`);
}
main().catch(()=>{console.error('Rosalind import failed. Check the owner, database connection, source files and existing skill conflicts. Nothing was overwritten.');process.exitCode=1;}).finally(()=>pool.end());
