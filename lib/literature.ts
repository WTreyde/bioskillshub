import {readFile} from 'node:fs/promises';
import {z} from 'zod';
import {draftSchema,validateContent} from './validation';
import {seedCatalog} from './seed-catalog';
const entrySchema=draftSchema.omit({content:true}).extend({id:z.string().regex(/^bp-[a-z0-9-]+$/),file:z.string().regex(/^[a-z0-9-]+\.md$/),source:z.object({authors:z.string().min(1),year:z.string().regex(/^\d{4}$/),title:z.string().min(1),doi:z.string().regex(/^10\.\d{4,9}\/\S+$/),url:z.string().url(),license:z.string().min(1),checked:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})});
export async function loadLiterature(){
 const root=new URL('../science/literature/',import.meta.url);
 const entries=z.array(entrySchema).min(1).parse(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
 if(new Set(entries.map(e=>e.id)).size!==entries.length)throw Error('Duplicate literature IDs');
 return Promise.all(entries.map(async entry=>{
  const content=await readFile(new URL(entry.file,root),'utf8');
  draftSchema.parse({...entry,content});validateContent(content);
  if(entry.source.url!==`https://doi.org/${entry.source.doi}`||!content.includes(entry.source.url)||!content.includes('not experimentally validated'))throw Error('Literature provenance or status is missing');
  return {...entry,content};
 }));
}
export async function seedLiterature(owner:string,apply=false){return seedCatalog(owner,await loadLiterature(),apply);}
