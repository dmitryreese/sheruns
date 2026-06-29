import type { NextApiRequest, NextApiResponse } from 'next';
import { searchNews, GNewsArticle } from '@/lib/gnews';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GNewsArticle[] | { error: string }>
) {
  if (req.method !== 'GET') return res.status(405).end();

  const q = req.query.q;
  if (!q || typeof q !== 'string' || q.trim() === '') {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  try {
    const articles = await searchNews(q.trim());
    res.status(200).json(articles);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: message });
  }
}
