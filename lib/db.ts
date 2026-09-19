import pg from 'pg';
const globalDb = globalThis as unknown as { pool?: pg.Pool };
export const pool = globalDb.pool ?? new pg.Pool({connectionString: process.env.DATABASE_URL, max: 10});
// pg removes failed idle clients; handle its event without dumping connection internals.
if (pool.listenerCount('error') === 0) pool.on('error', () => console.error('Database connection interrupted; the next request will reconnect.'));
if (process.env.NODE_ENV !== 'production') globalDb.pool = pool;
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(sql: string, values: unknown[] = []): Promise<T[]> { return (await pool.query<T>(sql,values)).rows; }
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>) { const c=await pool.connect(); try {await c.query('BEGIN'); const result=await fn(c); await c.query('COMMIT');return result;} catch(e){await c.query('ROLLBACK');throw e;} finally {c.release();} }
