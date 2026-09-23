import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { CalendarCheck2, Plus } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const SchedulingPage: React.FC = () => {
  return (
    <PageShell
      title="Shift Rosters & Scheduling"
      description="Plan department shift coverage, manage team assignments, and process shift swap requests."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => alert('Shift assignment builder will connect in Sprint 2.')}
          >
            Create Shift Roster
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
          <CalendarCheck2 size={40} color="#2563EB" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Scheduling Grid Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Drag-and-drop shift rosters, team availability matrices, and real-time swap notifications will be activated in Sprint 2.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default SchedulingPage;
