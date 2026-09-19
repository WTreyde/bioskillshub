import {createHash} from 'node:crypto';
import {NextResponse} from 'next/server';
import {query,transaction} from './db';
import {hash,passwordHash,secret} from './auth';

const cookieName='bsh_oauth';
export const githubConfigured=()=>Boolean(process.env.GITHUB_CLIENT_ID&&process.env.GITHUB_CLIENT_SECRET);
function origin(){const value=new URL(process.env.APP_ORIGIN||'http://localhost:3000');return value.origin;}
function clear(response:NextResponse){response.headers.set('Cache-Control','no-store');response.cookies.set(cookieName,'',{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true',path:'/api/auth/github',maxAge:0});return response;}
export async function githubStart(){
 if(!githubConfigured())return NextResponse.json({error:'GitHub sign-in is not configured.'},{status:503,headers:{'Cache-Control':'no-store'}});
 const state=secret(),browser=secret(),verifier=secret();
 await query('DELETE FROM oauth_states WHERE expires_at<now()');
 await query("INSERT INTO oauth_states(state_hash,browser_hash,verifier,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')",[hash(state),hash(browser),verifier]);
 const url=new URL('https://github.com/login/oauth/authorize');
 url.search=new URLSearchParams({client_id:process.env.GITHUB_CLIENT_ID!,redirect_uri:origin()+'/api/auth/github/callback',state,code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256',scope:''}).toString();
 const response=NextResponse.redirect(url,302);response.headers.set('Cache-Control','no-store');
 response.cookies.set(cookieName,browser,{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true',path:'/api/auth/github',maxAge:600});return response;
}
export async function githubCallback(request:Request){
 try{
  if(!githubConfigured())throw Error('Unavailable');
  const params=new URL(request.url).searchParams;
  const state=params.get('state'),code=params.get('code');
  const browser=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  if(!state||!code||!browser||state.length>200||code.length>500)throw Error('Invalid callback');
  const [attempt]=await query('DELETE FROM oauth_states WHERE state_hash=$1 AND browser_hash=$2 AND expires_at>now() RETURNING verifier',[hash(state),hash(browser)]);
  if(!attempt)throw Error('Invalid or replayed state');
  const exchange=await fetch('https://github.com/login/oauth/access_token',{method:'POST',redirect:'error',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:process.env.GITHUB_CLIENT_ID,client_secret:process.env.GITHUB_CLIENT_SECRET,code,redirect_uri:origin()+'/api/auth/github/callback',code_verifier:attempt.verifier}),signal:AbortSignal.timeout(15000)});
  if(!exchange.ok)throw Error('Provider error');
  const token=await exchange.json();if(typeof token.access_token!=='string'||token.error)throw Error('Provider error');
  const identity=await fetch('https://api.github.com/user',{redirect:'error',headers:{Authorization:`Bearer ${token.access_token}`,Accept:'application/vnd.github+json','User-Agent':'BioSkillsHub'},signal:AbortSignal.timeout(15000)});
  if(!identity.ok)throw Error('Provider error');
  const profile=await identity.json();
  if(!Number.isSafeInteger(profile.id)||profile.id<=0||typeof profile.login!=='string')throw Error('Invalid identity');
  const githubId=String(profile.id);
  const mapping:Record<string,string>=JSON.parse(process.env.GITHUB_TEAM_MAP||'{}');
  const mapped=Object.hasOwn(mapping,githubId)?mapping[githubId]:undefined;
  if(!mapped&&process.env.GITHUB_ALLOW_SIGNUP!=='true')throw Error('Account not allowed');
  const session=secret();
  await transaction(async db=>{
   // Serialize first sign-in for a provider identity; never link by email or mutable login.
   await db.query('SELECT pg_advisory_xact_lock(hashtext($1))',[`github:${githubId}`]);
   const existing=(await db.query('SELECT user_id FROM github_identities WHERE github_id=$1',[githubId])).rows[0];
   let userId=existing?.user_id;
   if(mapped&&userId&&mapped!==userId)throw Error('Identity mapping changed');
   if(!userId){
    if(mapped){if(!(await db.query('SELECT id FROM users WHERE id=$1',[mapped])).rowCount)throw Error('Unknown mapped user');userId=mapped;}
    else {userId=`github:${githubId}`;await db.query('INSERT INTO users(id,name,expertise,password_hash) VALUES($1,$2,$3,$4)',[userId,String(profile.name||profile.login).slice(0,120),'GitHub member',passwordHash(secret())]);}
    await db.query('INSERT INTO github_identities(github_id,user_id) VALUES($1,$2)',[githubId,userId]);
   }
   await db.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",[hash(session),userId]);
  });
  const response=clear(NextResponse.redirect(origin()+'/',303));
  response.cookies.set('bsh_session',session,{httpOnly:true,sameSite:'strict',secure:process.env.COOKIE_SECURE==='true',path:'/',maxAge:43200});return response;
 }catch{
  // Do not log provider tokens, authorization codes, profiles or response bodies.
  return clear(NextResponse.redirect(origin()+'/?auth_error=github',303));
 }
}
