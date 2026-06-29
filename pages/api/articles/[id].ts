import type { NextApiRequest, NextApiResponse } from 'next';
import { query, initDb } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const id = parseInt(String(req.query.id), 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    await initDb();
    await query('DELETE FROM analyzed_articles WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
