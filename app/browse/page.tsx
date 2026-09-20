import {SkillSignals} from '../components/SkillSignals';
import Link from 'next/link';
import {domains} from '@/lib/domains';
import {SkillArtwork} from '../components/SkillArtwork';
import {PublicHeader} from '../components/AboutContent';
import {catalog} from '@/lib/catalog';
export const dynamic='force-dynamic';
export default async function Browse({searchParams}:{searchParams:Promise<{domain?:string}>}){
 const requested=(await searchParams).domain;
 const domain=domains.find(d=>d===requested);
 let skills:Awaited<ReturnType<typeof catalog>>=[];let unavailable=false;
 try{skills=await catalog('');}catch{unavailable=true;}
 const visible=domain?skills.filter(s=>s.domain===domain):skills;
 return <main className="public-catalog"><PublicHeader/><section className="page"><span className="eyebrow">PUBLIC CATALOGUE</span><h1>Expertise, <em>executable.</em></h1><p>Browse published scientific workflows. Sign in to acquire a skill, read its instructions or create your own. All purchases are simulated.</p><nav className="domain-links" aria-label="Scientific domains"><Link aria-current={!domain?'page':undefined} href="/browse">All skills ({skills.length})</Link>{domains.map(d=><Link key={d} aria-current={domain===d?'page':undefined} href={`/browse?domain=${encodeURIComponent(d)}`}>{d} ({skills.filter(s=>s.domain===d).length})</Link>)}</nav>{unavailable?<p role="alert" className="error">The catalogue is temporarily unavailable. Please reload to try again.</p>:visible.length===0?<div className="panel"><h2>No skills here yet.</h2><p>{domain?`Be the first to share a workflow in ${domain}.`:"Be the first to share a workflow."}</p><Link href="/#sign-in">Sign in to create a skill →</Link></div>:<div className="skill-grid">{visible.map(s=><article className="panel" key={s.id}><SkillArtwork id={s.id} domain={s.domain} title={s.title}/><span className="pill">{s.domain} · v{s.number}</span><h2>{s.title}</h2><p>{s.summary}</p><p>By {s.author}</p><SkillSignals skill={s}/><p className="validation">{s.validation}<br/>Creator-reported status</p><p>{new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(s.price_cents/100)} demo price · £0 charged</p><Link className="outline" href="/">Sign in to acquire</Link></article>)}</div>}<p className="muted">Published metadata is public. Skill instructions require an account and acquisition. Prototype protocols are not scientifically validated. Community ratings come from acquired-skill users. Demo ratings and eval badges are labelled separately. Subscriptions and collaborative authorship remain roadmap previews.</p></section></main>;
}
