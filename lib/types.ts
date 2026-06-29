export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Filter = 'all' | Sentiment;

export interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface AnalyzedArticle {
  id: number;
  url: string;
  title: string;
  description: string | null;
  source: string | null;
  image_url: string | null;
  published_at: string | null;
  summary: string;
  sentiment: Sentiment;
  tags: string[];
  analyzed_at: string;
}
