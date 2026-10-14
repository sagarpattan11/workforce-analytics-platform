import React from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { PerformanceReportView } from './components/PerformanceReportView';

export const PerformanceReportPage: React.FC = () => {
  return (
    <PageShell
      title="Performance Analytics & Promotion Readiness"
      description="Multi-dimensional performance tracking, behavioral correlations (Attendance & L&D), and algorithmic promotion qualification pipelines."
      disablePaper
    >
      <PerformanceReportView />
    </PageShell>
  );
};

export default PerformanceReportPage;
