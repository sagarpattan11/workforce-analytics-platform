import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Key, Trash2, Plus, ShieldCheck, Laptop, Smartphone } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { api } from '../../api/client';

interface PasskeyItem {
  _id: string;
  credentialID: string;
  nickname: string;
  deviceType: 'singleDevice' | 'multiDevice';
  transports: string[];
  createdAt: string;
  lastUsedAt: string;
}

export const PasskeyManager: React.FC = () => {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog State for naming the key
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nickname, setNickname] = useState('');

  // Fetch registered passkeys from backend
  const fetchPasskeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PasskeyItem[]>('/auth/passkey/list');
      setPasskeys((res as unknown as { data: PasskeyItem[] }).data || []);
    } catch (err) {
      setError('Unable to load registered passkeys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasskeys();
  }, []);

  // Step 1: Open modal to name the key
  const handleOpenAddKey = () => {
    setNickname('My Security Key');
    setError(null);
    setSuccess(null);
    setDialogOpen(true);
  };

  // Step 2: Trigger WebAuthn Browser Registration
  const handleRegisterPasskey = async () => {
    setDialogOpen(false);
    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Get challenge options from backend
      const optionsRes = await api.post<{ options: any }>('/auth/passkey/register-options');
      const { options } = optionsRes as unknown as { options: any };

      // 2. Browser native prompt (Windows Hello / Touch ID / YubiKey)
      const regResponse = await startRegistration({ optionsJSON: options });

      // 3. Send signature to backend for verification and storage
      await api.post('/auth/passkey/verify-registration', {
        registrationResponse: regResponse,
        nickname: nickname.trim() || 'Security Key',
      });

      setSuccess('Passkey registered successfully!');
      fetchPasskeys();
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Registration was canceled or timed out.');
      } else {
        setError(err.message || 'Failed to register passkey.');
      }
    } finally {
      setRegistering(false);
    }
  };

  // Step 3: Revoke a passkey
  const handleRevokePasskey = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke "${name}"?`)) return;

    try {
      await api.delete(`/auth/passkey/${id}`);
      setSuccess(`"${name}" was revoked successfully.`);
      fetchPasskeys();
    } catch (err) {
      setError('Failed to revoke passkey.');
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header & Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            FIDO2 Security Keys & Passkeys
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sign in securely using your fingerprint, Windows Hello, Face ID, or a physical USB/NFC security key.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={registering ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
          onClick={handleOpenAddKey}
          disabled={registering}
        >
          {registering ? 'Waiting for Device...' : 'Add Passkey'}
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Passkey List */}
      {loading ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : passkeys.length === 0 ? (
        <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Key size={32} color="#94A3B8" />
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              No passkeys registered yet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Add your device or hardware key to enable one-touch passwordless sign-in.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {passkeys.map((key) => (
            <Card key={key._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: '16px !important' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {key.deviceType === 'multiDevice' ? <Smartphone size={20} /> : <Laptop size={20} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {key.nickname}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <Chip
                          icon={<ShieldCheck size={12} />}
                          label={key.deviceType === 'multiDevice' ? 'Passkey' : 'Hardware Security Key'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Added: {new Date(key.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Revoke passkey"
                    onClick={() => handleRevokePasskey(key._id, key.nickname)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Dialog: Name your security key */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Register Security Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Give your passkey or security key a nickname so you can identify it later (e.g., <em>Windows Hello Laptop</em>, <em>YubiKey 5C</em>).
          </Typography>
          <TextField
            autoFocus
            label="Device Nickname"
            fullWidth
            size="small"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRegisterPasskey} variant="contained">
            Continue to Device Prompt
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasskeyManager;
