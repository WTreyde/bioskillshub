import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { query } from './db';
export class HttpError extends Error { constructor(public status: number, message: string) {super(message);} }
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const secret = () => randomBytes(32).toString('base64url');
export function passwordHash(password: string) {const salt=secret(); return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function verifyPassword(password: string, stored: string) {const [salt,key]=stored.split(':');return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex'));}
export type User={id:string;name:string;expertise:string};
export async function sessionUser(request: Request): Promise<User|null> {
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('bsh_session='))?.slice(12);
 if(!token) return null;
 return (await query<User>('SELECT u.id,u.name,u.expertise FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[hash(token)]))[0]??null;
}
export async function requireUser(request: Request) { const user=await sessionUser(request); if(!user) throw new HttpError(401,'Sign in to continue.');return user; }
export async function agentUser(request:Request) {
 const auth=request.headers.get('authorization'); if(!auth?.startsWith('Bearer ')) throw new HttpError(401,'A Bearer access token is required.');
 const rows=await query<User>('SELECT u.id,u.name,u.expertise FROM api_tokens t JOIN users u ON u.id=t.user_id WHERE t.token_hash=$1 AND t.revoked_at IS NULL AND t.expires_at>now()',[hash(auth.slice(7))]);
 if(!rows[0]) throw new HttpError(401,'Invalid, expired or revoked token.');return rows[0];
}
export function checkOrigin(request:Request) { const expected=process.env.APP_ORIGIN||'http://localhost:3000';if(request.headers.get('origin')!==expected) throw new HttpError(403,'Request origin is not allowed.'); }
export async function rateLimit(key:string,max:number,seconds:number) {
 const [r]=await query(`INSERT INTO rate_limits(key,count,reset_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.count+1 END, reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+$2*interval '1 second' ELSE rate_limits.reset_at END RETURNING count`,[key,seconds]);
 if(r.count>max) throw new HttpError(429,'Request limit reached. Please try again later.');
}
