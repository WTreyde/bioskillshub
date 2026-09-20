import {Inflate} from 'fflate';
import {allowedImportPath,importFilesSchema,type ImportFile} from './import-files';
import {MAX_FILES,MAX_TOTAL_BYTES,MAX_ZIP_BYTES,MAX_ZIP_ENTRIES} from './upload-limits';
const decoder=new TextDecoder('utf-8',{fatal:true});
const fail=()=>{throw Error('Invalid or unsupported ZIP. Use an unencrypted ZIP folder with UTF-8 source files (no ZIP64 or symbolic links).');};
function crc32(bytes:Uint8Array){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
/** Parses only ZIP metadata and text in memory. Never writes files or executes contents. */
export function readImportUpload(name:string,bytes:Uint8Array):{files:ImportFile[];skipped:number}{
 const isZip=name.toLowerCase().endsWith('.zip');
 if(bytes.length>(isZip?MAX_ZIP_BYTES:MAX_TOTAL_BYTES))throw Error(isZip?'ZIP upload exceeds 1 MB.':'Upload at most 200 KB.');
 if(!name.toLowerCase().endsWith('.zip')){
  const parsed=importFilesSchema.safeParse([{path:name,content:decode(bytes)}]);
  if(!parsed.success)throw Error('Choose a nonempty UTF-8 source file with a safe, non-private filename (up to 200 KB).');
  return {files:parsed.data,skipped:0};
 }
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const u16=(n:number)=>view.getUint16(n,true),u32=(n:number)=>view.getUint32(n,true);
 let end=bytes.length-22;
 for(;end>=Math.max(0,bytes.length-65557);end--)if(u32(end)===0x06054b50&&end+22+u16(end+20)===bytes.length)break;
 if(end<0||u32(end)!==0x06054b50)fail();
 const count=u16(end+10),directory=u32(end+16),directorySize=u32(end+12);
 if(u16(end+4)||u16(end+6)||u16(end+8)!==count||count===65535||directory+directorySize!==end)fail();
 if(count>MAX_ZIP_ENTRIES)throw Error('ZIP contains more than 1,000 entries. Remove unnecessary folders and metadata.');
 const files:ImportFile[]=[];const names=new Set<string>();let pos=directory,total=0,skipped=0,fileCount=0;
 for(let i=0;i<count;i++){
  if(pos+46>end||u32(pos)!==0x02014b50)fail();
  const flags=u16(pos+8),method=u16(pos+10),crc=u32(pos+16),packed=u32(pos+20),size=u32(pos+24),nl=u16(pos+28),extra=u16(pos+30),comment=u16(pos+32),offset=u32(pos+42);
  if(pos+46+nl+extra+comment>end)fail();
  const path=decode(bytes.subarray(pos+46,pos+46+nl));
  const unixMode=u32(pos+38)>>>16;
  if(flags&1||![0,8].includes(method)||u16(pos+34)||((unixMode&0xf000)===0xa000)||size===0xffffffff||packed===0xffffffff)fail();
  pos+=46+nl+extra+comment;
  if(path.endsWith('/')){if(size!==0)fail();continue;}
  if(!allowedImportPath(path)){skipped++;continue;}
  if(++fileCount>MAX_FILES)throw Error('ZIP contains more than 100 files.');
  total+=size;if(total>MAX_TOTAL_BYTES)throw Error('ZIP expands beyond 200 KB. Choose a smaller folder.');
  if(names.has(path.toLowerCase()))throw Error('ZIP contains duplicate file paths.');names.add(path.toLowerCase());
  if(offset+30>directory||u32(offset)!==0x04034b50||u16(offset+6)!==flags||u16(offset+8)!==method)fail();
  const localNameLength=u16(offset+26),start=offset+30+localNameLength+u16(offset+28);
  if(start+packed>directory||decode(bytes.subarray(offset+30,offset+30+localNameLength))!==path)fail();
  const compressed=bytes.subarray(start,start+packed);let content:Uint8Array;
  if(method===0){if(packed!==size)fail();content=compressed;}
  else {
   const chunks:Uint8Array[]=[];let length=0;
   const inflate=new Inflate((chunk)=>{length+=chunk.length;if(length>size||length>MAX_TOTAL_BYTES)throw Error('ZIP expanded size exceeds its declared size or 200 KB.');chunks.push(chunk);});
   for(let n=0;n<compressed.length;n+=512)inflate.push(compressed.subarray(n,n+512),n+512>=compressed.length);
   if(length!==size)fail();content=new Uint8Array(length);let at=0;for(const chunk of chunks){content.set(chunk,at);at+=chunk.length;}
  }
  if(crc32(content)!==crc)throw Error('ZIP checksum failed. Recreate the archive and try again.');
  let text:string;try{text=decode(content);}catch{skipped++;continue;}
  if(!text||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)){skipped++;continue;}
  files.push({path,content:text});
 }
 if(pos!==end)fail();
 const parsed=importFilesSchema.safeParse(files);if(!parsed.success)throw Error('No importable UTF-8 source files found. Remove private, binary or empty files and try again.');
 return {files:parsed.data,skipped};
}
function decode(bytes:Uint8Array){try{return decoder.decode(bytes);}catch{throw Error('Files and ZIP filenames must use UTF-8 text.');}}
