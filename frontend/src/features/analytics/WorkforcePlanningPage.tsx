import React from 'react';
import { PageShell } from '../../components/layout/PageShell';
import { WorkforcePlanningView } from './components/WorkforcePlanningView';

export const WorkforcePlanningPage: React.FC = () => {
  return (
    <PageShell
      title="Strategic Workforce Planning & Scenario Simulator"
      description="Simulate 7 enterprise business scenarios, project headcount requirements, evaluate internal talent transfers, and forecast budget impact in ₹ INR."
      disablePaper
    >
      <WorkforcePlanningView />
    </PageShell>
  );
};

export default WorkforcePlanningPage;
