'use client';

import DividerBlock from '../DividerBlock';
import { Registration } from '@/app/actions/stats';
import styles from './Cards.module.css';
import { LucideIcon } from 'lucide-react';
import Row from '../layout/Row';
import Column from '../layout/Column';
import DashboardContainer from '../layout/DashboardContainer';
import { formatCurrency } from '@/app/utils/formats';

interface Props {
  disclaimer?: string;
  header: string;
  icon: LucideIcon;
  mode?: 'currency' | 'plain';
  value: number;
}

export default function StatCard({ disclaimer, header, icon: Icon, mode = 'plain', value }: Props) {

  const formatted = mode == 'currency' ? formatCurrency(value) : value;

  return (
    <DashboardContainer>
        <Column gap={8}>
          <span className={styles.cardHeader}>{header}</span>
          <span className={styles.value}>{formatted}</span>
        </Column>
    </DashboardContainer>
  );
}
