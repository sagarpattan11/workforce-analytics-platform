import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedStateProps {
  onBack?: () => void;
}

export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({
  onBack = () => window.history.back(),
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      p={3}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 480,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <ShieldAlert size={56} color="#F59E0B" />
        </Box>
        <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
          403 - Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          You do not have the required permissions to access this module or resource. Please contact your system administrator if you believe this is an error.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowLeft size={18} />}
          onClick={onBack}
        >
          Go Back
        </Button>
      </Paper>
    </Box>
  );
};
