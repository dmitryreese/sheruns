import { Sentiment } from '@/lib/types';
import { SENTIMENT_LABELS } from '@/lib/constants';
import styles from './SentimentBadge.module.css';

interface Props {
  sentiment: Sentiment;
}

export default function SentimentBadge({ sentiment }: Props) {
  return (
    <span className={`${styles.badge} ${styles[sentiment]}`}>
      {SENTIMENT_LABELS[sentiment]}
    </span>
  );
}
