/** Stable, original abstract artwork for each skill; no external image service or tracking. */
export function SkillArtwork({id,domain,title}:{id:string;domain:string;title:string}) {
 let seed=2166136261;
 for(const c of id) seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const hue=seed%360;
 function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
 const points=Array.from({length:12},()=>({x:30+random()*340,y:20+random()*140,r:4+random()*17}));
 return <div className="skill-artwork" data-artwork-id={id} style={{background:`hsl(${hue} 35% 93%)`,color:`hsl(${hue} 38% 32%)`}}>
  <svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Abstract illustration for ${title}`}>
   <path d={points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeOpacity=".3"/>
   {points.map((p,i)=><g key={i}><circle cx={p.x} cy={p.y} r={p.r+7} fill="none" stroke="currentColor" opacity=".15"/><circle cx={p.x} cy={p.y} r={p.r} fill={`hsl(${(hue+i*19)%360} 45% 48%)`} opacity={.25+i*.05}/></g>)}
  </svg><span className="artwork-domain">{domain}</span>
 </div>;
}
