import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { History, Download } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const AuditLogsPage: React.FC = () => {
  return (
    <PageShell
      title="Platform Audit Logs"
      description="Immutable audit trail of administrative actions, user logins, role changes, and data modifications."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Audit trail export connects in Sprint 3.')}
          >
            Export Logs
          </Button>
        </Stack>
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
          <History size={40} color="#DC2626" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          System Audit Trail Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Security events, role privilege elevations, IP address tracking, and compliance timestamps will stream here directly from the backend audit log service.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default AuditLogsPage;
