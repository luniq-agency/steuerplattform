'use client';

import { clientStatsLoad } from '@/app/actions/stats';
import DividerBlock from '@/app/components/DividerBlock';
import CertificateStatCard from '@/app/components/stats/CertificateStatCard';
import ClientStatCards from '@/app/components/stats/ClientStatCard';
import InvoiceStatCards from '@/app/components/stats/InvoiceStatCard';
import RevealBox from '@/app/components/ui/RevealBox';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import LineChart from '../../components/charts/LineChart';

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
export default function Statistiken() {

  return (
    <div className="page-content">
      
    </div>
  );
}
