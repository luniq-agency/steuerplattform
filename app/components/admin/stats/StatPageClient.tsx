'use client';

import { clientStatsLoad } from '@/app/actions/stats';
import DividerBlock from '@/app/components/DividerBlock';
import CertificateStatCard from '@/app/components/stats/CertificateStatCard';
import ClientStatCards from '@/app/components/stats/ClientStatCard';
import InvoiceStatCards from '@/app/components/stats/InvoiceStatCard';
import RevealBox from '@/app/components/ui/RevealBox';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import LineChart from '../../charts/LineChart';

const viewOptions = [
  {
    label: 'Monat',
    value: 'month',
  },
  {
    label: 'Jahr',
    value: 'year',
  },
  {
    label: 'Gesamt',
    value: 'all',
  },
];
export default function StatPageClient() {
  const [chartData, setChartData] = useState<
    {
      day: string;
      month: string;
      count: number;
      freelancer_count: number;
      employed_count: number;
      self_employed_count: number;
      cumulative_count: number;
    }[]
  >([]);
  const [view, setView] = useState<'month' | 'year' | 'all'>('month');

  useEffect(() => {
    clientStatsLoad(view).then((data) => setChartData(data));
  }, [view]);

  const labels = chartData.map((d) => {
    const date = new Date(d.day ?? d.month);
    if (view === 'month')
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    if (view === 'year') return date.toLocaleDateString('de-DE', { month: 'short' });
    return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
  });

  const isAll = view === 'all';

  const series = [
    {
      name: 'Gesamt',
      data: chartData.map((d, i) => ({ x: labels[i], y: isAll ? d.cumulative_count : d.count })),
    },
    {
      name: 'Angestellt',
      data: chartData.map((d, i) => ({ x: labels[i], y: d.employed_count })),
    },
    {
      name: 'Freelancer',
      data: chartData.map((d, i) => ({ x: labels[i], y: d.freelancer_count })),
    },
    {
      name: 'Selbstständig',
      data: chartData.map((d, i) => ({ x: labels[i], y: d.self_employed_count })),
    },
  ];

  return (
    <div className="page-content">
      <div className="row align-center space-between">
        <h1>Statistiken</h1>
        <Dropdown onChange={(e) => setView(e.value)} options={viewOptions} value={view} />
      </div>
      <DividerBlock height={1} />
      <div className="grid columns-two gap-m mobile-column">
        <RevealBox delay={0.5}>
          <div className="column gap-m">
            <h3>Zertifikate</h3>
            <CertificateStatCard view={view} />
          </div>
        </RevealBox>
        <RevealBox delay={1}>
          <div className="column gap-m">
            <h3>Rechnungen</h3>
            <InvoiceStatCards view={view} />
          </div>
        </RevealBox>
      </div>
      <DividerBlock height={2} />
      <RevealBox className="container" delay={1.5}>
        <div className="column">
          <h3>Anmeldungen</h3>
          <DividerBlock height={1} />
          <LineChart
            colors={['#4b39ef', '#48F5B6', '#f59e0b', '#6366f1']}
            height={300}
            series={series}
          />
          {/*<ClientStatCards view={view} />*/}
        </div>
      </RevealBox>
    </div>
  );
}
