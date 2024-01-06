// SimpleBarChart.dynamic.tsx
import dynamic from 'next/dynamic';

export const HistoryChartDynamic = dynamic(
  () => import('./HistoryChart.jsx').then((mod) => mod.HistoryChart),
  { ssr: false }
)