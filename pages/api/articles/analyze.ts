import type { NextApiRequest, NextApiResponse } from 'next';
import { query, initDb } from '@/lib/db';
import { analyzeArticle } from '@/lib/openai';
import { AnalyzedArticle } from '@/lib/types';

interface AnalyzeBody {
  url: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzedArticle | { error: string }>
) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url, title, description, source, publishedAt, imageUrl } =
    req.body as AnalyzeBody;

  if (!url || !title) {
    return res.status(400).json({ error: 'url and title are required' });
  }

  try {
    await initDb();

    const existing = await query<AnalyzedArticle>(
      'SELECT * FROM analyzed_articles WHERE url = $1',
      [url]
    );
    if (existing.length > 0) {
      return res.status(200).json(existing[0]);
    }

    const { summary, sentiment, tags } = await analyzeArticle(title, description ?? '');

    const [row] = await query<AnalyzedArticle>(
      `INSERT INTO analyzed_articles
         (url, title, description, source, image_url, published_at, summary, sentiment, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [url, title, description ?? null, source ?? null, imageUrl ?? null, publishedAt ?? null, summary, sentiment, tags]
    );

    res.status(201).json(row);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
