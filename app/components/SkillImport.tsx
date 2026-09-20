'use client';
import {useRef,useState} from 'react';
import type {ImportFile} from '@/lib/import-files';
import {readImportUpload} from '@/lib/import-upload';
import {MAX_TOTAL_BYTES,MAX_JSON_BYTES,MAX_ZIP_BYTES} from '@/lib/upload-limits';
import {AIPrivacyNotice} from './AIPrivacyNotice';
import type {ChatDraft} from '@/lib/skill-chat';
export function SkillImport({request,onUse,enabled,aiLabel,initialFiles=[]}:{request:(data:Record<string,unknown>)=>Promise<{message:string;draft:ChatDraft}>;onUse:(draft:ChatDraft)=>void;enabled:boolean;aiLabel:string;initialFiles?:ImportFile[]}){
 const [files,setFiles]=useState<ImportFile[]>(initialFiles),[notes,setNotes]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(initialFiles.length?`${initialFiles.length} files selected locally. Nothing has been sent yet.`:''),[result,setResult]=useState<{message:string;draft:ChatDraft}|null>(null);
 const pending=useRef(false);
 async function select(selected:FileList|null){
  if(!selected||pending.current)return;
  pending.current=true;setBusy(true);setError('');setResult(null);setConsent(false);setFiles([]);setNotice('');
  try{
   if(selected.length!==1)throw Error('Upload either a single source file or a ZIP-compressed folder.');
   const file=selected[0];const isZip=file.name.toLowerCase().endsWith('.zip');if(file.size>(isZip?MAX_ZIP_BYTES:MAX_TOTAL_BYTES))throw Error(isZip?'ZIP upload exceeds 1 MB.':'Upload at most 200 KB.');
   const parsed=readImportUpload(file.name,new Uint8Array(await file.arrayBuffer()));
   setFiles(parsed.files);setNotice(`${parsed.files.length} files selected locally. ${parsed.skipped} binary, empty or private/unsupported-path files skipped. Nothing has been sent yet.`);
  }catch(e){setError((e as Error).message);}
  finally{pending.current=false;setBusy(false);}
 }
 async function analyze(){
  if(pending.current)return;
  pending.current=true;setBusy(true);setError('');setResult(null);
  try{const payload={files,notes,confirmed:consent};if(new TextEncoder().encode(JSON.stringify(payload)).length>MAX_JSON_BYTES-5000)throw Error('Encoded request is too large; select fewer files.');setNotice('Sending selected files for AI analysis…');setResult(await request(payload));setNotice('AI analysis returned. Review the converted draft below; nothing has been saved.');}
  catch(e){setNotice('Analysis did not complete. Your selected files remain available for review or retry.');setError((e as Error).message);}finally{pending.current=false;setBusy(false);}
 }
 return <section className="skill-import"><h3>Turn files into a skill</h3><p>Upload either a single file or a ZIP-compressed folder. For a workflow with multiple files, compress the folder into a .zip file first. Source files in any programming language are accepted, including Java, C++, Python and R, as long as they contain UTF-8 text.</p><p>{aiLabel} A single source file can be up to 200 KB (200,000 bytes). ZIP uploads can be up to 1 MB, with at most 1,000 archive entries. After excluding private paths and folder entries, at most 100 files and 200 KB of expanded content are allowed. Hidden/private paths, binary files, empty files and nested archives are skipped. Encrypted ZIPs and symbolic links are unsupported.</p><p>AI proposes our required skill sections. Nothing is executed. Original source files are preserved as text in the resulting Markdown for review and later extraction.</p>{!initialFiles.length&&<label>Choose a single file or ZIP folder<input type="file" disabled={busy} onChange={e=>{void select(e.target.files);e.target.value='';}}/></label>}{notice&&<p role="status">{notice}</p>}{error&&<p className="error" role="alert">{error}</p>}<div className="import-file-list">{files.map(f=><div key={f.path}><details><summary>{f.path} · {new TextEncoder().encode(f.content).length} bytes</summary><pre className="skill-content">{f.content}</pre></details><button className="text-button" disabled={busy} aria-label={`Remove ${f.path}`} onClick={()=>{setFiles(files.filter(x=>x.path!==f.path));setConsent(false);setResult(null);}}>Remove</button></div>)}</div><label>Context for the imported workflow<textarea rows={3} value={notes} maxLength={2000} disabled={busy} onChange={e=>{setNotes(e.target.value);setResult(null);}} placeholder="Describe the intended task and anything the files leave unclear."/></label><p>Review every selected file above. Filename filtering cannot detect all secrets. Remove credentials, private datasets and anything you cannot share. Selected contents are sent through BioSkillsHub to OpenAI only when you click Analyse files with AI; API charges may apply. Selection is temporary and clears when you leave this importer.</p><AIPrivacyNotice/><label className="check"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/> I reviewed these files, have permission to share them, and agree to send their contents to OpenAI for analysis.</label>{!enabled&&<p>Connect an API key in AI settings, or use Upload / edit Markdown without AI.</p>}<button className="primary" disabled={busy||!enabled||!consent||!files.length} onClick={analyze}>{busy?'Working…':'Analyse files with AI'}</button>{result&&<section className="chat-preview"><h4>Review converted skill: {result.draft.title}</h4><p className="preserve-text">{result.message}</p><p>{result.draft.summary}</p><pre className="skill-content">{result.draft.content}</pre><p>Check the instructions, source code, dependencies and scientific claims. AI analysis is not a security audit. Nothing has been saved or published.</p><button className="primary" disabled={busy} onClick={()=>onUse(result.draft)}>Use imported draft in editor</button></section>}</section>;
}
