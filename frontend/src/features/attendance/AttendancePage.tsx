import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { Clock, Calendar, Download } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const AttendancePage: React.FC = () => {
  return (
    <PageShell
      title="Attendance Management"
      description="Monitor organizational attendance, daily check-in logs, and timekeeping corrections."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Calendar size={16} />}
            onClick={() => alert('Date range picker will activate in Sprint 1.')}
          >
            Select Date
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Attendance report export connects in Sprint 1.')}
          >
            Export Attendance
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
          <Clock size={40} color="#059669" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Attendance Records Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Attendance timelines, check-in history, overtime calculations, and correction workflows will connect to the attendance API endpoints in subsequent tasks.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default AttendancePage;
