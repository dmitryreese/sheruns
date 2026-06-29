import { Sentiment } from './types';

export const PAGE_SIZE = 10;

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: '🟢 Positive',
  neutral:  '🟡 Neutral',
  negative: '🔴 Negative',
};
