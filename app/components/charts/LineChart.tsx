'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DataPoint {
  x: string | number;
  y: number;
}

interface Series {
  name: string;
  data: DataPoint[];
}

interface Props {
  colors?: string[];
  height?: number;
  series: Series[];
}

export default function LineChart({
  colors = ['#4b39ef', '#48F5B6', '#f59e0b', '#ef4444'],
  height = 200,
  series,
}: Props) {
  const options: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors,
    xaxis: { type: 'category', labels: { style: { colors: '#888', fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#888', fontSize: '11px' } } },
    grid: { borderColor: '#f0f0f0' },
    tooltip: { theme: 'light' },
    dataLabels: { enabled: false },
    legend: { show: true },
  };

  return <ApexChart height={height} options={options} series={series} type="line" width="100%" />;
}
