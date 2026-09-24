import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../config/routes.config';

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  currentRole?: UserRole;
  children: React.ReactElement;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  currentRole = 'Admin',
  children,
}) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Admin has universal enterprise access
  if (currentRole === 'Admin') {
    return children;
  }

  // Role equivalence mapping for Sprint 1 enterprise roles
  const roleAliases: Record<string, string[]> = {
    'HR Manager': ['HR Manager', 'HR'],
    'Department Manager': ['Department Manager', 'Manager'],
    'Executive': ['Executive', 'Manager', 'Admin'],
    'Manager': ['Manager', 'Department Manager'],
    'HR': ['HR', 'HR Manager'],
    'Team Lead': ['Team Lead'],
    'Employee': ['Employee'],
  };

  const effectiveRoles = [currentRole, ...(roleAliases[currentRole] || [])];
  const hasAccess = allowedRoles.some((r) => effectiveRoles.includes(r as UserRole));

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleGuard;
