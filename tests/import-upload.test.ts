import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'fflate';
import {readImportUpload} from '../lib/import-upload';
import {appendSupportingFiles} from '../lib/import-files';
import {draftSchema,fields} from '../lib/validation';
const source='// A harmless source fixture\nclass Workflow {}';
const zip=(files:Record<string,Uint8Array>,level:0|6=6)=>zipSync(files,{level});
test('accepts arbitrary source extensions, extensionless files and a full 200 KB source',()=>{
 for(const path of ['Workflow.java','main.cpp','lib.rs','code.customlang','Makefile'])assert.equal(readImportUpload(path,strToU8(source)).files[0].content,source);
 const content='a'.repeat(200000);assert.equal(readImportUpload('Large.java',strToU8(content)).files[0].content.length,200000);
 assert.throws(()=>readImportUpload('Large.java',strToU8(content+'a')),/200 KB/);
 const skill=appendSupportingFiles(fields.map(f=>`## ${f}\nFixture description.`).join('\n'),[{path:'Large.java',content}]);
 assert.equal(draftSchema.pick({content:true}).safeParse({content:skill}).success,true);
});
test('extracts stored and deflated folders, preserving source and excluding private/binary files',()=>{
 for(const level of [0,6] as const){
 const result=readImportUpload('workflow.ZIP',zip({'workflow/':new Uint8Array(),'workflow/Workflow.java':strToU8(source),'workflow/Makefile':strToU8('all:\n\techo fixture'),'workflow/.env':strToU8('PRIVATE_FIXTURE'),'workflow/image.bin':new Uint8Array([0,1,2]),'../escape.java':strToU8(source)},level));
 assert.equal(result.files.length,2);assert.equal(result.skipped,3);assert.equal(result.files[0].content,source);
 }
});
test('rejects expansion bombs, excess entries, duplicates, encrypted files, symlinks and corruption',()=>{
 assert.throws(()=>readImportUpload('bad.zip',zip({'large.java':strToU8('a'.repeat(200001))})),/expands/);
 assert.throws(()=>readImportUpload('bad.zip',zip(Object.fromEntries(Array.from({length:101},(_,i)=>[`${i}.java`,strToU8(source)])))),/100 files/);
 assert.throws(()=>readImportUpload('bad.zip',zip({'A.java':strToU8(source),'a.java':strToU8(source)})),/duplicate/);
 const valid=zip({'Main.java':strToU8(source)});
 const central=valid.findIndex((_,i)=>valid[i]===0x50&&valid[i+1]===0x4b&&valid[i+2]===1&&valid[i+3]===2);
 for(const field of ['encrypted','symlink','crc','size'] as const){const data=valid.slice(),v=new DataView(data.buffer);if(field==='encrypted')v.setUint16(central+8,1,true);if(field==='symlink')v.setUint32(central+38,0xa0000000,true);if(field==='crc')v.setUint32(central+16,0,true);if(field==='size')v.setUint32(central+24,1,true);assert.throws(()=>readImportUpload('bad.zip',data));}
 assert.throws(()=>readImportUpload('bad.zip',valid.subarray(0,valid.length-5)));
 assert.throws(()=>readImportUpload('bad.zip',strToU8('not a ZIP')));
 assert.throws(()=>readImportUpload('key.pem',strToU8(source)));
 assert.throws(()=>readImportUpload('bad.java',new Uint8Array([0xff,0xfe])));
});
