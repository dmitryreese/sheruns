import { useState, useCallback } from 'react';
import { GNewsArticle } from '@/lib/gnews';

export function useNewsSearch() {
  const [searchResults, setSearchResults] = useState<GNewsArticle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/news/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Search failed');
      setSearchResults(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  return { searchResults, hasSearched, searchLoading, searchError, handleSearch };
}
