import {zipSync,strToU8} from 'fflate';
import {agentSkillMetadata,makeAgentSkill} from './agent-skill-format';
import {hash,HttpError} from './auth';
export function skillPackage(version:{skill_id:string;number:number;title:string;summary:string;content:string}){
 let content:string;try{content=makeAgentSkill(version.content,version.title,version.summary);}catch(e){throw new HttpError(400,`This release needs corrected Agent Skills metadata: ${(e as Error).message}`);}
 const {name}=agentSkillMetadata(content);
 const provenance={skill_id:version.skill_id,number:version.number,source_sha256:hash(version.content),package_skill_sha256:hash(content),metadata_added:content!==version.content,format:'Agent Skills',specification:'https://agentskills.io/specification',note:'Format validation is not scientific validation or an eval-harness result. Supporting source text remains inside SKILL.md; no scripts are executed.'};
 const options={mtime:new Date('2026-01-01T00:00:00Z')};
 const bytes=zipSync({[`${name}/SKILL.md`]:[strToU8(content),options],[`${name}/bioskillshub-provenance.json`]:[strToU8(JSON.stringify(provenance,null,2)),options]});
 return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/zip','Content-Disposition':`attachment; filename="${name}-v${version.number}.zip"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
