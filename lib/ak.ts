import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {seedCatalog} from './seed-catalog';
export async function loadak(){
 const root=new URL('../science/ak/',import.meta.url);
 const schema=draftSchema.omit({content:true}).extend({id:z.literal('ak-ml-chemical-reaction-prediction'),source_file:z.literal('ml-chemical-reaction-prediction-workflow.md'),source_sha256:z.string().regex(/^[a-f0-9]{64}$/)});
 const [entry]=z.array(schema).length(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 const original=await readFile(new URL('original.md',root));const content=await readFile(new URL('SKILL.md',root),'utf8');
 if(createHash('sha256').update(original).digest('hex')!==entry.source_sha256||!content.endsWith(original.toString('utf8')))throw Error('Contributor attachment changed');
 draftSchema.parse({...entry,content});validateContent(content);return [{...entry,content}];
}
export async function seedak(apply=false){return seedCatalog('ak',await loadak(),apply,{name:'ak',expertise:'Contributor · chemical reaction prediction workflow',reassignMatching:false});}
