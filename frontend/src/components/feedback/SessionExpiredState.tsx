import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Clock, LogIn } from 'lucide-react';

interface SessionExpiredStateProps {
  open: boolean;
  onLoginRedirect?: () => void;
}

export const SessionExpiredState: React.FC<SessionExpiredStateProps> = ({
  open,
  onLoginRedirect = () => {
    window.location.href = '/login';
  },
}) => {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: 'warning.lighter',
            color: 'warning.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <Clock size={28} />
        </Box>
        <Typography variant="h6" fontWeight={800}>
          Session Expired
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Your enterprise session has expired due to inactivity. Please sign in again with your passkey to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<LogIn size={16} />}
          onClick={onLoginRedirect}
        >
          Sign In Again
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiredState;
