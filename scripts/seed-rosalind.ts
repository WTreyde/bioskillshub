import {parseArgs} from 'node:util';
import {pool} from '../lib/db';
import {seedRosalind} from '../lib/rosalind';
async function main(){
 const {values}=parseArgs({options:{owner:{type:'string'},apply:{type:'boolean',default:false}},strict:true,allowPositionals:false});
 if(values.owner&&values.owner!=='rosalind')throw Error('Rosalind skills must use owner rosalind. Omit --owner.');
 const plan=await seedRosalind(values.apply);
 console.log(values.apply?'Rosalind import complete.':'Dry run only; pass --apply to publish these free unverified Workbench skills.');
 for(const item of plan)console.log(`${item.id}: ${item.status}`);
}
main().catch(()=>{console.error('Rosalind import failed. Omit --owner (or use rosalind). Check account-name collisions, source files, saved drafts and changed releases. No partial changes applied.');process.exitCode=1;}).finally(()=>pool.end());
