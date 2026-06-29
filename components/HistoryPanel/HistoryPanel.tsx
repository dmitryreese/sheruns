import { AnalyzedArticle, SentimentCounts, Filter } from '@/lib/types';
import AnalysisTable from '@/components/AnalysisTable';
import SentimentTabs from '@/components/SentimentTabs';
import styles from './HistoryPanel.module.css';

interface Props {
  historyQuery: string;
  onHistoryQueryChange: (q: string) => void;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  counts: SentimentCounts;
  allCount: number;
  sentimentFilter: Filter;
  onSentimentChange: (f: Filter) => void;
  analyses: AnalyzedArticle[];
  onDelete: (id: number) => void;
  emptyMessage?: string;
  hasMore: boolean;
  total: number;
  historyLoading: boolean;
  onLoadMore: () => void;
  actionError: string | null;
}

export default function HistoryPanel({
  historyQuery, onHistoryQueryChange,
  activeTags, onTagClick,
  counts, allCount, sentimentFilter, onSentimentChange,
  analyses, onDelete, emptyMessage,
  hasMore, total, historyLoading, onLoadMore,
  actionError,
}: Props) {
  return (
    <>
      <input
        className={styles.search}
        type="text"
        placeholder="Search analyzed…"
        value={historyQuery}
        onChange={(e) => onHistoryQueryChange(e.target.value)}
      />
      {actionError && <p className={styles.error}>{actionError}</p>}
      {activeTags.length > 0 && (
        <div className={styles.activeFilters}>
          {activeTags.map((tag) => (
            <span key={tag} className={styles.activeFilter}>
              {tag}
              <button
                type="button"
                className={styles.removeTag}
                onClick={() => onTagClick(tag)}
                aria-label={`Remove tag ${tag}`}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <SentimentTabs
        counts={{ ...counts, all: allCount }}
        active={sentimentFilter}
        onChange={onSentimentChange}
      />
      <AnalysisTable
        articles={analyses}
        activeTags={activeTags}
        onTagClick={onTagClick}
        onDelete={onDelete}
        emptyMessage={emptyMessage}
      />
      {hasMore && (
        <button className={styles.loadMoreBtn} onClick={onLoadMore} disabled={historyLoading}>
          {historyLoading ? 'Loading…' : `Load more (${total - analyses.length} remaining)`}
        </button>
      )}
    </>
  );
}
