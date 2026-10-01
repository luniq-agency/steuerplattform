import { LucideIcon } from 'lucide-react';
import styles from './Buttons.module.css';

interface Props {
  bg?: string;
  disabled?: boolean;
  icon: LucideIcon;
  onClick?: () => void;
  padding?: string | number;
  round?: boolean;
}

export function IconButton({ bg, disabled, icon: Icon, onClick, padding, round }: Props) {
  return (
    <button
      className={disabled ? `${styles.iconButton} ${styles.disabled}` : styles.iconButton}
      disabled={disabled}
      onClick={onClick}
      style={{backgroundColor: bg, borderRadius: round ? 200 : 8, padding}}
    >
      {Icon && <Icon size={14} />}
    </button>
  );
}
