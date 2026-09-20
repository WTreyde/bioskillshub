export type SkillFeedback={rating_average?:number|null;rating_count?:number;demo_rating_average?:number|null;demo_rating_count?:number;eval_status?:'not_evaluated'|'creator_reported'|'demo';my_rating?:number|null};
export function SkillSignals({skill}:{skill:SkillFeedback}){
 return <div className="skill-signals">
  <span>{skill.rating_count?`★ ${Number(skill.rating_average).toFixed(1)} / 5 · ${skill.rating_count} community ${skill.rating_count===1?'rating':'ratings'}`:'No community ratings yet'}</span>
  {!!skill.demo_rating_count&&<small>Demo ★ {Number(skill.demo_rating_average).toFixed(1)} / 5 · {skill.demo_rating_count} sample ratings · not user reviews</small>}
  {skill.eval_status==='creator_reported'&&<span className="eval-badge">Eval harness passed · creator-reported, not verified</span>}
  {skill.eval_status==='demo'&&<span className="eval-badge">Eval harness passed · DEMO ONLY, no evaluation evidence</span>}
 </div>;
}
