import React from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { DemandForecastingView } from './components/DemandForecastingView';

export const DemandForecastingPage: React.FC = () => {
  return (
    <PageShell
      title="Strategic Workforce Demand Forecasting"
      description="12-Month predictive hiring projections, department headcount growth, regional shortages, and quarterly budget allocations."
      disablePaper
    >
      <DemandForecastingView />
    </PageShell>
  );
};

export default DemandForecastingPage;
