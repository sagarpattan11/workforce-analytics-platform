import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Fingerprint,
  ShieldCheck,
  User as UserIcon,
  Mail,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  checkWebAuthnCapability,
  loginWithPasskey,
  registerWithPasskey,
} from '../../services/webauthn.service';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Tab State: 0 = Sign In, 1 = Register Passkey
  const [activeTab, setActiveTab] = useState(0);

  // Sign In Form State
  const [loginUsername, setLoginUsername] = useState('');

  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);

  // Check WebAuthn capability on mount
  useEffect(() => {
    const verifyCapability = async () => {
      const { supported } = await checkWebAuthnCapability();
      setBrowserSupported(supported);
    };
    verifyCapability();
  }, []);

  // Helper: Format WebAuthn error messages
  const formatErrorMessage = (err: any): string => {
    if (err?.name === 'NotAllowedError') {
      return 'Passkey authentication was cancelled or timed out.';
    }
    if (
      err?.name === 'InvalidStateError' ||
      err?.message?.toLowerCase().includes('exclude') ||
      err?.message?.toLowerCase().includes('already')
    ) {
      return 'A passkey for this account is already registered on this device. Please switch to the Sign In tab.';
    }
    return err?.response?.data?.message || err?.message || 'Authentication error occurred.';
  };

  // 1. Handle Passkey Sign In (Tab 0)
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await loginWithPasskey(loginUsername);
      if (result.verified) {
        setSuccess(`Welcome back, ${result.user.displayName || result.user.username}! Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Passkey Registration (Tab 1)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regDisplayName) {
      setError('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await registerWithPasskey(
        regUsername.trim(),
        regEmail.trim(),
        regDisplayName.trim()
      );

      if (result.verified) {
        setSuccess(`Passkey created successfully for ${result.user.username}! Redirecting...`);
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(15, 23, 42, 0.08)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header Branding */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <ShieldCheck size={28} />
            </Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
              Workforce Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Passwordless Passkey & FIDO2 Authentication
            </Typography>
          </Box>

          {/* Browser Support Warning */}
          {!browserSupported && (
            <Alert
              severity="warning"
              icon={<AlertTriangle size={20} />}
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              Your current browser does not support WebAuthn / Passkeys. Please switch to a modern browser (Google Chrome, Microsoft Edge, Apple Safari, or Mozilla Firefox).
            </Alert>
          )}

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setError(null);
              setSuccess(null);
            }}
            variant="fullWidth"
            sx={{
              mb: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.9rem' },
            }}
          >
            <Tab label="Sign In" icon={<Fingerprint size={18} />} iconPosition="start" />
            <Tab label="Register Passkey" icon={<KeyRound size={18} />} iconPosition="start" />
          </Tabs>

          {/* Tab 0: Sign In */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleSignIn}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Sign in with one touch using your fingerprint, Windows Hello, Face ID, or a FIDO2 hardware security key.
              </Typography>

              <TextField
                label="Corporate Username or Email (Optional)"
                fullWidth
                size="small"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="e.g. admin or admin@wfa.internal"
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !browserSupported}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Fingerprint size={22} />
                  )
                }
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {loading ? 'Waiting for Device...' : 'Sign In with Passkey'}
              </Button>
            </Box>
          )}

          {/* Tab 1: Register Passkey */}
          {activeTab === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Register your device biometric or security key for fast, passwordless enterprise access.
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Username"
                  required
                  fullWidth
                  size="small"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. john.doe"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserIcon size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Corporate Email"
                  required
                  type="email"
                  fullWidth
                  size="small"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="john.doe@wfa.internal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Full Name"
                  required
                  fullWidth
                  size="small"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="John Doe"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserCheck size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !browserSupported}
                  endIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArrowRight size={18} />
                    )
                  }
                  sx={{
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    mt: 1,
                  }}
                >
                  {loading ? 'Creating Passkey...' : 'Create & Register Passkey'}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
