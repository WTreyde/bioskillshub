import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeSkillMetadata} from '../lib/native-skill';
import {validateContent} from '../lib/validation';
import {readImportUpload} from '../lib/import-upload';
import {zipSync,strToU8} from 'fflate';
const body='# Example workflow\n\n## First interaction\nAsk which inputs to inspect. Preserve raw inputs and record the decisions and limitations before reporting results.\n';
const native='---\nname: example-workflow\ndescription: >-\n  Inspect example inputs with explicit settings,\n  review and reproducible outputs.\nmetadata:\n  version: "0.3.0"\n---\n\n'+body;
test('native skill metadata supports custom headings, CRLF and folded descriptions',()=>{
 for(const content of [native,native.replaceAll('\n','\r\n')]){
  assert.equal(nativeSkillMetadata(content)?.name,'example-workflow');
  assert.match(nativeSkillMetadata(content)!.description,/settings, review/);
  assert.throws(()=>validateContent(content),/Missing nonempty/);
  assert.doesNotThrow(()=>validateContent(content,false));
 }
});
test('frontmatter alone, invalid YAML, aliases and missing metadata cannot bypass validation',()=>{
 for(const text of ['---\nname: test\ndescription: Description\n---\n',native.replace('name: example-workflow','name: [example-workflow]'),native.replace('name: example-workflow','name: test\nname: duplicate'),native.replace('description: >-','description: [broken'),native.replace('name: example-workflow','name: &a example-workflow\nextra: *a'),native+'\0'])assert.throws(()=>validateContent(text));
 assert.throws(()=>validateContent(body),/Missing nonempty Markdown sections/);
});
test('ZIP metadata is skipped before selected-file budgets, with separate archive bounds',()=>{
 const entries:Record<string,Uint8Array>={'example/SKILL.md':strToU8(native)};
 for(let i=0;i<300;i++)entries[`example/.git/objects/${i}`]=strToU8('x'.repeat(1000));
 const archive=zipSync(entries,{level:0});assert.ok(archive.length>200000);
 const parsed=readImportUpload('example.zip',archive);
 assert.equal(parsed.skipped,300);assert.deepEqual(parsed.files,[{path:'example/SKILL.md',content:native}]);
 assert.throws(()=>readImportUpload('big.zip',new Uint8Array(1000001)),/1 MB/);
 assert.throws(()=>readImportUpload('many.zip',zipSync(Object.fromEntries(Array.from({length:1001},(_,i)=>[`.git/${i}`,strToU8('x')])))),/1,000 entries/);
});

test('direct uploads accept custom and short instructions, while AI drafts retain their structure checks',()=>{
 for(const content of ['Follow the attached protocol.','# My workflow\nRead inputs, check results and report limitations.'])assert.doesNotThrow(()=>validateContent(content,false));
 for(const content of ['', '   ', 'unsafe\0content'])assert.throws(()=>validateContent(content,false));
});
