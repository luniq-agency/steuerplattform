import { ReactNode } from 'react';
import styles from './Layout.module.css';

interface Props {
  children: ReactNode;
  columns: number;
  gap: string | number;
  grow?: boolean;
}

export default function Grid({ children, columns, gap, grow, }: Props) {
  return (
    <div className={styles.grid} style={{ flexGrow: grow ? 1 : undefined, gap, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {children}
    </div>
  );
}
