import styles from './SearchSuggestions.module.css';

interface Props {
  recentSearches: string[];
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  onRemoveRecent: (search: string) => void;
}

export default function SearchSuggestions({
  recentSearches,
  suggestions,
  onSelect,
  onRemoveRecent,
}: Props) {
  if (recentSearches.length === 0 && suggestions.length === 0) return null;

  return (
    <div className={styles.dropdown}>
      {recentSearches.length > 0 && (
        <section>
          <p className={styles.sectionLabel}>Recent searches</p>
          <ul className={styles.list}>
            {recentSearches.map((s) => (
              <li key={s} className={styles.row}>
                <button className={styles.item} onMouseDown={() => onSelect(s)}>
                  <span className={styles.icon}>🕐</span>
                  {s}
                </button>
                <button
                  className={styles.removeBtn}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveRecent(s); }}
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.length > 0 && (
        <section>
          {recentSearches.length > 0 && <div className={styles.divider} />}
          <p className={styles.sectionLabel}>Popular news</p>
          <ul className={styles.list}>
            {suggestions.map((s) => (
              <li key={s}>
                <button className={styles.item} onMouseDown={() => onSelect(s)}>
                  <span className={styles.icon}>🔍</span>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
