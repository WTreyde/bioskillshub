import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {seedCatalog} from './seed-catalog';
export async function loadAleksy(){
 const root=new URL('../science/aleksy/',import.meta.url);
 const schema=draftSchema.omit({content:true}).extend({id:z.literal('aleksy-ml-chemical-reaction-prediction'),source_file:z.literal('ml-chemical-reaction-prediction-workflow.md'),source_sha256:z.string().regex(/^[a-f0-9]{64}$/)});
 const [entry]=z.array(schema).length(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 const original=await readFile(new URL('original.md',root));const content=await readFile(new URL('SKILL.md',root),'utf8');
 if(createHash('sha256').update(original).digest('hex')!==entry.source_sha256||!content.endsWith(original.toString('utf8')))throw Error('Contributor attachment changed');
 draftSchema.parse({...entry,content});validateContent(content);return [{...entry,content}];
}
export async function seedAleksy(apply=false){return seedCatalog('aleksy-kwiatkowski',await loadAleksy(),apply,{name:'Aleksy Kwiatkowski',expertise:'Contributor · chemical reaction prediction workflow',reassignMatching:false});}
