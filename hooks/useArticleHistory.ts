import { useState, useCallback, useEffect, useRef } from 'react';
import { GNewsArticle } from '@/lib/gnews';
import { AnalyzedArticle, SentimentCounts, Filter } from '@/lib/types';
import { PAGE_SIZE } from '@/lib/constants';

interface Initial {
  articles: AnalyzedArticle[];
  total: number;
  counts: SentimentCounts;
}

export function useArticleHistory({ articles, total: initialTotal, counts: initialCounts }: Initial) {
  const [analyses, setAnalyses] = useState(articles);
  const [total, setTotal] = useState(initialTotal);
  const [counts, setCounts] = useState(initialCounts);
  const [analyzedMap, setAnalyzedMap] = useState<Record<string, AnalyzedArticle>>(
    () => Object.fromEntries(articles.map((a) => [a.url, a]))
  );
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<Filter>('all');
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchHistory = useCallback(async (
    q: string, tags: string[], sentiment: Filter, page: number, reset: boolean
  ) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q) params.set('q', q);
      tags.forEach((t) => params.append('tag', t));
      if (sentiment !== 'all') params.set('sentiment', sentiment);
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setAnalyses((prev) => (reset ? data.articles : [...prev, ...data.articles]));
      setAnalyzedMap((prev) => {
        const next = { ...prev };
        (data.articles as AnalyzedArticle[]).forEach((a) => { next[a.url] = a; });
        return next;
      });
      setTotal(data.total);
      setCounts(data.counts);
      setHistoryPage(page);
    } catch {
      // silently keep current data
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchHistory(historyQuery, activeTags, sentimentFilter, 0, true);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyQuery, activeTags.join(','), sentimentFilter, fetchHistory]);

  // ── Analyze ──────────────────────────────────────────────────────────────

  const addOrUpdate = useCallback((article: AnalyzedArticle, isNew: boolean) => {
    setAnalyzedMap((prev) => ({ ...prev, [article.url]: article }));
    setAnalyses((prev) => {
      const exists = prev.some((a) => a.url === article.url);

      if (exists) return prev.map((a) => (a.url === article.url ? article : a));

      const matchesSentiment = sentimentFilter === 'all' || sentimentFilter === article.sentiment;
      const matchesTags = activeTags.length === 0 || activeTags.some((t) => article.tags.includes(t));
      const q = historyQuery.toLowerCase();
      const matchesQuery = !q ||
        article.title.toLowerCase().includes(q) ||
        (article.source ?? '').toLowerCase().includes(q);
      if (!matchesSentiment || !matchesTags || !matchesQuery) return prev;
      return [article, ...prev].slice(0, PAGE_SIZE);
    });
    if (isNew) {
      setTotal((t) => t + 1);
      setCounts((c) => ({ ...c, [article.sentiment]: c[article.sentiment] + 1 }));
    }
  }, [sentimentFilter, activeTags, historyQuery]);

  const handleAnalyze = useCallback(async (article: GNewsArticle) => {
    setAnalyzingUrl(article.url);
    setAnalyzeError(null);
    try {
      const res = await fetch('/api/articles/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: article.url, title: article.title, description: article.description,
          source: article.source.name, publishedAt: article.publishedAt, imageUrl: article.image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      addOrUpdate(data, res.status === 201);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzingUrl(null);
    }
  }, [addOrUpdate]);

  // ── Delete / clear ───────────────────────────────────────────────────────

  const handleDeleteArticle = useCallback(async (id: number) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setAnalyses((prev) => {
        const article = prev.find((a) => a.id === id);
        if (article) {
          setCounts((c) => ({ ...c, [article.sentiment]: Math.max(0, c[article.sentiment] - 1) }));
          setAnalyzedMap((m) => { const next = { ...m }; delete next[article.url]; return next; });
        }
        return prev.filter((a) => a.id !== id);
      });
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed');
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    setActionError(null);
    try {
      const res = await fetch('/api/articles', { method: 'DELETE' });
      if (!res.ok) throw new Error(`Clear failed (${res.status})`);
      setAnalyses([]);
      setAnalyzedMap({});
      setTotal(0);
      setCounts({ positive: 0, neutral: 0, negative: 0 });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Clear failed');
    }
  }, []);

  // ── Tags / sentiment ─────────────────────────────────────────────────────

  const handleTagClick = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleLoadMore = useCallback(() => {
    fetchHistory(historyQuery, activeTags, sentimentFilter, historyPage + 1, false);
  }, [fetchHistory, historyQuery, activeTags, sentimentFilter, historyPage]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const hasMore = analyses.length < total;
  const allCount = counts.positive + counts.neutral + counts.negative;

  const tagLabel = activeTags.length > 0 ? activeTags.map((t) => `"${t}"`).join(', ') : null;
  const emptyMessage = tagLabel && historyQuery
    ? `No articles tagged ${tagLabel} matching "${historyQuery}".`
    : tagLabel ? `No articles tagged ${tagLabel}.`
    : historyQuery ? `No analyzed articles match "${historyQuery}".`
    : undefined;

  return {
    analyses, analyzedMap, total, counts, allCount, hasMore, emptyMessage,
    historyQuery, setHistoryQuery,
    activeTags, handleTagClick,
    sentimentFilter, setSentimentFilter,
    historyLoading, handleLoadMore,
    handleAnalyze, handleDeleteArticle, handleClearAll,
    analyzingUrl, analyzeError, actionError,
  };
}
