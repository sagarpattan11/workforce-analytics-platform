import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { ShieldCheck, Download } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const CompliancePage: React.FC = () => {
  return (
    <PageShell
      title="Compliance & Policy Audits"
      description="Review labor law compliance, maximum hour limits, mandatory breaks, and organizational policies."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Compliance audit report connects in Sprint 3.')}
          >
            Audit Report
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
          <ShieldCheck size={40} color="#059669" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Compliance Dashboard Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Policy breach alerts, maximum shift checks, overtime compliance monitors, and regulatory audit exports will connect in Sprint 3.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default CompliancePage;
