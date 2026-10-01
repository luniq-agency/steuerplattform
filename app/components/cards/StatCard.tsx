'use client';

import DividerBlock from '../DividerBlock';
import { Registration } from '@/app/actions/stats';
import styles from './Cards.module.css';
import { LucideIcon } from 'lucide-react';
import Row from '../layout/Row';
import Column from '../layout/Column';
import DashboardContainer from '../layout/DashboardContainer';

interface Props {
  disclaimer?: string;
  header: string;
  icon: LucideIcon;
  value: number;
}

export default function StatCard({ disclaimer, header, icon: Icon, value }: Props) {
  return (
    <DashboardContainer>
      <Row alignItems="center">
        <div className={styles.iconWrapper}>{Icon && <Icon size={20} />}</div>
        <Column gap={0}>
          <span className={styles.cardHeader}>{header}</span>
          <span className={styles.value}>{value}</span>
        </Column>
      </Row>
    </DashboardContainer>
  );
}
