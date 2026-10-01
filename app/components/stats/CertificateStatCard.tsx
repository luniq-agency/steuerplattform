'use client';

import { certificateStatsLoad } from '@/app/actions/stats';
import styles from './Stats.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { CertificateMonthlyStats } from '@/app/types/Database';
import { useEffect, useState } from 'react';
import DividerBlock from '../DividerBlock';
import { formatMonth } from '@/app/utils/formats';

interface Props {
  view: 'month' | 'year' | 'all';
}

export default function CertificateStatCard({ view }: Props) {
  const { userProfile } = useAuth();
  const [current, setCurrent] = useState<CertificateMonthlyStats | null>(null);

  useEffect(() => {
    certificateStatsLoad(view).then((data) => {
      if (view === 'month') {
        if (data[0]) {
          setCurrent(data[0]);
        } else {
          // Kein Eintrag für diesen Monat – letzten Monat als Vergleich laden
          certificateStatsLoad('all').then((allData) => {
            const lastMonth = allData[0]; // neuester Eintrag
            setCurrent({
              certificate_count: 0,
              change_absolute: lastMonth ? -lastMonth.certificate_count : 0,
              change_percent: lastMonth ? -100 : 0,
              previous_month_count: lastMonth?.certificate_count ?? 0,
              month: new Date().toISOString(),
            });
          });
        }
      } else {
        const total = data.reduce((sum, d) => sum + (d.certificate_count ?? 0), 0);
        setCurrent({ ...data[0], certificate_count: total });
      }
    });
  }, [view]);

  if (!current) return null;

  const text =
    view === 'month'
      ? 'diesen Monat ausgestellt'
      : view === 'year'
        ? 'dieses Jahr ausgestellt'
        : 'ausgestellt';

  const isNegative = (current.change_absolute ?? 0) < 0;
  const isPositive = (current.change_absolute ?? 0) > 0;

  return (
    <div className="container padding-m column gap-s">
      <div className="row gap-s align-center">
        <div className={styles.iconWrapper}>
          <i className="pi pi-file" style={{ color: 'white' }} />
        </div>
        <div className="column">
          <span className={styles.label}>Zertifikate</span>
          <span className={styles.description}>{text}</span>
        </div>
      </div>
      <DividerBlock height={2} />
      <div className="row align-center gap-m">
        <h2 className={styles.statValue}>{current.certificate_count}</h2>
        {view === 'month' && (
          <span
            className={`${styles.statPercent} ${isPositive ? styles.positive : isNegative ? styles.negative : styles.neutral}`}
          >
            {isPositive ? '▲' : isNegative ? '▼' : '±'} {current.change_percent ?? 0}%
          </span>
        )}
      </div>
    </div>
  );
}
