'use client';

import styles from './Cards.module.css';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import Row from '../layout/Row';
import Column from '../layout/Column';
import DashboardContainer from '../layout/DashboardContainer';
import { formatCurrency } from '@/app/utils/formats';
import { Vergleich } from '@/app/utils/vergleich';

interface Props {
  disclaimer?: string;
  header: string;
  icon?: LucideIcon;
  mode?: 'currency' | 'plain';
  /** true, wenn weniger besser ist (z. B. "Offen") */
  umgekehrt?: boolean;
  value: number;
  vergleich?: Vergleich | null;
}

export default function StatCard({
  disclaimer,
  header,
  icon: Icon,
  mode = 'plain',
  umgekehrt = false,
  value,
  vergleich,
}: Props) {
  const format = (n: number) => (mode === 'currency' ? formatCurrency(n) : n.toLocaleString('de-DE'));

  // Farbe: hoch = gut (außer bei umgekehrt)
  const ton =
    !vergleich || vergleich.richtung === 'gleich'
      ? styles.trendNeutral
      : (vergleich.richtung === 'hoch') !== umgekehrt
        ? styles.trendGut
        : styles.trendSchlecht;

  const TrendIcon = vergleich?.richtung === 'hoch' ? TrendingUp : vergleich?.richtung === 'runter' ? TrendingDown : Minus;

  const trendText = vergleich
    ? vergleich.prozent !== null
      ? `${vergleich.prozent > 0 ? '+' : ''}${vergleich.prozent.toLocaleString('de-DE')} %`
      : `${vergleich.differenz > 0 ? '+' : ''}${format(vergleich.differenz)}`
    : '';

  return (
    <DashboardContainer>
      <Column gap={8}>
        <Row alignItems="center" gap={8} justifyContent="space-between">
          <span className={styles.cardHeader}>{header}</span>
          {Icon && <Icon className={styles.cardIcon} size={18} />}
        </Row>

        <span className={styles.value}>{format(value)}</span>

        {vergleich && (
          <span
            className={`${styles.trend} ${ton}`}
            title={`Vorher: ${format(vergleich.vorher)} (${vergleich.differenz > 0 ? '+' : ''}${format(vergleich.differenz)})`}
          >
            <TrendIcon size={14} />
            <strong>{trendText}</strong>
            <span className={styles.trendLabel}>{vergleich.label}</span>
          </span>
        )}

        {disclaimer && <span className={styles.disclaimer}>{disclaimer}</span>}
      </Column>
    </DashboardContainer>
  );
}