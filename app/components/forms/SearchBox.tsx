import { Search } from 'lucide-react';
import styles from './Forms.module.css';

interface Props {
  id?: string;
  maxWidth: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export default function SearchBox({ id, maxWidth, onChange, placeholder, value }: Props) {
  return (
    <label className={styles.searchBox} id={id} style={{ maxWidth }}>
      <Search size={18} />
      <input
        className={styles.inputTransparent}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}
