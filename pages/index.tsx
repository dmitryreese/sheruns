import { useState, useCallback, useRef, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import SearchBar from '@/components/SearchBar';
import TopicChips from '@/components/TopicChips';
import HistoryPanel from '@/components/HistoryPanel';
import SearchPanel from '@/components/SearchPanel';
import ConfirmClearButton from '@/components/ConfirmClearButton';
import { useNewsSearch } from '@/hooks/useNewsSearch';
import { useArticleHistory } from '@/hooks/useArticleHistory';
import { getInitialPageData, InitialPageData } from '@/lib/queries';
import styles from '@/styles/Home.module.css';

export default function Home({ initialArticles, initialTotal, initialCounts }: InitialPageData) {
  const {
    searchResults, hasSearched, searchLoading, searchError,
    handleSearch: doSearch,
  } = useNewsSearch();

  const {
    analyses, analyzedMap, total, counts, allCount, hasMore, emptyMessage,
    historyQuery, setHistoryQuery,
    activeTags, handleTagClick,
    sentimentFilter, setSentimentFilter,
    historyLoading, handleLoadMore,
    handleAnalyze, handleDeleteArticle, handleClearAll,
    analyzingUrl, analyzeError, actionError,
  } = useArticleHistory({ articles: initialArticles, total: initialTotal, counts: initialCounts });

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);

  const searchPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    searchPanelRef.current?.scrollTo({ top: 0 });
  }, [searchResults]);

  const unanalyzedCount = searchResults.filter((a) => !analyzedMap[a.url]).length;

  const handleSearch = useCallback(async (q: string) => {
    if (leftCollapsed) setLeftCollapsed(false);
    await doSearch(q);
  }, [doSearch, leftCollapsed]);

  const handleAnalyzeAll = useCallback(async () => {
    const unanalyzed = searchResults.filter((a) => !analyzedMap[a.url]);
    if (!unanalyzed.length) return;
    setAnalyzingAll(true);
    for (const article of unanalyzed) await handleAnalyze(article);
    setAnalyzingAll(false);
  }, [searchResults, analyzedMap, handleAnalyze]);

  const historyPanelProps = {
    historyQuery, onHistoryQueryChange: setHistoryQuery,
    activeTags, onTagClick: handleTagClick,
    counts, allCount, sentimentFilter, onSentimentChange: setSentimentFilter,
    analyses, onDelete: handleDeleteArticle, emptyMessage,
    hasMore, total, historyLoading, onLoadMore: handleLoadMore,
    actionError,
  };

  return (
    <>
      <Head>
        <title>News Analyzer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`${styles.page} ${hasSearched ? styles.splitMode : ''}`}>

        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderInner}>
            <h1 className={styles.title}>News Analyzer</h1>
            <p className={styles.subtitle}>Search recent news, get AI summaries and sentiment analysis</p>
            <TopicChips onSelect={handleSearch} />
            <SearchBar onSearch={handleSearch} loading={searchLoading} />
            {searchError && <p className={styles.error}>{searchError}</p>}
          </div>
        </header>

        {!hasSearched && (
          <div className={styles.singleColumn}>
            <div className={styles.singleColumnInner}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Analyzed Articles</h2>
                <ConfirmClearButton onConfirm={handleClearAll} />
              </div>
              <HistoryPanel {...historyPanelProps} />
            </div>
          </div>
        )}

        {hasSearched && (
          <div className={styles.splitGrid}>

            {!leftCollapsed && (
              <div className={`${styles.panel} ${styles.panelLeft}`}>
                <div className={styles.panelHeader}>
                  <button className={styles.panelCollapseBtn} onClick={() => setLeftCollapsed(true)} disabled={rightCollapsed} title="Collapse panel">◀</button>
                  <h2 className={styles.panelTitle}>Search Results</h2>
                  <div className={styles.panelActions}>
                    {unanalyzedCount > 0 && (
                      <button className={styles.analyzeAllBtn} onClick={handleAnalyzeAll} disabled={analyzingAll}>
                        {analyzingAll ? 'Analyzing…' : `Analyze All (${unanalyzedCount})`}
                      </button>
                    )}
                    {rightCollapsed && (
                      <button className={styles.collapseBtn} onClick={() => setRightCollapsed(false)}>◀ Show analyzed</button>
                    )}
                  </div>
                </div>
                <div className={styles.panelContent} ref={searchPanelRef}>
                  <SearchPanel
                    searchResults={searchResults}
                    searchLoading={searchLoading}
                    analyzeError={analyzeError}
                    analyzedByUrl={analyzedMap}
                    analyzingUrl={analyzingUrl}
                    activeTags={activeTags}
                    onTagClick={handleTagClick}
                    onAnalyze={handleAnalyze}
                  />
                </div>
              </div>
            )}

            {!rightCollapsed && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  {leftCollapsed && (
                    <button className={styles.collapseBtn} onClick={() => setLeftCollapsed(false)}>Show results ▶</button>
                  )}
                  <h2 className={styles.panelTitle}>Analyzed Articles</h2>
                  <div className={styles.panelActions}>
                    <ConfirmClearButton onConfirm={handleClearAll} />
                  </div>
                  <button className={styles.panelCollapseBtn} onClick={() => setRightCollapsed(true)} disabled={leftCollapsed} title="Collapse panel">▶</button>
                </div>
                <div className={styles.panelContent}>
                  <HistoryPanel {...historyPanelProps} />
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<InitialPageData> = async () => {
  try {
    return { props: await getInitialPageData() };
  } catch {
    return { props: { initialArticles: [], initialTotal: 0, initialCounts: { positive: 0, neutral: 0, negative: 0 } } };
  }
};
