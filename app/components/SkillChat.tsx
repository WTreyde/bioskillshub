'use client';
import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {emptyChat,type ChatState} from '@/lib/creator-recovery';
import type {ChatDraft} from '@/lib/skill-chat';
type Message={role:'user'|'assistant';content:string};
export function SkillChat({state,onChange,request,onUse,enabled,aiLabel}:{state:ChatState;onChange:Dispatch<SetStateAction<ChatState>>;request:(data:Record<string,unknown>)=>Promise<{message:string;draft:ChatDraft|null}>;onUse:(draft:ChatDraft)=>void;enabled:boolean;aiLabel:string}){
 const {messages,text,draft}=state;
 const setText=(text:string)=>onChange(s=>({...s,text}));
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef(false),active=useRef(true);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function send(action:'interview'|'draft'){
  if(pending.current)return;
  const next:Message[]=[...messages,{role:'user',content:text.trim()||(action==='draft'?'Create a skill draft from our conversation, marking any missing details.':'')}];
  if(!text.trim()&&action==='interview')return;
  pending.current=true;setBusy(true);setError('');
  try{const result=await request({messages:next,action});if(!active.current)return;onChange({messages:[...next,{role:'assistant',content:result.message}],text:'',draft:result.draft});}
  catch(e){setError((e as Error).message);}
  finally{pending.current=false;setBusy(false);}
 }
 return <section className="skill-chat"><h3>Build a skill through conversation</h3><p>Explain how you do your workflow. The assistant will ask about missing steps, inputs, expert decisions and validation. Answer in your own words, then create a draft.</p><p>{aiLabel} Each send or draft request sends this conversation to OpenAI and may incur API charges. Don’t include credentials or private data. Chat and unfinished answers recover in this browser tab, including after switching modes or refreshing. Signing out, closing the tab or starting a blank skill clears recovery. Save generated instructions as a draft to keep them on your account.</p>{!enabled&&<p className="error">Connect a key in AI settings first, or use Guided authoring for a structured template.</p>}<div role="log" aria-label="Skill builder conversation" aria-live="polite" className="chat-log">{messages.map((m,i)=><div key={i} className={`chat-message ${m.role}`}><strong>{m.role==='user'?'You':'Skill assistant'}</strong><p>{m.content}</p></div>)}</div>{error&&<p className="error" role="alert">{error}</p>}<label>Your workflow or answer<textarea aria-label="Your workflow or answer" rows={5} value={text} maxLength={6000} disabled={busy} onChange={e=>setText(e.target.value)} placeholder="I analyse fluorescence images by…"/></label><small>{messages.length}/20 messages · 24,000 characters maximum per request. At the limit, start a new chat with a concise summary.</small><div className="actions"><button className="primary" disabled={!enabled||busy||!text.trim()||messages.length>=18} onClick={()=>send('interview')}>{busy?'Working…':'Send to skill assistant'}</button><button className="outline" disabled={!enabled||busy||(!messages.length&&!text.trim())||messages.length>=20} onClick={()=>send('draft')}>Create skill draft</button><button className="text-button" disabled={busy} onClick={()=>{if(!messages.length||window.confirm('Clear this conversation and its generated preview?')){onChange(emptyChat);setError('');}}}>Start new chat</button></div>{draft&&<section className="chat-preview"><h4>Generated draft: {draft.title}</h4><p>{draft.summary}</p><pre className="skill-content">{draft.content}</pre><p>Review all claims and fill in missing details. This has not been saved or published.</p><div className="actions"><button className="primary" onClick={()=>onUse(draft)}>Use draft in editor</button><button className="outline" onClick={()=>{const url=URL.createObjectURL(new Blob([draft.content],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='SKILL.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Download draft SKILL.md</button></div></section>}</section>;
}
