import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { FileText, Plus } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const ReportsPage: React.FC = () => {
  return (
    <PageShell
      title="Executive Reports & Exports"
      description="Build custom workforce reports, schedule automated executive summaries, and export data in CSV/PDF formats."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => alert('Custom report builder will connect in Sprint 3.')}
          >
            Create Custom Report
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
          <FileText size={40} color="#1D4ED8" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Executive Reports Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Automated executive summaries, scheduled email reports, and export pipelines will connect in Sprint 3.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default ReportsPage;
