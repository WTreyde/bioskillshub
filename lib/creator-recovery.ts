import {z} from 'zod';
import {domains} from './domains';
import {MAX_SKILL_BYTES} from './upload-limits';

const chatDraft=z.object({title:z.string(),summary:z.string(),domain:z.enum(domains),content:z.string().max(MAX_SKILL_BYTES)});
const chatSchema=z.object({messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string()})).max(20),text:z.string().max(6000),draft:chatDraft.nullable()});
export type ChatState=z.infer<typeof chatSchema>;
export const emptyChat:ChatState={messages:[],text:'',draft:null};
// Recovery accepts incomplete input; normal draft validation still runs before saving.
export const creatorRecoverySchema=z.object({
 draft:z.object({title:z.string(),summary:z.string(),domain:z.enum(domains),price_cents:z.number(),content:z.string().max(MAX_SKILL_BYTES),validation:z.string(),release_notes:z.string()}),
 answers:z.record(z.string(),z.string()),editId:z.string().optional(),authorMode:z.enum(['Guided','Markdown','Import','Chat']),priceInput:z.string(),chat:chatSchema,
});
export function parsePrice(value:string){
 if(!/^\d+(?:\.\d{1,2})?$/.test(value)||Number(value)>1000)throw Error('Enter a demo price from £0 to £1,000, with at most two decimal places. Enter 0 for a free skill.');
 return Math.round(Number(value)*100);
}
