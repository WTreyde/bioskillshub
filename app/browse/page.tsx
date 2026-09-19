import Link from 'next/link';
import {catalog} from '@/lib/catalog';
export const dynamic='force-dynamic';
export default async function Browse(){
 let skills:Awaited<ReturnType<typeof catalog>>=[];let unavailable=false;
 try{skills=await catalog('');}catch{unavailable=true;}
 return <main className="public-catalog"><header><Link href="/browse">BioSkillsHub</Link><Link className="primary" href="/">Sign in</Link></header><section className="page"><span className="eyebrow">PUBLIC CATALOGUE</span><h1>Expertise, <em>executable.</em></h1><p>Browse published scientific workflows. Sign in to acquire a skill, read its instructions or create your own. All purchases are simulated.</p>{unavailable?<p role="alert" className="error">The catalogue is temporarily unavailable. Please reload to try again.</p>:skills.length===0?<p>No skills have been published yet.</p>:<div className="skill-grid">{skills.map(s=><article className="panel" key={s.id}><span className="pill">{s.domain} · v{s.number}</span><h2>{s.title}</h2><p>{s.summary}</p><p>By {s.author}</p><p className="validation">{s.validation}<br/>Creator-reported status</p><p>{new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(s.price_cents/100)} demo price · £0 charged</p><Link className="outline" href="/">Sign in to acquire</Link></article>)}</div>}<p className="muted">Published metadata is public. Skill instructions require an account and acquisition. Prototype protocols are not scientifically validated. Ratings, subscriptions and collaborative authorship remain roadmap previews.</p></section></main>;
}
