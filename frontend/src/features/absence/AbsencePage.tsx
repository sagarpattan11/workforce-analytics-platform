import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { CalendarOff, Plus } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const AbsencePage: React.FC = () => {
  return (
    <PageShell
      title="Absence & Leave Management"
      description="Track employee leaves, absence requests, and departmental leave calendars."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => alert('Leave application drawer connects in Sprint 2.')}
          >
            Apply Leave
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
          <CalendarOff size={40} color="#D97706" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Absence Calendar Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Leave balances, manager approval workflows, and interactive absence calendars will populate once business schemas are loaded in Task 7.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default AbsencePage;
