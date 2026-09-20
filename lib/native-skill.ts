import {parseDocument} from 'yaml';

/** Read metadata as data only. Preserve the original Markdown for storage/download. */
export function nativeSkillMetadata(content:string):{name:string;description:string}|null {
 const match=/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(content);
 if(!match)return null;
 try {
  const doc=parseDocument(match[1],{schema:'failsafe',uniqueKeys:true});
  if(doc.errors.length)return null;
  const data=doc.toJS({maxAliasCount:0});
  if(!data||typeof data.name!=='string'||typeof data.description!=='string')return null;
  const name=data.name.trim(),description=data.description.trim();
  if(!name||name.length>120||!description||description.length>2000||match[2].trim().length<80)return null;
  return {name,description};
 }catch{return null;}
}
