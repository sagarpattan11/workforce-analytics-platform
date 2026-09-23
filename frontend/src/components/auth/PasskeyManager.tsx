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
  Tooltip,
} from '@mui/material';
import {
  Key,
  Trash2,
  Plus,
  ShieldCheck,
  Laptop,
  Smartphone,
  Edit2,
  Usb,
  Radio,
} from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { api } from '../../api/client';

export interface PasskeyItem {
  _id: string;
  credentialID: string;
  friendlyName?: string;
  nickname?: string;
  credentialDeviceType?: 'singleDevice' | 'multiDevice';
  transports?: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export const PasskeyManager: React.FC = () => {
  const [credentials, setCredentials] = useState<PasskeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Add Key Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // Rename Dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<PasskeyItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Revoke Confirmation Dialog
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<PasskeyItem | null>(null);

  // 1. Fetch registered credentials
  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/auth/credentials');
      const list = res.data?.credentials || res.credentials || res.data || [];
      setCredentials(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load registered security keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // 2. Open Add Key Dialog
  const handleOpenAddKey = () => {
    setNewKeyName('');
    setError(null);
    setSuccess(null);
    setAddDialogOpen(true);
  };

  // 3. Register Key via WebAuthn Ceremony
  const handleRegisterPasskey = async () => {
    setAddDialogOpen(false);
    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      // Step A: Request challenge from backend
      const challengeRes: any = await api.post('/auth/register-challenge', {});
      const options = challengeRes.data?.options || challengeRes.options;

      if (!options) {
        throw new Error('Backend failed to issue registration challenge.');
      }

      // Step B: Trigger native browser prompt (Windows Hello / Touch ID / YubiKey)
      const registrationResponse = await startRegistration({ optionsJSON: options });

      // Step C: Send cryptographic attestation response to backend
      const verifyRes: any = await api.post('/auth/register-verify', {
        response: registrationResponse,
        friendlyName: newKeyName.trim() || undefined,
      });

      if (verifyRes.data?.verified || verifyRes.verified) {
        setSuccess('Security key registered successfully! You can now use it for passwordless sign-in.');
        await fetchCredentials();
      } else {
        throw new Error(verifyRes.data?.message || 'Verification rejected by server.');
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Registration was canceled or timed out by the user/device.');
      } else if (err.name === 'InvalidStateError') {
        setError('This authenticator is already registered for your account.');
      } else if (err.name === 'NotSupportedError') {
        setError('WebAuthn is not supported in this browser or environment.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to register security key.');
      }
    } finally {
      setRegistering(false);
    }
  };

  // 4. Open Rename Dialog
  const handleOpenRename = (key: PasskeyItem) => {
    setSelectedKey(key);
    setRenameValue(key.friendlyName || key.nickname || '');
    setRenameDialogOpen(true);
  };

  // 5. Submit Rename
  const handleSaveRename = async () => {
    if (!selectedKey || !renameValue.trim()) return;

    setRenaming(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch(`/auth/credentials/${selectedKey._id}`, {
        friendlyName: renameValue.trim(),
      });
      setSuccess(`Credential renamed to "${renameValue.trim()}".`);
      setRenameDialogOpen(false);
      await fetchCredentials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rename credential.');
    } finally {
      setRenaming(false);
    }
  };

  // 6. Open Revoke Dialog
  const handleOpenRevoke = (key: PasskeyItem) => {
    setKeyToRevoke(key);
    setRevokeConfirmOpen(true);
  };

  // 7. Confirm Revocation
  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return;

    const id = keyToRevoke._id;
    const name = keyToRevoke.friendlyName || keyToRevoke.nickname || 'Credential';
    setRevoking(id);
    setError(null);
    setSuccess(null);
    setRevokeConfirmOpen(false);

    try {
      await api.delete(`/auth/credentials/${id}`);
      setSuccess(`"${name}" was revoked successfully.`);
      await fetchCredentials();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke credential.');
    } finally {
      setRevoking(null);
      setKeyToRevoke(null);
    }
  };

