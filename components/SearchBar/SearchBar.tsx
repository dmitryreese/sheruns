import { useState, useRef, FormEvent } from 'react';
import styles from './SearchBar.module.css';
import SearchSuggestions from '../SearchSuggestions';

const POPULAR = [
  'Federal Reserve interest rates',
  'OpenAI latest news',
  'Apple earnings report',
  'Ukraine war update',
  'Tesla stock price',
  'Amazon layoffs',
  'Climate change summit',
  'US election 2024',
  'Meta AI announcements',
  'Bitcoin price surge',
  'NATO summit developments',
  'SpaceX rocket launch',
  'Google antitrust ruling',
  'Microsoft Copilot update',
  'Oil price forecast',
  'Nvidia earnings results',
  'China economy slowdown',
  'Healthcare reform bill',
];

const RECENT_KEY = 'news-analyzer:recent-searches';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecent(searches: string[]): void {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches));
}

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : loadRecent()
  );

  const filteredPopular = value.trim()
    ? POPULAR.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    : POPULAR;

  const filteredRecent = value.trim()
    ? recentSearches.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    : recentSearches;

  const showDropdown = focused && (filteredRecent.length > 0 || filteredPopular.length > 0);

  function pushRecent(q: string) {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    saveRecent(updated);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      pushRecent(value.trim());
      setFocused(false);
      onSearch(value.trim());
    }
  }

  function handleSelect(suggestion: string) {
    setValue(suggestion);
    pushRecent(suggestion);
    setFocused(false);
    onSearch(suggestion);
  }

  function handleRemoveRecent(search: string) {
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    saveRecent(updated);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <input
          className={`${styles.input} ${value ? styles.inputWithClear : ''}`}
          type="text"
          placeholder="Search news…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); setFocused(true); }}
          onBlur={() => { blurTimerRef.current = setTimeout(() => setFocused(false), 150); }}
          onKeyDown={(e) => e.key === 'Escape' && setFocused(false)}
          disabled={loading}
        />
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onMouseDown={(e) => { e.preventDefault(); setValue(''); }}
            aria-label="Clear search"
          >×</button>
        )}
        {showDropdown && (
          <SearchSuggestions
            recentSearches={filteredRecent}
            suggestions={filteredPopular}
            onSelect={handleSelect}
            onRemoveRecent={handleRemoveRecent}
          />
        )}
      </div>
      <button className={styles.button} type="submit" disabled={loading || !value.trim()}>
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}
