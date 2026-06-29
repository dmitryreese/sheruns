import styles from './SearchSkeleton.module.css';

export default function SearchSkeleton() {
  return (
    <div className={styles.list}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.image} />
          <div className={styles.body}>
            <div className={`${styles.line} ${styles.titleLine}`} />
            <div className={`${styles.line} ${styles.descLine1}`} />
            <div className={`${styles.line} ${styles.descLine2}`} />
            <div className={`${styles.line} ${styles.sourceLine}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
