import { useState } from 'react';
import { AnalyzedArticle } from '@/lib/types';
import { formatRelative } from '@/lib/format';
import SentimentBadge from '@/components/SentimentBadge';
import TagList from '@/components/TagList';
import styles from './AnalysisTable.module.css';

interface Props {
  articles: AnalyzedArticle[];
  activeTags?: string[];
  onTagClick?: (tag: string) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
}

export default function AnalysisTable({ articles, activeTags, onTagClick, onDelete, emptyMessage }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (articles.length === 0) {
    return (
      <p className={styles.empty}>
        {emptyMessage ?? 'No analyses yet. Search for news and click Analyze.'}
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Article</th>
            <th>Sentiment</th>
            <th>Summary</th>
            <th>Analyzed</th>
            {onDelete && <th aria-label="Actions" />}
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => {
            const isExpanded = expandedIds.has(a.id);
            return (
              <tr key={a.id}>
                <td>
                  <a href={a.url} target="_blank" rel="noreferrer" className={styles.link}>
                    {a.title}
                  </a>
                  {a.source && <span className={styles.source}>{a.source}</span>}
                  <TagList
                    tags={a.tags}
                    activeTags={activeTags}
                    onTagClick={onTagClick}
                    className={styles.tagsMargin}
                  />
                </td>
                <td>
                  <SentimentBadge sentiment={a.sentiment} />
                </td>
                <td className={styles.summaryCell}>
                  <p className={`${styles.summary} ${isExpanded ? '' : styles.summaryCollapsed}`}>
                    {a.summary}
                  </p>
                  <button className={styles.toggleBtn} onClick={() => toggleExpanded(a.id)}>
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                </td>
                <td className={styles.date}>{formatRelative(a.analyzed_at)}</td>
                {onDelete && (
                  <td className={styles.deleteCell}>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => onDelete(a.id)}
                      aria-label="Delete article"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
