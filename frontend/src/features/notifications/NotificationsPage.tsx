import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { Bell, CheckCheck } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const NotificationsPage: React.FC = () => {
  return (
    <PageShell
      title="Platform Notifications"
      description="Real-time alerts, operational updates, shift reminders, and approval requests."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCheck size={16} />}
            onClick={() => alert('Mark all as read will connect to notification service in Sprint 2.')}
          >
            Mark All as Read
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
          <Bell size={40} color="#1D4ED8" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Notifications Center Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Socket.IO real-time notification streams and operational alerts will populate here when the backend websocket gateway is activated.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default NotificationsPage;
