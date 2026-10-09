import React from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { AttritionDashboardView } from './components/AttritionDashboardView';

export const AttritionRiskPage: React.FC = () => {
  return (
    <PageShell
      title="Explainable AI Attrition Risk Analytics"
      description="Multi-factor attrition risk scoring, SHAP feature attribution, and predictive HR intervention recommendations."
      disablePaper
    >
      <AttritionDashboardView />
    </PageShell>
  );
};

export default AttritionRiskPage;
