import React from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { Shield } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { UserRole } from '../../config/routes.config';

interface RoleDashboardPageProps {
  role: UserRole;
  title: string;
  description: string;
}

export const RoleDashboardPage: React.FC<RoleDashboardPageProps> = ({
  role,
  title,
  description,
}) => {
  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <Chip
          icon={<Shield size={14} />}
          label={`Role View: ${role}`}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      }
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            mb: 2,
          }}
        >
          <Shield size={40} color="#1D4ED8" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title} Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={520} mx="auto">
          This role-specific dashboard shell provides customized KPI views and workflow shortcuts tailored specifically for <strong>{role}</strong> roles. Dynamic metrics will connect upon authentication integration.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default RoleDashboardPage;
