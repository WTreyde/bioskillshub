import {z} from 'zod';
import {HttpError,rateLimit} from './auth';
import {query} from './db';
export type PersonalAI={apiKey:string;model:string;confirmed:true};
export const platformAIConfigured=()=>Boolean(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL);
export function personalAI(value:unknown):PersonalAI|undefined {
 if(value===undefined)return undefined;
 const origin=new URL(process.env.APP_ORIGIN||'http://localhost:3000');
 if(origin.protocol!=='https:'&&!['localhost','127.0.0.1','[::1]'].includes(origin.hostname))throw new HttpError(400,'Personal API keys require HTTPS or a localhost connection.');
 const parsed=z.object({apiKey:z.string().min(20).max(512).regex(/^[\x21-\x7e]+$/),model:z.string().min(1).max(120).regex(/^[A-Za-z0-9._:-]+$/).refine(v=>!v.startsWith('sk-')),confirmed:z.literal(true)}).safeParse(value);
 // Validation errors must never echo credential input.
 if(!parsed.success)throw new HttpError(400,'Enter a valid API key and model, and confirm API billing consent in AI settings.');
 return parsed.data;
}
const providerResult=z.object({status:z.string().optional(),usage:z.object({input_tokens:z.number().int().nonnegative().default(0),output_tokens:z.number().int().nonnegative().default(0)}).optional(),output:z.array(z.object({content:z.array(z.object({type:z.string(),text:z.string().optional()})).optional()})).default([])});
export async function generate(userId:string,task:string,instructions:string,input:unknown,personal?:PersonalAI):Promise<string> {
 const apiKey=personal?.apiKey||process.env.OPENAI_API_KEY;
 const model=personal?.model||process.env.OPENAI_MODEL;
 if(!apiKey||!model)throw new HttpError(503,'Connect your OpenAI API key in AI settings, or use the structured template.');
 if(personal)await rateLimit(`ai-personal:${userId}`,20,3600);
 else {await rateLimit('ai-global',Number(process.env.AI_DAILY_REQUEST_LIMIT||40),86400);await rateLimit(`ai:${userId}`,10,3600);}
 let response:Response;
 try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input:JSON.stringify(input),max_output_tokens:2200,store:false}),signal:AbortSignal.timeout(45000)});}
 catch{throw new HttpError(502,'OpenAI could not be reached. Your draft and library have not changed.');}
 if(!response.ok){
  if(personal&&(response.status===401||response.status===403))throw new HttpError(400,'OpenAI rejected your key or model access. Check AI settings.');
  if(personal&&response.status===429)throw new HttpError(429,'OpenAI rate or billing limit reached for your API project. Check your OpenAI account before retrying.');
  throw new HttpError(502,'Model service unavailable. Check model access and try again. Your draft and library have not changed.');
 }
 let result:z.infer<typeof providerResult>;
 try{result=providerResult.parse(await response.json());}catch{throw new HttpError(502,'OpenAI returned an unreadable response. Please try again.');}
 await query('INSERT INTO ai_usage(user_id,task,model,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5)',[userId,personal?`personal:${task}`:task,model,result.usage?.input_tokens??0,result.usage?.output_tokens??0]);
 const text=result.output.flatMap(x=>x.content??[]).filter(x=>x.type==='output_text').map(x=>x.text||'').join('\n');
 if(!text||result.status==='incomplete')throw new HttpError(502,'The model did not return a complete result. Try a shorter request.');return text;
}
