import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole, hasRouteAccess } from '../config/routes.config';

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
  if (!hasRouteAccess(allowedRoles, currentRole)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleGuard;
