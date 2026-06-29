import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  if (!initPromise) initPromise = runMigrations();
  return initPromise;
}

async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS analyzed_articles (
      id           SERIAL PRIMARY KEY,
      url          TEXT UNIQUE NOT NULL,
      title        TEXT NOT NULL,
      description  TEXT,
      source       TEXT,
      image_url    TEXT,
      published_at TIMESTAMPTZ,
      summary      TEXT NOT NULL,
      sentiment    TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
      analyzed_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(
    `ALTER TABLE analyzed_articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_analyzed_at ON analyzed_articles (analyzed_at DESC)`
  );
}
