import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { RoleGuard } from './RoleGuard';

// Feature Page Shells
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { EmployeesPage } from '../features/employees/EmployeesPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { AttritionRiskPage } from '../features/analytics/AttritionRiskPage';
import { AttendancePage } from '../features/attendance/AttendancePage';
import { AbsencePage } from '../features/absence/AbsencePage';
import { SchedulingPage } from '../features/scheduling/SchedulingPage';
import { CompliancePage } from '../features/compliance/CompliancePage';
import { PayrollPage } from '../features/payroll/PayrollPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { AuditLogsPage } from '../features/audit/AuditLogsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { RoleDashboardPage } from '../features/dashboard/RoleDashboardPage';

// Feedback Pages
import { AccessDeniedState } from '../components/feedback/AccessDeniedState';
import { NotFoundPage } from '../components/feedback/NotFoundPage';
import { ServerErrorPage } from '../components/feedback/ServerErrorPage';
import { LoginPage } from '../features/auth/LoginPage';
import { UserRole } from '../config/routes.config';

export const AppRoutes: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('wfa_current_role');
    return (saved as UserRole) || 'Admin';
  });

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('wfa_current_role', role);
  };

  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<Navigate to="/dashboard" replace />} />

      {/* Platform Enterprise Layout Routes */}
      <Route element={<MainLayout currentRole={currentRole} onRoleChange={handleRoleChange} />}>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Core Overview Route */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Workforce Group */}
        <Route
          path="/employees"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager', 'Team Lead']} currentRole={currentRole}>
              <EmployeesPage />
            </RoleGuard>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager', 'Team Lead']} currentRole={currentRole}>
              <EmployeesPage />
            </RoleGuard>
          }
        />

        {/* Operations Group */}
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/history" element={<AttendancePage />} />
        <Route
          path="/attendance/corrections"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager']} currentRole={currentRole}>
              <AttendancePage />
            </RoleGuard>
          }
        />
        <Route path="/absence" element={<AbsencePage />} />
        <Route path="/absence/calendar" element={<AbsencePage />} />
        <Route
          path="/scheduling"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager', 'Team Lead']} currentRole={currentRole}>
              <SchedulingPage />
            </RoleGuard>
          }
        />
        <Route
          path="/scheduling/shifts"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager', 'Team Lead']} currentRole={currentRole}>
              <SchedulingPage />
            </RoleGuard>
          }
        />
        <Route
          path="/scheduling/swaps"
          element={
            <RoleGuard allowedRoles={['Admin', 'Manager', 'Team Lead', 'Employee']} currentRole={currentRole}>
              <SchedulingPage />
            </RoleGuard>
          }
        />

        {/* Management Group */}
        <Route
          path="/analytics"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager']} currentRole={currentRole}>
              <AnalyticsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/attrition-risk"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager']} currentRole={currentRole}>
              <AttritionRiskPage />
            </RoleGuard>
          }
        />
        <Route
          path="/compliance"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR']} currentRole={currentRole}>
              <CompliancePage />
            </RoleGuard>
          }
        />
        <Route
          path="/payroll"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Employee']} currentRole={currentRole}>
              <PayrollPage />
            </RoleGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={['Admin', 'HR', 'Manager']} currentRole={currentRole}>
              <ReportsPage />
            </RoleGuard>
          }
        />

        {/* System Group */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/audit-logs"
          element={
            <RoleGuard allowedRoles={['Admin']} currentRole={currentRole}>
              <AuditLogsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleGuard allowedRoles={['Admin']} currentRole={currentRole}>
              <SettingsPage />
            </RoleGuard>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Role-Specific Dashboard Routes (Shells) */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard allowedRoles={['Admin']} currentRole={currentRole}>
              <RoleDashboardPage
                role="Admin"
                title="Admin Governance Dashboard"
                description="System administration, audit oversight, and security posture monitoring."
              />
            </RoleGuard>
          }
        />
        <Route
          path="/hr/dashboard"
          element={
            <RoleGuard allowedRoles={['HR', 'Admin']} currentRole={currentRole}>
              <RoleDashboardPage
                role="HR"
                title="HR Operations Dashboard"
                description="Workforce growth, attrition monitoring, and departmental talent metrics."
              />
            </RoleGuard>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <RoleGuard allowedRoles={['Manager', 'Admin']} currentRole={currentRole}>
              <RoleDashboardPage
                role="Manager"
                title="Department Manager Dashboard"
                description="Team attendance, shift approval queues, and staff allocation."
              />
            </RoleGuard>
          }
        />
        <Route
          path="/team-lead/dashboard"
          element={
            <RoleGuard allowedRoles={['Team Lead', 'Admin']} currentRole={currentRole}>
              <RoleDashboardPage
                role="Team Lead"
                title="Team Lead Dashboard"
                description="Shift rosters, daily task check-ins, and peer skill coverage."
              />
            </RoleGuard>
          }
        />
        <Route
          path="/employee/dashboard"
          element={
            <RoleGuard allowedRoles={['Employee', 'Admin']} currentRole={currentRole}>
              <RoleDashboardPage
                role="Employee"
                title="Employee Self-Service Dashboard"
                description="Personal shift schedules, leave balance, and learning recommendations."
              />
            </RoleGuard>
          }
        />

        {/* 403 Forbidden Route */}
        <Route path="/403" element={<AccessDeniedState />} />

        {/* 500 Server Error Route */}
        <Route path="/500" element={<ServerErrorPage />} />

        {/* 404 Route Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
