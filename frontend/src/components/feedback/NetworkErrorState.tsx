import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { WifiOff, RefreshCw } from 'lucide-react';

interface NetworkErrorStateProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({
  onRetry = () => window.location.reload(),
  message = 'Unable to connect to the Workforce Analytics Platform server. Please check your internet connection.',
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        minHeight: '300px',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 440,
          textAlign: 'center',
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'warning.lighter',
            color: 'warning.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <WifiOff size={28} />
        </Box>

        <Typography variant="h6" fontWeight={700} gutterBottom>
          Network Connection Lost
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>

        <Button
          variant="contained"
          startIcon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          Retry Connection
        </Button>
      </Paper>
    </Box>
  );
};

export default NetworkErrorState;
