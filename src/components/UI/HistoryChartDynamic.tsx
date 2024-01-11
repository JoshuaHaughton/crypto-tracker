// SimpleBarChart.dynamic.tsx
import dynamic from 'next/dynamic';

export const HistoryChartDynamic = dynamic(
  () => import('./HistoryChart.jssx').then((mod) => mod.HistoryChart),
  { ssr: false }
)