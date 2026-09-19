import {readFile} from 'node:fs/promises';
import {pool,transaction} from '../lib/db';
try {await transaction(async db=>{await db.query(await readFile('db/schema.sql','utf8'));});console.log('Schema updated; existing accounts and content preserved.');}
catch {console.error('Schema update failed; transaction rolled back.');process.exitCode=1;}
finally {await pool.end();}
