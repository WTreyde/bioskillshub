import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePrice} from '../lib/creator-recovery';
import {draftSchema} from '../lib/validation';
test('editable prices retain pounds and pence and reject missing or invalid prices',()=>{
 for(const [input,cents] of [['0',0],['20',2000],['20.50',2050],['0.01',1],['1000',100000]] as const)assert.equal(parsePrice(input),cents);
 for(const input of ['', ' ', '-1','1000.01','1.001','NaN','Infinity','1e2'])assert.throws(()=>parsePrice(input),/demo price/);
 assert.ok(draftSchema.safeParse({title:'Other domain test',summary:'A synthetic workflow outside the named categories.',domain:'Other',price_cents:2000,content:'Inspect the supplied fixture.',validation:'Unvalidated fixture',release_notes:''}).success);
});
