import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {seedCatalog} from './seed-catalog';
const schema=draftSchema.omit({content:true}).extend({id:z.literal('anthropic-protein-binder-design'),source_url:z.string().url(),source_revision:z.string().regex(/^[a-f0-9]{40}$/),source_license:z.literal('CC BY 4.0')});
export async function loadAnthropic(){
 const root=new URL('../science/anthropic/',import.meta.url);
 const [entry]=z.array(schema).length(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 const content=await readFile(new URL('SKILL.md',root),'utf8');draftSchema.parse({...entry,content});validateContent(content);
 const expected=`https://huggingface.co/datasets/Anthropic/claude-protein-binder-design/blob/${entry.source_revision}/prompts/README.md`;
 if(entry.source_url!==expected||!content.includes(expected)||!content.includes('Execution unverified')||!content.includes(entry.source_license))throw Error('Missing source, licence or execution status');
 return [{...entry,content}];
}
export async function seedAnthropic(apply=false){return seedCatalog('anthropic',await loadAnthropic(),apply,{name:'Anthropic',expertise:'BioSkillsHub source attribution collection · not an official Anthropic account',reassignMatching:false});}
