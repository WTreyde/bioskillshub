'use client';
import {useRef,useState,type InputHTMLAttributes} from 'react';
import {allowedImportPath,importFilesSchema,MAX_FILE_BYTES,type ImportFile} from '@/lib/import-files';
import type {ChatDraft} from '@/lib/skill-chat';
export function SkillImport({request,onUse,enabled,aiLabel}:{request:(data:Record<string,unknown>)=>Promise<{message:string;draft:ChatDraft}>;onUse:(draft:ChatDraft)=>void;enabled:boolean;aiLabel:string}){
 const [files,setFiles]=useState<ImportFile[]>([]),[notes,setNotes]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[result,setResult]=useState<{message:string;draft:ChatDraft}|null>(null);
 const pending=useRef(false);
 async function select(selected:FileList|null){
  if(!selected||pending.current)return;
  pending.current=true;setBusy(true);setError('');setResult(null);setConsent(false);setFiles([]);setNotice('');
  try{
   const all=Array.from(selected),accepted=all.filter(f=>allowedImportPath(f.webkitRelativePath||f.name));
   if(accepted.length>20)throw Error('Select at most 20 supported text files.');
   if(accepted.some(f=>f.size>MAX_FILE_BYTES))throw Error('Each file must be at most 16 KB.');
   if(accepted.reduce((n,f)=>n+f.size,0)>40000)throw Error('Select at most 40 KB of text.');
   const loaded=await Promise.all(accepted.map(async f=>({path:f.webkitRelativePath||f.name,content:new TextDecoder('utf-8',{fatal:true}).decode(await f.arrayBuffer())})));
   const parsed=importFilesSchema.safeParse(loaded);if(!parsed.success)throw Error('Select supported UTF-8 text files with unique paths (16 KB each, 40 KB total).');
   setFiles(parsed.data);setNotice(`${parsed.data.length} files selected locally. ${all.length-accepted.length} unsupported or private-path files skipped. Nothing has been sent yet.`);
  }catch(e){setError((e as Error).message);}
  finally{pending.current=false;setBusy(false);}
 }
 async function analyze(){
  if(pending.current)return;
  pending.current=true;setBusy(true);setError('');setResult(null);
  try{const payload={files,notes,confirmed:consent};if(new TextEncoder().encode(JSON.stringify(payload)).length>85000)throw Error('Encoded request is too large; select fewer files.');setNotice('Sending selected files for AI analysis…');setResult(await request(payload));setNotice('AI analysis returned. Review the converted draft below; nothing has been saved.');}
  catch(e){setNotice('Analysis did not complete. Your selected files remain available for review or retry.');setError((e as Error).message);}finally{pending.current=false;setBusy(false);}
 }
 return <section className="skill-import"><h3>Turn files into a skill</h3><p>Select a Markdown skill or a folder containing instructions and scripts. AI will analyse the text and propose our required sections. Nothing is executed. Original files are included as text in the resulting Markdown for later inspection and extraction.</p><p>{aiLabel} Up to 20 UTF-8 files, 16 KB each and 40 KB total. Supports md, txt, py, R, js, ts, json, yaml, yml, toml, sh and csv. Archives, binary files, hidden paths and common private filenames are excluded.</p><div className="form-row"><label>Choose skill files<input type="file" multiple disabled={busy} onChange={e=>{void select(e.target.files);e.target.value='';}}/></label><label>Choose skill folder<input type="file" multiple {...({webkitdirectory:'',directory:''} as InputHTMLAttributes<HTMLInputElement>)} disabled={busy} onChange={e=>{void select(e.target.files);e.target.value='';}}/></label></div>{notice&&<p role="status">{notice}</p>}{error&&<p className="error" role="alert">{error}</p>}<div className="import-file-list">{files.map(f=><div key={f.path}><details><summary>{f.path} · {new TextEncoder().encode(f.content).length} bytes</summary><pre className="skill-content">{f.content}</pre></details><button className="text-button" disabled={busy} aria-label={`Remove ${f.path}`} onClick={()=>{setFiles(files.filter(x=>x.path!==f.path));setConsent(false);setResult(null);}}>Remove</button></div>)}</div><label>Context for the imported workflow<textarea rows={3} value={notes} maxLength={2000} disabled={busy} onChange={e=>{setNotes(e.target.value);setResult(null);}} placeholder="Describe the intended task and anything the files leave unclear."/></label><p>Review every selected file above. Filename filtering cannot detect all secrets. Remove credentials, private datasets and anything you cannot share. Selected contents are sent through BioSkillsHub to OpenAI only when you click Analyse files with AI; API charges may apply. Selection is temporary and clears when you leave this importer.</p><label className="check"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/> I reviewed these files, have permission to share them, and agree to send their contents to OpenAI for analysis.</label>{!enabled&&<p>Connect an API key in AI settings, or use Upload / edit Markdown without AI.</p>}<button className="primary" disabled={busy||!enabled||!consent||!files.length} onClick={analyze}>{busy?'Working…':'Analyse files with AI'}</button>{result&&<section className="chat-preview"><h4>Review converted skill: {result.draft.title}</h4><p className="preserve-text">{result.message}</p><p>{result.draft.summary}</p><pre className="skill-content">{result.draft.content}</pre><p>Check the instructions, source code, dependencies and scientific claims. AI analysis is not a security audit. Nothing has been saved or published.</p><button className="primary" disabled={busy} onClick={()=>onUse(result.draft)}>Use imported draft in editor</button></section>}</section>;
}
