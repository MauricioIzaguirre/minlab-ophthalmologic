import { Pool } from 'pg';

const pool = new Pool({
  host: import.meta.env.DB_HOST,
  port: parseInt(import.meta.env.DB_PORT),
  database: import.meta.env.DB_NAME,
  user: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASSWORD,
});

export { pool };

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
