'use client';
import {useState} from 'react';
export function SkillRating({rating,busy,onRate}:{rating:number|null;busy:boolean;onRate:(stars:number)=>void}){
 const [stars,setStars]=useState(rating??0);
 return <section className="skill-rating"><h3>Your community rating</h3><p>Rate this acquired skill from 1 to 5 stars. You can update your vote; each account contributes one rating.</p><fieldset disabled={busy}><legend>Choose your rating</legend><div className="rating-stars">{[1,2,3,4,5].map(n=><label key={n}><input type="radio" name="skill-rating" value={n} checked={stars===n} onChange={()=>setStars(n)}/><span aria-hidden="true">{n<=stars?'★':'☆'}</span><span>{n} {n===1?'star':'stars'}</span></label>)}</div></fieldset><button className="outline" disabled={busy||!stars} onClick={()=>onRate(stars)}>{rating?'Update rating':'Save rating'}</button></section>;
}
