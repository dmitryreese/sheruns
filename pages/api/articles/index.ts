import type { NextApiRequest, NextApiResponse } from 'next';
import { query, initDb } from '@/lib/db';
import { AnalyzedArticle, SentimentCounts } from '@/lib/types';
import { PAGE_SIZE } from '@/lib/constants';

interface PaginatedResponse {
  articles: AnalyzedArticle[];
  total: number;
  counts: SentimentCounts;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse | { error: string }>
) {
  if (req.method === 'DELETE') {
    try {
      await initDb();
      await query('TRUNCATE TABLE analyzed_articles RESTART IDENTITY');
      return res.status(204).end();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  }

  if (req.method !== 'GET') return res.status(405).end();

  const page = Math.max(0, parseInt(String(req.query.page ?? '0'), 10) || 0);
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const tagParam = req.query.tag;
  const activeTags = (Array.isArray(tagParam) ? tagParam : tagParam ? [tagParam] : [])
    .map((t) => t.trim())
    .filter(Boolean);
  const sentiment = typeof req.query.sentiment === 'string' ? req.query.sentiment.trim() : '';

  try {
    await initDb();

    const baseConditions: string[] = [];
    const baseParams: unknown[] = [];

    if (search) {
      baseParams.push(`%${search}%`);
      baseConditions.push(`(title ILIKE $${baseParams.length} OR source ILIKE $${baseParams.length})`);
    }

    if (activeTags.length > 0) {
      baseParams.push(activeTags);
      baseConditions.push(`tags && $${baseParams.length}::text[]`);
    }

    const fullConditions = [...baseConditions];
    const fullParams = [...baseParams];

    if (sentiment && ['positive', 'neutral', 'negative'].includes(sentiment)) {
      fullParams.push(sentiment);
      fullConditions.push(`sentiment = $${fullParams.length}`);
    }

    const baseWhere = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';
    const fullWhere = fullConditions.length > 0 ? `WHERE ${fullConditions.join(' AND ')}` : '';

    const [countsRow] = await query<{ positive: string; neutral: string; negative: string }>(
      `SELECT
        COUNT(*) FILTER (WHERE sentiment = 'positive')::text AS positive,
        COUNT(*) FILTER (WHERE sentiment = 'neutral')::text  AS neutral,
        COUNT(*) FILTER (WHERE sentiment = 'negative')::text AS negative
       FROM analyzed_articles ${baseWhere}`,
      baseParams
    );

    const counts: SentimentCounts = {
      positive: parseInt(countsRow.positive, 10),
      neutral:  parseInt(countsRow.neutral,  10),
      negative: parseInt(countsRow.negative, 10),
    };

    const [countRow] = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM analyzed_articles ${fullWhere}`,
      fullParams
    );
    const total = parseInt(countRow.count, 10);

    const articles = await query<AnalyzedArticle>(
      `SELECT * FROM analyzed_articles ${fullWhere}
       ORDER BY analyzed_at DESC LIMIT $${fullParams.length + 1} OFFSET $${fullParams.length + 2}`,
      [...fullParams, PAGE_SIZE, page * PAGE_SIZE]
    );

    res.status(200).json({ articles, total, counts });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}
