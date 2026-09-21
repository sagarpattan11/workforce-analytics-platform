import React, { useState } from 'react';
import { Button, Chip, Stack, Typography, Box } from '@mui/material';
import { Download, RefreshCw, Calendar, Users } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <PageShell
      title="Workforce Dashboard"
      description="High-level workforce visibility, departmental distribution, and operational metrics."
      loading={loading}
      loadingMessage="Refreshing workforce metrics..."
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<Calendar size={14} />}
            label="Current Quarter: Q3 2026"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 500 }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Report export will connect in Sprint 2.')}
          >
            Export
          </Button>
        </Stack>
      }
    >
      {/* Clean Dashboard Placeholder Shell (Strictly no hardcoded fake statistics) */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            mb: 2,
          }}
        >
          <Users size={40} color="#1D4ED8" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Workforce Dashboard Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          This dashboard shell is configured with responsive layout slots and filter actions. Real-time workforce metrics, attrition calculations, and Recharts graphs will populate here from Task 5 onwards.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default DashboardPage;
