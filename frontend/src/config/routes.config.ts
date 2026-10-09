import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarOff,
  CalendarCheck2,
  BarChart3,
  ShieldCheck,
  CreditCard,
  FileText,
  Bell,
  History,
  Settings,
  User,
  ShieldAlert,
  BrainCircuit,
} from 'lucide-react';

// Enterprise Roles matching Sprint 1 specification
export type UserRole =
  | 'Admin'
  | 'HR Manager'
  | 'Executive'
  | 'Department Manager'
  | 'Team Lead'
  | 'Employee'
  | 'HR'
  | 'Manager';

// Navigation Groups
export type NavigationGroup = 'Overview' | 'Workforce' | 'Operations' | 'Management' | 'System';

// Route Definition Interface
export interface AppRoute {
  path: string;
  label: string;
  breadcrumbLabel: string;
  icon?: LucideIcon;
  group?: NavigationGroup;
  inSidebar: boolean;
  allowedRoles?: UserRole[];
  description?: string;
}

// Central Route Registry
export const APP_ROUTES: AppRoute[] = [
  // Overview Group
  {
    path: '/dashboard',
    label: 'Dashboard',
    breadcrumbLabel: 'Dashboard',
    icon: LayoutDashboard,
    group: 'Overview',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Workforce overview, key metrics and departmental summary',
  },

  // Workforce Group
  {
    path: '/employees',
    label: 'Employees',
    breadcrumbLabel: 'Employees',
    icon: Users,
    group: 'Workforce',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'HR', 'Manager'],
    description: 'Workforce directory, headcount and employee profiles',
  },
  {
    path: '/employees/:id',
    label: 'Employee Details',
    breadcrumbLabel: 'Employee Profile',
    inSidebar: false,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'HR', 'Manager'],
    description: 'Detailed employee profile, skills and employment history',
  },

  // Operations Group
  {
    path: '/attendance',
    label: 'Attendance',
    breadcrumbLabel: 'Attendance',
    icon: Clock,
    group: 'Operations',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Attendance logs, check-in history and time tracking',
  },
  {
    path: '/attendance/history',
    label: 'Attendance History',
    breadcrumbLabel: 'Attendance History',
    inSidebar: false,
    allowedRoles: ['Admin', 'HR Manager', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Historical attendance records and time-tracking data',
  },
  {
    path: '/attendance/corrections',
    label: 'Attendance Corrections',
    breadcrumbLabel: 'Attendance Corrections',
    inSidebar: false,
    allowedRoles: ['Admin', 'HR Manager', 'Department Manager', 'HR', 'Manager'],
    description: 'Review and approve attendance punch corrections',
  },
  {
    path: '/absence',
    label: 'Absence',
    breadcrumbLabel: 'Absence & Leave',
    icon: CalendarOff,
    group: 'Operations',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Leave applications, approvals and absence calendar',
  },
  {
    path: '/absence/calendar',
    label: 'Absence Calendar',
    breadcrumbLabel: 'Absence Calendar',
    inSidebar: false,
    allowedRoles: ['Admin', 'HR Manager', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Team and department leave schedule calendar',
  },
  {
    path: '/scheduling',
    label: 'Scheduling',
    breadcrumbLabel: 'Scheduling & Shifts',
    icon: CalendarCheck2,
    group: 'Operations',
    inSidebar: true,
    allowedRoles: ['Admin', 'Department Manager', 'Team Lead', 'Manager'],
    description: 'Shift rosters, scheduling assignments and shift swaps',
  },
  {
    path: '/scheduling/shifts',
    label: 'Shift Management',
    breadcrumbLabel: 'Shifts',
    inSidebar: false,
    allowedRoles: ['Admin', 'Department Manager', 'Team Lead', 'Manager'],
    description: 'Shift creation, assignment, and roster management',
  },
  {
    path: '/scheduling/swaps',
    label: 'Shift Swaps',
    breadcrumbLabel: 'Shift Swaps',
    inSidebar: false,
    allowedRoles: ['Admin', 'Department Manager', 'Team Lead', 'Employee', 'Manager'],
    description: 'Employee shift swap requests and manager approvals',
  },

  // Management Group
  {
    path: '/analytics',
    label: 'Analytics',
    breadcrumbLabel: 'Skill & Workforce Analytics',
    icon: BarChart3,
    group: 'Management',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'HR', 'Manager', 'Team Lead'],
    description: 'Skill distribution, skill gaps and training recommendations',
  },
  {
    path: '/attrition-risk',
    label: 'Attrition Prediction',
    breadcrumbLabel: 'Explainable AI Attrition Risk',
    icon: BrainCircuit,
    group: 'Management',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'HR', 'Manager', 'Team Lead'],
    description: 'Explainable AI Attrition Risk Dashboard & SHAP Feature Importance',
  },
  {
    path: '/compliance',
    label: 'Compliance',
    breadcrumbLabel: 'Compliance & Audits',
    icon: ShieldCheck,
    group: 'Management',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'HR'],
    description: 'Labor compliance, policy adherence and regulatory checks',
  },
  {
    path: '/payroll',
    label: 'Payroll',
    breadcrumbLabel: 'Payroll & Compensation',
    icon: CreditCard,
    group: 'Management',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Employee', 'HR'],
    description: 'Compensation structures, payslips and payroll cycles',
  },
  {
    path: '/reports',
    label: 'Reports',
    breadcrumbLabel: 'Executive Reports',
    icon: FileText,
    group: 'Management',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'HR', 'Manager'],
    description: 'Report builder, export tools and executive analytics',
  },

  // System Group
  {
    path: '/notifications',
    label: 'Notifications',
    breadcrumbLabel: 'Notifications',
    icon: Bell,
    group: 'System',
    inSidebar: true,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'System alerts, shift notifications and approval requests',
  },
  {
    path: '/audit-logs',
    label: 'Audit Logs',
    breadcrumbLabel: 'Audit Logs',
    icon: History,
    group: 'System',
    inSidebar: true,
    allowedRoles: ['Admin'],
    description: 'System activity tracking, user actions and security logs',
  },
  {
    path: '/settings',
    label: 'Settings',
    breadcrumbLabel: 'Platform Settings',
    icon: Settings,
    group: 'System',
    inSidebar: true,
    allowedRoles: ['Admin'],
    description: 'Platform configurations, theme defaults and security parameters',
  },
  {
    path: '/profile',
    label: 'Profile',
    breadcrumbLabel: 'User Profile',
    icon: User,
    group: 'System',
    inSidebar: false,
    allowedRoles: ['Admin', 'HR Manager', 'Executive', 'Department Manager', 'Team Lead', 'Employee', 'HR', 'Manager'],
    description: 'Personal user profile and account details',
  },

  // Role Dashboard Shells
  {
    path: '/admin/dashboard',
    label: 'Admin Dashboard',
    breadcrumbLabel: 'Admin Overview',
    inSidebar: false,
    allowedRoles: ['Admin'],
    description: 'System administration and executive governance dashboard',
  },
  {
    path: '/hr/dashboard',
    label: 'HR Dashboard',
    breadcrumbLabel: 'HR Overview',
    inSidebar: false,
    allowedRoles: ['HR'],
    description: 'Workforce metrics, recruitment pipeline and employee growth',
  },
  {
    path: '/manager/dashboard',
    label: 'Manager Dashboard',
    breadcrumbLabel: 'Manager Overview',
    inSidebar: false,
    allowedRoles: ['Manager'],
    description: 'Departmental headcount, team attendance and approvals',
  },
  {
    path: '/team-lead/dashboard',
    label: 'Team Lead Dashboard',
    breadcrumbLabel: 'Team Lead Overview',
    inSidebar: false,
    allowedRoles: ['Team Lead'],
    description: 'Team shift coverage, daily attendance and skill tracking',
  },
  {
    path: '/employee/dashboard',
    label: 'Employee Dashboard',
    breadcrumbLabel: 'My Dashboard',
    inSidebar: false,
    allowedRoles: ['Employee'],
    description: 'Personal shift schedule, training recommendations and leave balances',
  },

  // Utility & Feedback Routes
  {
    path: '/login',
    label: 'Login',
    breadcrumbLabel: 'Sign In',
    inSidebar: false,
    description: 'Enterprise passkey and authentication portal',
  },
  {
    path: '/auth/callback',
    label: 'Auth Callback',
    breadcrumbLabel: 'Authentication Callback',
    inSidebar: false,
    description: 'Authentication token handoff and verification callback',
  },
  {
    path: '/403',
    label: 'Access Denied',
    breadcrumbLabel: 'Access Denied',
    icon: ShieldAlert,
    inSidebar: false,
    description: 'Unauthorized access feedback screen',
  },
  {
    path: '/404',
    label: 'Not Found',
    breadcrumbLabel: '404 Not Found',
    inSidebar: false,
    description: 'Page not found feedback screen',
  },
  {
    path: '/500',
    label: 'Server Error',
    breadcrumbLabel: '500 Server Error',
    inSidebar: false,
    description: 'Internal server error feedback screen',
  },
];

