import { useState } from 'react';
import styles from './ConfirmClearButton.module.css';

interface Props {
  onConfirm: () => void;
}

export default function ConfirmClearButton({ onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <>
        <button className={styles.cancel} onClick={() => setConfirming(false)}>Cancel</button>
        <button className={styles.confirm} onClick={() => { onConfirm(); setConfirming(false); }}>Confirm</button>
      </>
    );
  }

  return (
    <button className={styles.clearAll} onClick={() => setConfirming(true)}>Clear all</button>
  );
}
