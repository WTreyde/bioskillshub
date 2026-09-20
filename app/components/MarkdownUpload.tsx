'use client';
import {useState} from 'react';
import {nativeSkillMetadata} from '@/lib/native-skill';
import {fields} from '@/lib/validation';
import {MAX_SKILL_BYTES,MAX_TOTAL_BYTES} from '@/lib/upload-limits';
import type {ChatDraft} from '@/lib/skill-chat';
import {SkillImport} from './SkillImport';

export function MarkdownUpload({onLoad,onUse,request,enabled,aiLabel}:{
 onLoad:(content:string,metadata:ReturnType<typeof nativeSkillMetadata>)=>void;
 onUse:(draft:ChatDraft)=>void;
 request:(data:Record<string,unknown>)=>Promise<{message:string;draft:ChatDraft}>;
 enabled:boolean;aiLabel:string;
}){
 const [source,setSource]=useState<{path:string;content:string}|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[selection,setSelection]=useState(0),[loading,setLoading]=useState(false),[adapt,setAdapt]=useState(false);
 async function upload(file:File){
  setLoading(true);setError('');setNotice('');
  try{
   if(file.size>MAX_SKILL_BYTES)throw Error('Maximum skill file size is 300 KB.');
   if(!file.name.toLowerCase().endsWith('.md'))throw Error('Upload a .md file.');
   let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch{throw Error('The Markdown file must use UTF-8 text.');}
   if(text.includes('\0'))throw Error('The Markdown file must contain plain text.');
   onLoad(text,nativeSkillMetadata(text));setSource({path:file.name,content:text});setAdapt(false);setSelection(n=>n+1);
   setNotice('Markdown loaded locally. Review the metadata and instructions below. Nothing has been saved or sent to AI.');
  }catch(e){setError((e as Error).message);}finally{setLoading(false);}
 }

 return <section><p>Upload a Markdown file (up to 300 KB). Keep your own headings and instructions: direct upload does not use AI. Publishing requires Agent Skills name and description frontmatter. Add it with the editor helper or optionally convert with AI below, then review the result. A standalone Markdown file does not include linked scripts or references; use Import files with AI for a ZIP containing them.</p><label className="upload">Import a Markdown file<input type="file" disabled={loading} accept=".md,text/markdown,text/plain" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void upload(file);}}/></label>{error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status">{notice}</p>}{source&&<label className="check"><input type="checkbox" checked={adapt} onChange={e=>setAdapt(e.target.checked)}/> Convert to Agent Skills format with AI</label>}{source&&adapt&&<section><h3>Optional Agent Skills AI conversion</h3><p>Suggested headings: {fields.join(', ')}. Review and consent below to adapt this file. The original remains in the editor until you apply the adapted draft. You can leave this unchecked, keep your headings and use the metadata helper without AI.</p>{new TextEncoder().encode(source.content).length<=MAX_TOTAL_BYTES?<SkillImport key={selection} initialFiles={[source]} request={request} onUse={onUse} enabled={enabled} aiLabel={aiLabel}/>:<p>AI conversion accepts up to 200 KB of source text. Choose a smaller source file to convert.</p>}</section>}</section>;
}
