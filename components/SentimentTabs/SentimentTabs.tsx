import { Filter, SentimentCounts } from '@/lib/types';
import { SENTIMENT_LABELS } from '@/lib/constants';
import styles from './SentimentTabs.module.css';

interface Props {
  counts: SentimentCounts & { all: number };
  active: Filter;
  onChange: (filter: Filter) => void;
}

const TABS: { key: Filter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'positive', label: SENTIMENT_LABELS.positive },
  { key: 'neutral',  label: SENTIMENT_LABELS.neutral },
  { key: 'negative', label: SENTIMENT_LABELS.negative },
];

export default function SentimentTabs({ counts, active, onChange }: Props) {
  return (
    <div className={styles.tabs}>
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          className={`${styles.tab} ${active === key ? styles.active : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          <span className={styles.count}>{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
