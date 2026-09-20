import {parseDocument,stringify} from 'yaml';
import {z} from 'zod';

const name=z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase letters, digits and single hyphens, up to 64 characters.');
const metadataSchema=z.object({
 name,description:z.string().trim().min(1).max(1024),license:z.string().optional(),
 compatibility:z.string().min(1).max(500).optional(),metadata:z.record(z.string(),z.string()).optional(),
 'allowed-tools':z.string().optional(),
}).strict();
export function agentSkillMetadata(content:string){
 if(content.includes('\0'))throw Error('Skill content must be plain text.');
 const match=/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(content);
 if(!match)throw Error('Add YAML frontmatter with name and description.');
 if(!match[2].trim())throw Error('Include skill instructions after the YAML frontmatter.');
 const document=parseDocument(match[1],{schema:'core',uniqueKeys:true});
 if(document.errors.length||document.warnings.length)throw Error('Correct the YAML frontmatter.');
 let data:unknown;try{data=document.toJS({maxAliasCount:0});}catch{throw Error('YAML aliases are not supported.');}
 const parsed=metadataSchema.safeParse(data);
 if(!parsed.success)throw Error(parsed.error.issues.map(i=>`${i.path.join('.')||'frontmatter'}: ${i.message}`).join('; '));
 return parsed.data;
}
export function agentSkillIssue(content:string){try{agentSkillMetadata(content);return '';}catch(e){return (e as Error).message;}}
export function makeAgentSkill(content:string,title:string,description:string){
 if(!agentSkillIssue(content))return content;
 // Never silently discard or rewrite an existing (possibly invalid) metadata block.
 if(/^\uFEFF?---\r?\n/.test(content))throw Error('Correct the existing Agent Skills frontmatter, or use AI conversion and review the result.');
 if(!content.trim()||content.includes('\0'))throw Error('Enter nonempty Markdown instructions first.');
 const slug=title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64).replace(/-$/,'')||'scientific-skill';
 const metadata=metadataSchema.parse({name:slug,description:description.trim()});
 return `---\n${stringify(metadata)}---\n${content}`;
}
export const agentSkillsPrompt='Use the Agent Skills format: YAML frontmatter with name (1–64 lowercase ASCII letters, digits and single hyphens; no leading/trailing hyphen) and description (1–1024 characters explaining what and when), followed by Markdown instructions. Preserve supplied attribution/licensing. Do not invent tools, evidence or results. Put any extra metadata in a string-to-string metadata mapping.';
