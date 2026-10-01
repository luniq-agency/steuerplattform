import { LucideIcon } from 'lucide-react';
import styles from './Buttons.module.css';

interface Props {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function InterfaceButton({ disabled, icon: Icon, label, onClick }: Props) {
  return (
    <button className={disabled ? `${styles.interfaceButton} ${styles.disabled}`: styles.interfaceButton} disabled={disabled} onClick={onClick}>
      {Icon && <Icon size={14} />}
      <span>{label}</span>
    </button>
  );
}
