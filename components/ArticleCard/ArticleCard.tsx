import { GNewsArticle } from '@/lib/gnews';
import { AnalyzedArticle } from '@/lib/types';
import SentimentBadge from '@/components/SentimentBadge';
import TagList from '@/components/TagList';
import styles from './ArticleCard.module.css';

interface Props {
  article: GNewsArticle;
  analyzed?: AnalyzedArticle;
  onAnalyze: (article: GNewsArticle) => void;
  analyzing: boolean;
  activeTags?: string[];
  onTagClick?: (tag: string) => void;
}

export default function ArticleCard({ article, analyzed, onAnalyze, analyzing, activeTags, onTagClick }: Props) {
  return (
    <div className={styles.card}>
      {article.image && (
        <img className={styles.image} src={article.image} alt="" />
      )}
      <div className={styles.body}>
        <a className={styles.title} href={article.url} target="_blank" rel="noreferrer">
          {article.title}
        </a>
        <p className={styles.description}>{article.description}</p>
        <span className={styles.source}>{article.source.name}</span>

        {analyzed ? (
          <div className={styles.analysis}>
            <SentimentBadge sentiment={analyzed.sentiment} />
            <TagList tags={analyzed.tags} activeTags={activeTags} onTagClick={onTagClick} />
            <p className={styles.summary}>{analyzed.summary}</p>
          </div>
        ) : (
          <button
            className={styles.analyzeBtn}
            onClick={() => onAnalyze(article)}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        )}
      </div>
    </div>
  );
}
