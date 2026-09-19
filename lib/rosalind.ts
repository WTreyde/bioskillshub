import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {seedCatalog} from './seed-catalog';
const schema=draftSchema.omit({content:true}).extend({id:z.string().regex(/^rosalind-[a-z0-9-]+$/),file:z.string().regex(/^[a-z0-9-]+\.md$/),source_url:z.literal('https://developers.openai.com/blog/rosalind-workbench')});
export async function loadRosalind(){
 const root=new URL('../science/rosalind/',import.meta.url);
 const entries=z.array(schema).min(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 return Promise.all(entries.map(async entry=>{
  const content=await readFile(new URL(entry.file,root),'utf8');draftSchema.parse({...entry,content});validateContent(content);
  if(!content.includes(entry.source_url)||!content.includes('Workbench execution unverified')||!entry.validation.includes('Workbench execution unverified'))throw Error('Missing source or integration status');
  return {...entry,content};
 }));
}
export async function seedRosalind(apply=false){return seedCatalog('rosalind',await loadRosalind(),apply,{name:'Rosalind',expertise:'BioSkillsHub Workbench workflow collection · not an official OpenAI account',reassignMatching:true});}