// Role equivalence mapping for enterprise roles
export const ROLE_ALIASES: Record<UserRole, UserRole[]> = {
  Admin: ['Admin', 'Executive', 'HR Manager', 'Department Manager', 'HR', 'Manager', 'Team Lead', 'Employee'],
  Executive: ['Executive', 'Manager', 'Admin'],
  'HR Manager': ['HR Manager', 'HR'],
  'Department Manager': ['Department Manager', 'Manager'],
  Manager: ['Manager', 'Department Manager'],
  HR: ['HR', 'HR Manager'],
  'Team Lead': ['Team Lead'],
  Employee: ['Employee'],
};

// Check if a role has access to a specific route
export const hasRouteAccess = (allowedRoles?: UserRole[], currentRole: UserRole = 'Admin'): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (currentRole === 'Admin') return true;
  const effectiveRoles = [currentRole, ...(ROLE_ALIASES[currentRole] || [])];
  return allowedRoles.some((r) => effectiveRoles.includes(r));
};

// Helper: Filter routes for the Sidebar by user role
export const getSidebarRoutes = (currentRole: UserRole): AppRoute[] => {
  return APP_ROUTES.filter((route) => {
    if (!route.inSidebar) return false;
    return hasRouteAccess(route.allowedRoles, currentRole);
  });
};

// Helper: Group routes for organized sidebar sections
export const getGroupedSidebarRoutes = (currentRole: UserRole): Record<NavigationGroup, AppRoute[]> => {
  const visibleRoutes = getSidebarRoutes(currentRole);
  const groups: Record<NavigationGroup, AppRoute[]> = {
    Overview: [],
    Workforce: [],
    Operations: [],
    Management: [],
    System: [],
  };

  visibleRoutes.forEach((route) => {
    if (route.group && groups[route.group]) {
      groups[route.group].push(route);
    }
  });

  return groups;
};
