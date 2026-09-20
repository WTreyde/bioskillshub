import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {readFile,writeFile} from 'node:fs/promises';

// Called only by the disposable-schema rehearsal. AI endpoints use fixtures.
export async function mobileCreatorRegression({browser,origin,password,buyerPassword,db,evidence}) {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',e=>errors.push(e.name));
 const button=name=>page.getByRole('button',{name,exact:true});
 const studio=()=>button('Creator studio').click();
 try{
  const login=await page.request.post(origin+'/api/auth/login',{headers:{Origin:origin},data:{id:'wojtek',password}});assert.ok(login.ok());
  console.log('MOBILE: session ready');
  await page.goto(origin+'/workspace');await studio();
  assert.equal(await button('New skill').count(),0);
  await page.getByLabel('Domain',{exact:true}).selectOption('Other');
  const price=page.getByLabel('Demo price (£)',{exact:true});
  await price.fill('');assert.equal(await price.inputValue(),'');await price.pressSequentially('20');assert.equal(await price.inputValue(),'20');
  await page.getByLabel('Skill title',{exact:true}).fill('Mobile recovery fixture');
  await page.getByLabel('Short description').fill('A synthetic workflow verifying mobile recovery and publication.');
  await page.getByLabel('Use cases',{exact:true}).fill('An unfinished answer survives refresh.');
  console.log('MOBILE: refreshing recovery');
  await page.reload();await studio();
  assert.equal(await price.inputValue(),'20');assert.equal(await page.getByLabel('Domain',{exact:true}).inputValue(),'Other');
  assert.equal(await page.getByLabel('Use cases',{exact:true}).inputValue(),'An unfinished answer survives refresh.');
  console.log('MOBILE: checking empty instructions');
  await button('Save draft').click();await page.getByRole('alert').filter({hasText:'Complete your draft: Skill instructions'}).waitFor();
  assert.equal(await page.locator('.creator-feedback').evaluate(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}),true,'Save errors are in view');
  assert.equal(await button('Publish reviewed version').isDisabled(),true);
  assert.match(await page.locator('#publish-help').innerText(),/tick the checkbox/);
  console.log('MOBILE: generating template');
  for(const name of ['Use cases','Inputs','Outputs','Procedure','Expert decisions','Limitations','Examples'])await page.getByLabel(name,{exact:true}).fill('Synthetic mobile '+name+'; no scientific evidence.');
  await page.getByLabel('Skill instructions',{exact:true}).fill('# Custom instructions\nInspect the synthetic input.');
  await button('Add Agent Skills metadata').click();await page.getByRole('status').filter({hasText:'Agent Skills metadata added'}).waitFor();assert.match(await page.getByLabel('Skill instructions',{exact:true}).inputValue(),/^---\nname: mobile-recovery-fixture/);
  await button('Use structured template').click();await page.getByRole('status').filter({hasText:'Structured from your answers'}).waitFor();
  console.log('MOBILE: checking invalid price');
  await price.fill('');await button('Save draft').click();await page.getByRole('alert').filter({hasText:'Enter a demo price'}).waitFor();
  await price.fill('20.50');
  console.log('MOBILE: checking save retry');
  await page.route('**/api/skills',route=>route.fulfill({status:503,json:{error:'Synthetic save failure; retry.'}}));
  await button('Save draft').click();await page.getByRole('alert').filter({hasText:'Synthetic save failure'}).waitFor();
  assert.match(await page.getByLabel('Skill instructions').inputValue(),/## Procedure/);await page.unroute('**/api/skills');
  await button('Save draft').click();await page.getByRole('status').filter({hasText:'Draft saved in Your contributions'}).waitFor();
  await page.getByLabel('I have reviewed the full instructions',{exact:false}).check();await price.fill('20');
  assert.equal(await page.getByLabel('I have reviewed the full instructions',{exact:false}).isChecked(),false,'Price edits require a fresh review');
  await page.getByLabel('Passed an eval harness',{exact:true}).check();
  await page.getByLabel('I have reviewed the full instructions',{exact:false}).check();await button('Publish reviewed version').click();
  await page.getByRole('status').filter({hasText:'Published immutable version 1'}).waitFor();
  console.log('MOBILE: published');
  const {rows:[release]}=await db.query('SELECT skill_id,domain,price_cents,eval_status FROM versions WHERE title=$1',['Mobile recovery fixture']);
  assert.equal(release.domain,'Other');assert.equal(release.price_cents,2000);assert.equal(release.eval_status,'creator_reported');
  await button('Explore').click();await page.getByRole('button',{name:/Mobile recovery fixture/}).click();
  let dialog=page.getByRole('dialog');await dialog.waitFor();
  async function visibleDialog(){
   assert.equal(await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1;}),true,'Dialog stays inside the viewport after scrolling');
   assert.equal(await button('Close details').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'Touch close is visible');
  }
  console.log('MOBILE: dialog visible');
  await visibleDialog();await button('Close details').tap();await dialog.waitFor({state:'hidden'});
  await page.locator('.skill-card').last().scrollIntoViewIfNeeded();
  await page.locator('.skill-card').last().tap();await dialog.waitFor();await visibleDialog();
  await page.screenshot({path:evidence+'/mobile-dialog.png'});
  await page.touchscreen.tap(2,2);await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:/Mobile recovery fixture/}).tap();await dialog.waitFor();
  await page.getByRole('button',{name:/Add to library/}).tap();await page.getByRole('button',{name:'Confirm demo acquisition',exact:false}).tap();
  await button('Read selected version').tap();await dialog.locator('.skill-content').waitFor();
  await dialog.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  assert.equal(await button('Close details').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'Long content retains touch close');
  await button('Close details').tap();await page.getByRole('button',{name:/^My library/}).tap();await page.getByRole('button',{name:/Mobile recovery fixture/}).waitFor();
  console.log('MOBILE: checking chat recovery');
  await studio();await button('Chat with AI').click();await page.getByLabel('Your workflow or answer').fill('Unsent chat answer survives navigation.');
  await button('Explore').click();await studio();assert.equal(await page.getByLabel('Your workflow or answer').inputValue(),'Unsent chat answer survives navigation.');
  console.log('MOBILE: refreshing recovery');
  await page.reload();await studio();assert.equal(await page.getByLabel('Your workflow or answer').inputValue(),'Unsent chat answer survives navigation.');
  // Enable an inert personal fixture and intercept all conversation requests.
  await button('AI settings').click();const dummy='sk-mobile-fixture-not-a-real-key';await page.getByLabel('OpenAI API key',{exact:true}).fill(dummy);await page.getByRole('checkbox').check();await button('Enable personal key').click();
  await page.route('**/api/skill-chat',route=>route.fulfill({json:{message:'Synthetic follow-up question.',draft:null}}));
  await studio();await button('Send to skill assistant').click();await page.getByText('Synthetic follow-up question.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(key=>JSON.stringify({...localStorage,...sessionStorage}).includes(key),dummy),false);
  console.log('MOBILE: refreshing recovery');
  await page.reload();await studio();await page.getByText('Synthetic follow-up question.',{exact:true}).waitFor();
  assert.equal(await button('Send to skill assistant').isDisabled(),true,'Refresh removes the API key');
  page.once('dialog',d=>d.dismiss());await button('Start a blank skill').click();assert.equal(await page.getByLabel('Skill title',{exact:true}).inputValue(),'Mobile recovery fixture');
  page.once('dialog',d=>d.accept());await button('Start a blank skill').click();assert.equal(await page.getByLabel('Skill title',{exact:true}).inputValue(),'');
  assert.equal(await page.getByText('Synthetic follow-up question.',{exact:true}).count(),0);
  await button('Sign out').click();await page.waitForURL(origin+'/#sign-in');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('bsh-creator:wojtek')),null,'Sign-out clears private recovery');
  // A separate buyer casts real votes; sample feedback remains separate.
  const buyerLogin=await page.request.post(origin+'/api/auth/login',{headers:{Origin:origin},data:{id:'efe',password:buyerPassword}});assert.ok(buyerLogin.ok());await page.goto(origin+'/workspace');
  await page.getByRole('button',{name:/Mobile recovery fixture/}).click();await page.getByText('Eval harness passed · creator-reported, not verified',{exact:true}).waitFor();
  await page.getByRole('button',{name:/Add to library/}).click();await page.getByRole('button',{name:'Confirm demo acquisition',exact:false}).click();
  await page.getByRole('radio',{name:'5 stars',exact:true}).check();await button('Save rating').click();await page.getByRole('dialog').getByText('★ 5.0 / 5 · 1 community rating',{exact:true}).waitFor();
  await page.getByRole('radio',{name:'4 stars',exact:true}).check();await button('Update rating').click();await page.getByRole('dialog').getByText('★ 4.0 / 5 · 1 community rating',{exact:true}).waitFor();
  const downloaded=page.waitForEvent('download');await page.getByRole('link',{name:'Download Agent Skills ZIP',exact:true}).click();const download=await downloaded;const files=unzipSync(new Uint8Array(await readFile(await download.path())));assert.ok(files['mobile-recovery-fixture/SKILL.md']);assert.match(strFromU8(files['mobile-recovery-fixture/SKILL.md']),/^---\nname: mobile-recovery-fixture/);
  await button('Close details').click();
  await db.query("INSERT INTO skill_demo_feedback(skill_id,version,ratings,eval_passed) VALUES($1,1,ARRAY[3.5,4,4.5,5],true)",[release.skill_id]);
  await page.goto(origin+'/browse');await page.getByText('Demo ★ 4.3 / 5 · 4 sample ratings · not user reviews',{exact:true}).waitFor();await page.getByText('★ 4.0 / 5 · 1 community rating',{exact:true}).waitFor();
  // Display a demo eval flag on an unevaluated synthetic legacy release.
  await db.query("INSERT INTO skills(id,owner_id) VALUES('rosalind-mobile-demo','wojtek')");
  await db.query("INSERT INTO versions(id,skill_id,number,title,summary,domain,price_cents,content,validation) SELECT 'rosalind-mobile-demo-v1','rosalind-mobile-demo',1,'Rosalind demo fixture',summary,domain,0,content,validation FROM versions WHERE skill_id=$1 AND number=1",[release.skill_id]);
  await db.query("INSERT INTO skill_demo_feedback VALUES('rosalind-mobile-demo',1,ARRAY[4,4.5,5],true)");
  await page.reload();await page.getByText('Eval harness passed · DEMO ONLY, no evaluation evidence',{exact:true}).waitFor();
  await page.screenshot({path:evidence+'/community-feedback-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }catch(e){await page.screenshot({path:evidence+'/mobile-failure.png',fullPage:true});await writeFile(evidence+'/mobile-error.txt',String(e.stack),{mode:0o600});throw e;}finally{await context.close();}
}
