import React from 'react';
import { Typography, Box, Stack, Avatar, Chip, Divider } from '@mui/material';
import { User, Mail, Shield } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const ProfilePage: React.FC = () => {
  return (
    <PageShell
      title="User Profile"
      description="Personal account details and security access roles."
    >
      <Box sx={{ maxWidth: 640 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 700 }}>
            SA
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Sagar
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Chip label="Admin" color="primary" size="small" sx={{ fontWeight: 600 }} />
              <Typography variant="caption" color="text.secondary">
                System Administrator
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Mail size={18} color="#64748B" />
            <Typography variant="body2" color="text.secondary">
              Email: <strong>sagar@workforce.internal</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Shield size={18} color="#64748B" />
            <Typography variant="body2" color="text.secondary">
              Role Authority: <strong>Full Platform Administration</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <User size={18} color="#64748B" />
            <Typography variant="body2" color="text.secondary">
              Status: <strong style={{ color: '#10B981' }}>Active Session</strong>
            </Typography>
          </Box>
        </Stack>
      </Box>
    </PageShell>
  );
};

export default ProfilePage;
