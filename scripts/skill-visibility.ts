import {pool} from '../lib/db';
import {listSkillVisibility,setSkillVisibility} from '../lib/skill-visibility';

const usage='Use --list, or --hide/--show --id EXACT_ID [--id EXACT_ID ...] [--apply]. Changes default to a dry run.';
try{
 const args=process.argv.slice(2);
 if(!args.length||(args.length===1&&args[0]==='--list')){
  console.log(JSON.stringify(await listSkillVisibility(),null,2));
 }else{
  const action=args.shift();if(action!=='--hide'&&action!=='--show')throw Error(usage);
  const ids:string[]=[];let apply=false;
  while(args.length){
   const flag=args.shift();
   if(flag==='--apply'&&!apply){apply=true;continue;}
   if(flag==='--id'&&args[0]&&!args[0].startsWith('--')){ids.push(args.shift()!);continue;}
   throw Error(usage);
  }
  if(!ids.length)throw Error(usage);
  console.log(JSON.stringify(await setSkillVisibility(ids,action==='--hide',apply),null,2));
  console.log(apply?'Visibility updated; releases and entitlements preserved.':'Dry run only; pass --apply to change visibility.');
 }
}catch{console.error('Visibility operation failed; no partial changes applied. '+usage);process.exitCode=1;}
finally{await pool.end();}
