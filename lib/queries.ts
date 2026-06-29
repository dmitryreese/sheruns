import { initDb, query } from './db';
import { AnalyzedArticle, SentimentCounts } from './types';
import { PAGE_SIZE } from './constants';

export interface InitialPageData {
  initialArticles: AnalyzedArticle[];
  initialTotal: number;
  initialCounts: SentimentCounts;
}

export async function getInitialPageData(): Promise<InitialPageData> {
  await initDb();

  const [countsRow] = await query<{ positive: string; neutral: string; negative: string }>(
    `SELECT
      COUNT(*) FILTER (WHERE sentiment = 'positive')::text AS positive,
      COUNT(*) FILTER (WHERE sentiment = 'neutral')::text  AS neutral,
      COUNT(*) FILTER (WHERE sentiment = 'negative')::text AS negative
     FROM analyzed_articles`
  );

  const initialCounts: SentimentCounts = {
    positive: parseInt(countsRow.positive, 10),
    neutral:  parseInt(countsRow.neutral,  10),
    negative: parseInt(countsRow.negative, 10),
  };

  const initialArticles = await query<AnalyzedArticle>(
    'SELECT * FROM analyzed_articles ORDER BY analyzed_at DESC LIMIT $1',
    [PAGE_SIZE]
  );

  const initialTotal = initialCounts.positive + initialCounts.neutral + initialCounts.negative;

  return { initialArticles, initialTotal, initialCounts };
}
