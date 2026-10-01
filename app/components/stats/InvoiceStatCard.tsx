'use client';

import { certificateStatsLoad, invoiceMonthlyStatsLoad } from '@/app/actions/stats';
import styles from './Stats.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { CertificateMonthlyStats, InvoiceMonthlyStats } from '@/app/types/Database';
import { useEffect, useState } from 'react';
import DividerBlock from '../DividerBlock';
import { formatCurrency } from '@/app/utils/formats';

interface Props {
  view: 'month' | 'year' | 'all';
}

export default function InvoiceStatCards({ view }: Props) {
  const [current, setCurrent] = useState<InvoiceMonthlyStats | null>(null);

  useEffect(() => {
    invoiceMonthlyStatsLoad(view).then((data) => {
      if (view === 'month') {
        if (data[0]) {
          setCurrent(data[0]);
        } else {
          invoiceMonthlyStatsLoad('all').then((allData) => {
            if (allData[0]) {
              setCurrent({
                ...allData[0],
                paid_total: 0,
                sent_total: 0,
                paid_count: 0,
                sent_count: 0,
                previous_paid_total: allData[0].paid_total,
                previous_sent_total: allData[0].sent_total,
              });
            }
          });
        }
      } else {
        const total = data.reduce(
          (acc, d) => ({
            ...acc,
            paid_total: (acc.paid_total ?? 0) + (d.paid_total ?? 0),
            sent_total: (acc.sent_total ?? 0) + (d.sent_total ?? 0),
            paid_count: (acc.paid_count ?? 0) + (d.paid_count ?? 0),
            sent_count: (acc.sent_count ?? 0) + (d.sent_count ?? 0),
          }),
          data[0]
        );
        setCurrent(total);
      }
    });
  }, [view]);

  if (!current) return null;

  const stats = [
    {
      color: 'var(--success-text)',
      description: '',
      label: 'Bezahlt',
      value: current.paid_total,
      prev: current.previous_paid_total,
      count: current.paid_count,
    },
    {
      color: 'var(--error-text)',
      description: '',
      label: 'Versendet',
      value: current.sent_total,
      prev: current.previous_sent_total,
      count: current.sent_count,
    },
  ];

  return (
    <div className="row gap-m">
      {stats.map((stat) => {
        const diff = stat.value - (stat.prev ?? stat.value);
        const isPositive = diff >= 0;
        return (
          <div key={stat.label} className="container padding-m column gap-s">
            <div className="row gap-s align-center">
              <div className={styles.iconWrapper} style={{ background: stat.color }}>
                <i className="pi pi-euro" style={{ color: 'white' }} />
              </div>
              <div className="column">
                <span className={styles.label}>{stat.label}</span>
                <span className={styles.description}></span>
              </div>
            </div>
            <DividerBlock height={2} />
            <h2 className={styles.statValue}>{formatCurrency(stat.value)}</h2>
          </div>
        );
      })}
    </div>
  );
}
