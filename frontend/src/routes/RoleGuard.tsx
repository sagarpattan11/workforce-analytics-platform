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
  // If allowedRoles specified and currentRole is not permitted, redirect to /403
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleGuard;
