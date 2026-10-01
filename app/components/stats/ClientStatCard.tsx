'use client';

import { clientMonthlyStatsLoad } from '@/app/actions/stats';
import styles from './Stats.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { ClientMonthlyStats } from '@/app/types/Database';
import { useEffect, useState } from 'react';
import DividerBlock from '../DividerBlock';

interface Props {
  view: 'month' | 'year' | 'all';
}

export default function ClientStatCards({ view }: Props) {
  const [current, setCurrent] = useState<ClientMonthlyStats | null>(null);

  useEffect(() => {
    clientMonthlyStatsLoad(view).then((data) => {
      if (view === 'month') {
        if (data[0]) {
          setCurrent(data[0]);
        } else {
          clientMonthlyStatsLoad('all').then((allData) => {
            if (allData[0]) {
              setCurrent({
                ...allData[0],
                total_count: 0,
                employed_count: 0,
                freelancer_count: 0,
                self_employed_count: 0,
                previous_month_total: allData[0].total_count,
                previous_employed_count: allData[0].employed_count,
                previous_freelancer_count: allData[0].freelancer_count,
                previous_self_employed_count: allData[0].self_employed_count,
              });
            }
          });
        }
      } else {
        const total = data.reduce(
          (acc, d) => ({
            ...acc,
            total_count: (acc.total_count ?? 0) + (d.total_count ?? 0),
            employed_count: (acc.employed_count ?? 0) + (d.employed_count ?? 0),
            freelancer_count: (acc.freelancer_count ?? 0) + (d.freelancer_count ?? 0),
            self_employed_count: (acc.self_employed_count ?? 0) + (d.self_employed_count ?? 0),
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
      description: 'alle Kunden',
      icon: 'pi pi-users',
      label: 'Gesamt',
      value: current.total_count,
      prev: current.previous_month_total,
    },
    {
      description: 'bei Unternehmen angestellt',
      icon: 'pi pi-building',
      label: 'Angestellt',
      value: current.employed_count,
      prev: current.previous_employed_count,
    },
    {
      description: 'Kunden mit Freelancer-Business',
      icon: 'pi pi-user',
      label: 'Freelancer',
      value: current.freelancer_count,
      prev: current.previous_freelancer_count,
    },
    {
      description: 'Kunden mit eigenem Business',
      icon: 'pi pi-shop',
      label: 'Selbstständig',
      value: current.self_employed_count,
      prev: current.previous_self_employed_count,
    },
  ];

  return (
    <div className="row gap-m">
      {stats.map((stat) => {
        const diff = stat.value - (stat.prev ?? stat.value);
        const isNegative = diff < 0;
        const isPositive = diff > 0;
        return (
          <div key={stat.label} className="container padding-m column gap-s">
            <div className="row gap-s align-center">
              <div className={styles.iconWrapper}>
                <i className={stat.icon} style={{ color: 'white' }} />
              </div>
              <div className="column">
                <span className={styles.label}>{stat.label}</span>
                <span className={styles.description}>{stat.description}</span>
              </div>
            </div>
            <DividerBlock height={2} />
            <div className="row align-center gap-m">
              <h2 className={styles.statValue}>{stat.value}</h2>
              {view === 'month' && (
                <span
                  className={
                    isPositive
                      ? `${styles.statPercent} ${styles.positive}`
                      : isNegative
                        ? `${styles.statPercent} ${styles.negative}`
                        : styles.statPercent
                  }
                >
                  {isPositive ? '▲' : isNegative ? '▼' : '±'} {diff ?? 0}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
