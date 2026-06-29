import styles from './TopicChips.module.css';

const TOPICS = ['AI', 'Finance', 'Politics', 'Sports', 'Technology', 'Climate', 'Markets'];

interface Props {
  onSelect: (topic: string) => void;
}

export default function TopicChips({ onSelect }: Props) {
  return (
    <div className={styles.chips}>
      {TOPICS.map((topic) => (
        <button key={topic} className={styles.chip} onClick={() => onSelect(topic)}>
          {topic}
        </button>
      ))}
    </div>
  );
}
