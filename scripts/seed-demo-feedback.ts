import {seedDemoFeedback} from '../lib/feedback';
import {pool} from '../lib/db';
try{const args=process.argv.slice(2);if(args.some(a=>a!=='--apply'))throw Error('Use --apply or omit it for a dry run.');console.log(JSON.stringify(await seedDemoFeedback(args.includes('--apply')),null,2));console.log('Synthetic demo feedback only; no real votes or eval results created.');}
catch{console.error('Demo feedback import failed; no partial changes applied.');process.exitCode=1;}
finally{await pool.end();}
