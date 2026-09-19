import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {pool,query} from '../lib/db';
import {passwordHash,secret} from '../lib/auth';
import {saveDraft,publish} from '../lib/catalog';
async function main(){
 await query(await readFile(new URL('../db/schema.sql',import.meta.url),'utf8'));
 const people=[['efe','Efe','Computer science · platform engineering'],['leandre','Leandre','Genomics · fluorescence microscopy'],['maxim','Maxim','PDBe, EMBL-EBI · structural biology'],['wojtek','Wojtek','Computational chemistry · molecular assessment']];
 const credentials:string[]=[];
 for(const [id,name,expertise] of people){if((await query('SELECT id FROM users WHERE id=$1',[id])).length)continue;const password=secret().slice(0,22);await query('INSERT INTO users(id,name,expertise,password_hash) VALUES($1,$2,$3,$4)',[id,name,expertise,passwordHash(password)]);credentials.push(`${name}: ${password}`);}
 if(credentials.length){await mkdir('.local',{recursive:true,mode:0o700});await writeFile(`.local/team-credentials-${Date.now()}.txt`,credentials.join('\n')+'\n',{mode:0o600});console.log('New team credentials saved in .local/ (private; do not commit).');}
 const samples=[{id:'imagej-foci',owner:'leandre',file:'imagej',title:'Nuclei segmentation & foci counting',summary:'A fluorescence microscopy workflow for segmenting nuclei, counting foci and preserving biological replicates through analysis.',domain:'Imaging',validation:'Protocol awaiting Leandre’s validation',price_cents:500},{id:'admet-assessment',owner:'wojtek',file:'admet',title:'Expert-guided ADMET assessment',summary:'Prepare molecular inputs and interpret endpoint-specific predictions with BioNeMo KERMT. Includes applicability and checkpoint checks.',domain:'Chemistry',validation:'Endpoint checkpoint verification pending',price_cents:800}];
 for(const s of samples){if((await query('SELECT id FROM skills WHERE id=$1',[s.id])).length)continue;await query('INSERT INTO skills(id,owner_id) VALUES($1,$2)',[s.id,s.owner]);await saveDraft(s.owner,{...s,content:await readFile(new URL(`../science/${s.file}/SKILL.md`,import.meta.url),'utf8'),release_notes:'Prototype protocol; see validation status'},s.id);await publish(s.owner,s.id);}
 console.log('Database ready: four team accounts and two clearly labelled prototype skills.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>pool.end());
