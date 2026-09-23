import React from 'react';
import { Typography, Box, Stack, FormControlLabel, Switch, Divider } from '@mui/material';
import { Settings, Moon } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { useAppTheme } from '../../theme/ThemeContext';
import { PasskeyManager } from '../../components/auth/PasskeyManager';

export const SettingsPage: React.FC = () => {
  const { resolvedMode, toggleTheme } = useAppTheme();

  return (
    <PageShell
      title="Platform Settings"
      description="Configure visual preferences, notification channels, and platform security rules."
    >
      <Box sx={{ maxWidth: 640 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Settings size={22} color="#1D4ED8" />
          <Typography variant="h6" fontWeight={600}>
            Appearance & Preferences
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Dark Mode Theme
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Toggle between light and dark visual themes across the application.
              </Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={resolvedMode === 'dark'} onChange={toggleTheme} />}
              label={<Moon size={16} />}
            />
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Security & Session Protection
              </Typography>
              <Typography variant="caption" color="text.secondary">
                HTTP-only session cookies with strict cross-site request protection.
              </Typography>
            </Box>
            <Typography variant="caption" color="success.main" fontWeight={700}>
              Active
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* WebAuthn / Passkey & FIDO2 Security Keys Section */}
        <PasskeyManager />
      </Box>
    </PageShell>
  );
};

export default SettingsPage;
