import { z } from 'zod';
import {MAX_SKILL_BYTES} from './upload-limits';
import {domains} from './domains';
export const fields=['Use cases','Inputs','Outputs','Procedure','Expert decisions','Limitations','Examples'] as const;
export const draftSchema=z.object({title:z.string().trim().min(5).max(120),summary:z.string().trim().min(20).max(600),domain:z.enum(domains),price_cents:z.number().int().min(0).max(100000),content:z.string().min(1).refine(s=>s.trim().length>0,'Skill instructions must not be empty').max(MAX_SKILL_BYTES).refine(s=>new TextEncoder().encode(s).length<=MAX_SKILL_BYTES,'Skill exceeds 300 KB'),validation:z.string().trim().min(5).max(200).default('Expert review pending'),release_notes:z.string().max(500).default('')});
export function missingContentFields(content:string){return fields.filter(f=>!new RegExp(`^## ${f}\\s*\\n\\s*\\S`,'m').test(content));}
export function validateContent(content:string,requireSections=true) {
 if(content.includes('\0')) throw new Error('Content must be plain UTF-8 Markdown.');
 if(!content.trim())throw new Error('Skill instructions must not be empty.');
 if(!requireSections)return;
 const missing=missingContentFields(content);
 if(missing.length) throw new Error(`Missing nonempty Markdown sections: ${missing.join(', ')}. Retry AI generation or edit the draft to complete the suggested structure.`);
}
export const guidedSchema=z.object({title:z.string().min(5).max(120),answers:z.record(z.string(),z.string().trim().min(5).max(4000))});
export function scaffold(title:string, answers:Record<string,string>) {for(const f of fields) if(!answers[f]?.trim()) throw new Error(`Please complete ${f}.`);return `# ${title}\n\n`+fields.map(f=>`## ${f}\n${answers[f]}\n`).join('\n');}
