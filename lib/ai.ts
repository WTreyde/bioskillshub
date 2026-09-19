import {HttpError,rateLimit} from './auth';
import {query} from './db';
export async function generate(userId:string,task:string,instructions:string,input:unknown):Promise<string> {
 if(!process.env.OPENAI_API_KEY||!process.env.OPENAI_MODEL)throw new HttpError(503,'LLM is not configured. Set OPENAI_API_KEY and OPENAI_MODEL on the server.');
 await rateLimit('ai-global',Number(process.env.AI_DAILY_REQUEST_LIMIT||40),86400);
 await rateLimit(`ai:${userId}`,10,3600);
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL,instructions,input:JSON.stringify(input),max_output_tokens:2200,store:false}),signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new HttpError(502,'Model service unavailable. Your draft and library have not changed.');
 const result=await response.json();
 await query('INSERT INTO ai_usage(user_id,task,model,input_tokens,output_tokens) VALUES($1,$2,$3,$4,$5)',[userId,task,process.env.OPENAI_MODEL,result.usage?.input_tokens??0,result.usage?.output_tokens??0]);
 const text=(result.output??[]).flatMap((x:{content?:{type:string;text?:string}[]})=>x.content??[]).filter((x:{type:string})=>x.type==='output_text').map((x:{text:string})=>x.text).join('\n');
 if(!text||result.status==='incomplete')throw new HttpError(502,'The model did not return a complete result. Try a shorter request.');return text;
}
