import styles from './TagList.module.css';

interface Props {
  tags: string[];
  activeTags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
}

export default function TagList({ tags, activeTags, onTagClick, className }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className={`${styles.tags} ${className ?? ''}`}>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`${styles.tag} ${activeTags?.includes(tag) ? styles.tagActive : ''}`}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
