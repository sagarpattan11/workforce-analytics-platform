import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        p: 3,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            mb: 2,
          }}
        >
          <Compass size={56} color="#6366F1" />
        </Box>

        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          404 - Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page or resource you requested does not exist or has been relocated within the platform.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Home size={18} />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
