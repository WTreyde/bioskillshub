import {z} from 'zod';
import {MAX_FILES,MAX_FILE_BYTES,MAX_TOTAL_BYTES} from './upload-limits';
export {MAX_FILES,MAX_FILE_BYTES,MAX_TOTAL_BYTES} from './upload-limits';
const byteLength=(s:string)=>new TextEncoder().encode(s).length;
export function allowedImportPath(path:string){
 const parts=path.split('/');
 return path.length<=200&&!/[:<>|?*`#\[\]]/.test(path)&&!/[\\\x00-\x1f\x7f]/.test(path)&&parts.every(p=>p.length>0&&p!=='.'&&p!=='..'&&!p.startsWith('.')&&!['node_modules','__pycache__','__MACOSX'].includes(p))&&!/\.(pem|key|p12|pfx|zip|gz|7z|rar|tar)$/i.test(path)&&!/(^|\/)(credentials|secrets?)([._-]|$)/i.test(path);
}
export const importFilesSchema=z.array(z.object({path:z.string().refine(allowedImportPath,'Unsupported or private file path'),content:z.string().min(1).refine(s=>!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(s),'File must contain plain text').refine(s=>byteLength(s)<=MAX_FILE_BYTES,'File exceeds 200 KB')})).min(1).max(MAX_FILES).superRefine((files,ctx)=>{
 if(files.reduce((n,f)=>n+byteLength(f.content),0)>MAX_TOTAL_BYTES)ctx.addIssue({code:'custom',message:'Selected text exceeds 200 KB'});
 if(new Set(files.map(f=>f.path.toLowerCase())).size!==files.length)ctx.addIssue({code:'custom',message:'Duplicate file paths'});
});
export type ImportFile=z.infer<typeof importFilesSchema>[number];
export function appendSupportingFiles(content:string,files:ImportFile[]){
 return content+'\n\n## Original supporting files\n\nThese files are preserved as untrusted text, not executed or verified. Extract only after review, using the listed relative paths.\n'+files.map(f=>{
  const fence='`'.repeat((f.content.match(/`+/g)||[]).reduce((n,s)=>Math.max(n,s.length+1),3));
  return `\n### ${f.path}\n\n${fence}text\n${f.content}\n${fence}\n`;
 }).join('');
}
