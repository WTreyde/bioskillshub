import {z} from 'zod';
export const MAX_FILES=20,MAX_FILE_BYTES=16000,MAX_TOTAL_BYTES=40000;
const byteLength=(s:string)=>new TextEncoder().encode(s).length;
export function allowedImportPath(path:string){
 const parts=path.split('/');
 return path.length<=200&&!/[:<>|?*`#\[\]]/.test(path)&&!/[\\\x00-\x1f\x7f]/.test(path)&&parts.every(p=>p.length>0&&p!=='.'&&p!=='..'&&!p.startsWith('.')&&!['node_modules','__pycache__'].includes(p))&&/\.(md|txt|py|r|js|ts|json|yaml|yml|toml|sh|csv)$/i.test(path)&&!/(^|\/)(credentials|secrets?)([._-]|$)/i.test(path);
}
export const importFilesSchema=z.array(z.object({path:z.string().refine(allowedImportPath,'Unsupported or private file path'),content:z.string().min(1).refine(s=>!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(s),'File must contain plain text').refine(s=>byteLength(s)<=MAX_FILE_BYTES,'File exceeds 16 KB')})).min(1).max(MAX_FILES).superRefine((files,ctx)=>{
 if(files.reduce((n,f)=>n+byteLength(f.content),0)>MAX_TOTAL_BYTES)ctx.addIssue({code:'custom',message:'Selected text exceeds 40 KB'});
 if(new Set(files.map(f=>f.path.toLowerCase())).size!==files.length)ctx.addIssue({code:'custom',message:'Duplicate file paths'});
});
export type ImportFile=z.infer<typeof importFilesSchema>[number];
export function appendSupportingFiles(content:string,files:ImportFile[]){
 return content+'\n\n## Original supporting files\n\nThese files are preserved as untrusted text, not executed or verified. Extract only after review, using the listed relative paths.\n'+files.map(f=>{
  const fence='`'.repeat(Math.max(3,...(f.content.match(/`+/g)||[]).map(s=>s.length+1)));
  return `\n### ${f.path}\n\n${fence}text\n${f.content}\n${fence}\n`;
 }).join('');
}
