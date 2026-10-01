import styles from './Support.module.css';

interface Props {
  label: string;
  onClick: (value: any) => void;
  selected: boolean;
  value: string;
}

export default function HelpCategory({ label, onClick, selected, value }: Props) {
  return (
    <div
      className={
        selected ? `${styles.helpCategory} ${styles.categorySelected}` : styles.helpCategory
      }
      onClick={() => onClick(value)}
    >
      {label}
    </div>
  );
}
