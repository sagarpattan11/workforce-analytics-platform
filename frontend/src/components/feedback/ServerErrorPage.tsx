import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          textAlign: 'center',
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'error.lighter',
            color: 'error.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <ServerCrash size={32} />
        </Box>

        <Typography variant="h5" fontWeight={800} gutterBottom>
          500 - Internal Server Error
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          An unexpected server error occurred while processing your request. The system engineering team has been notified.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          <Button
            variant="contained"
            startIcon={<Home size={16} />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ServerErrorPage;
