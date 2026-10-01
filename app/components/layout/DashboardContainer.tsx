import { ReactNode } from 'react';
import styles from './Layout.module.css';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  header?: string;
  target?: string;
  targetLabel?: string;
  width?: string | number;
}

export default function DashboardContainer({ children, header, target, targetLabel, width = "100%"}: Props) {
  return (
    <div className={styles.dashboardContainer} style={{width}}>
      {header && (
        <div className={styles.dashboardContainerHeader}>
          <h2 className={styles.dashboardHeader}>{header}</h2>
          {target && (
            <Link className="container-link" href={target}>
              {targetLabel}
            </Link>
          )}
        </div>
      )}
      <div className={styles.dashboardContent}>{children}</div>
    </div>
  );
}