  // Helper to render transport icons
  const renderTransportBadges = (transports?: string[]) => {
    if (!transports || transports.length === 0) return null;
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {transports.includes('usb') && (
          <Tooltip title="USB Security Key (e.g., YubiKey)">
            <Chip icon={<Usb size={12} />} label="USB" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
        {transports.includes('nfc') && (
          <Tooltip title="NFC Contactless Security Key">
            <Chip icon={<Radio size={12} />} label="NFC" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
        {transports.includes('internal') && (
          <Tooltip title="Platform Biometrics (Windows Hello / Touch ID / Face ID)">
            <Chip icon={<ShieldCheck size={12} />} label="Biometric" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
          </Tooltip>
        )}
      </Stack>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header & Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            FIDO2 Security Keys & Passkeys
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Passwordless sign-in with Windows Hello, Touch ID, Face ID, or FIDO2 hardware keys (YubiKey / Titan).
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={registering ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
          onClick={handleOpenAddKey}
          disabled={registering}
        >
          {registering ? 'Waiting for Authenticator...' : 'Add Security Key'}
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

      {/* Credentials List */}
      {loading ? (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : credentials.length === 0 ? (
        <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Key size={32} color="#94A3B8" />
            <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
              No security keys registered yet
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Register your device or hardware key to enable one-touch passwordless sign-in.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {credentials.map((key) => {
            const displayName = key.friendlyName || key.nickname || 'Security Key / Device';
            const isMultiDevice = key.credentialDeviceType === 'multiDevice';
            const isDeleting = revoking === key._id;

            return (
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
                        {isMultiDevice ? <Smartphone size={20} /> : <Laptop size={20} />}
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {displayName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5} flexWrap="wrap" gap={0.5}>
                          <Chip
                            icon={<ShieldCheck size={12} />}
                            label={isMultiDevice ? 'Multi-Device Passkey' : 'FIDO2 Hardware Key'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                          {renderTransportBadges(key.transports)}
                          <Typography variant="caption" color="text.secondary">
                            Registered: {new Date(key.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Rename credential">
                        <IconButton
                          size="small"
                          color="default"
                          aria-label="Rename credential"
                          onClick={() => handleOpenRename(key)}
                        >
                          <Edit2 size={16} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Revoke credential">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Revoke credential"
                          disabled={isDeleting}
                          onClick={() => handleOpenRevoke(key)}
                        >
                          {isDeleting ? <CircularProgress size={16} color="error" /> : <Trash2 size={16} />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Dialog 1: Add New Security Key */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Register Security Key / Passkey</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign a nickname to your key (e.g., <em>Work YubiKey 5C</em>, <em>Windows Hello Laptop</em>, <em>iPhone Touch ID</em>).
          </Typography>
          <TextField
            autoFocus
            label="Key Nickname (Optional)"
            placeholder="e.g. Work YubiKey"
            fullWidth
            size="small"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRegisterPasskey} variant="contained">
            Continue to Device Prompt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog 2: Rename Credential */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Rename Credential</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Update the friendly name for this security key.
          </Typography>
          <TextField
            autoFocus
            label="Friendly Name"
            fullWidth
            size="small"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRename}
            variant="contained"
            disabled={renaming || !renameValue.trim()}
          >
            {renaming ? 'Saving...' : 'Save Name'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog 3: Confirm Revoke */}
      <Dialog open={revokeConfirmOpen} onClose={() => setRevokeConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Revoke Security Key?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to revoke <strong>"{keyToRevoke?.friendlyName || keyToRevoke?.nickname || 'this key'}"</strong>?
            Once revoked, this device or security key can no longer be used to sign in to your account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRevokeConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmRevoke} color="error" variant="contained">
            Revoke Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasskeyManager;
