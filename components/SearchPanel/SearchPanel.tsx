import { GNewsArticle } from '@/lib/gnews';
import { AnalyzedArticle } from '@/lib/types';
import ArticleCard from '@/components/ArticleCard';
import SearchSkeleton from '@/components/SearchSkeleton';
import styles from './SearchPanel.module.css';

interface Props {
  searchResults: GNewsArticle[];
  searchLoading: boolean;
  analyzeError: string | null;
  analyzedByUrl: Record<string, AnalyzedArticle>;
  analyzingUrl: string | null;
  activeTags: string[];
  onTagClick: (tag: string) => void;
  onAnalyze: (article: GNewsArticle) => void;
}

export default function SearchPanel({
  searchResults, searchLoading, analyzeError,
  analyzedByUrl, analyzingUrl,
  activeTags, onTagClick, onAnalyze,
}: Props) {
  return (
    <>
      {analyzeError && <p className={styles.error}>{analyzeError}</p>}
      {searchLoading ? (
        <SearchSkeleton />
      ) : searchResults.length === 0 ? (
        <p className={styles.empty}>No results found. Try a different search.</p>
      ) : (
        <div className={styles.cards}>
          {searchResults.map((article) => (
            <ArticleCard
              key={article.url}
              article={article}
              analyzed={analyzedByUrl[article.url]}
              onAnalyze={onAnalyze}
              analyzing={analyzingUrl === article.url}
              activeTags={activeTags}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      )}
    </>
  );
}
