import {expect} from 'playwright/test';

export async function acknowledgePublication(page){
 const dialog=page.getByRole('dialog',{name:'Skill published',exact:true});
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('heading',{name:'Your skill is published!'})).toBeVisible();
 await dialog.getByRole('button',{name:'Done',exact:true}).click();
 await expect(dialog).toHaveCount(0);
 for(const label of ['Skill title','Short description','Skill instructions','Release notes','Demo price (£)']){
  await expect(page.getByLabel(label,{exact:true})).toHaveValue('');
 }
 await expect(page.getByLabel('I have reviewed the full instructions',{exact:false})).not.toBeChecked();
 await expect(page.getByLabel('Passed an eval harness',{exact:true})).not.toBeChecked();
 await expect.poll(()=>page.evaluate(()=>{
  const key=Object.keys(sessionStorage).find(k=>k.startsWith('bsh-creator:'));
  if(!key)return false;
  const r=JSON.parse(sessionStorage.getItem(key));
  return !r.editId&&!r.draft.title&&!r.draft.summary&&!r.draft.content&&!r.draft.release_notes&&r.priceInput===''&&Object.keys(r.answers).length===0&&r.chat.text===''&&r.chat.messages.length===0&&r.chat.draft===null;
 }),{message:'Publication clears the recovery copy as well as the editor'}).toBe(true);
}
