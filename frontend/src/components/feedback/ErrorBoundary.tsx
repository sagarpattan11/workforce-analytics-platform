import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          bgcolor="background.default"
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              width: '100%',
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Box display="flex" justifyContent="center" mb={2}>
              <AlertTriangle size={48} color="#EF4444" />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              An unexpected application error occurred. The application has safely caught this error to prevent a crash.
            </Typography>
            {this.state.error?.message && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 3,
                  bgcolor: 'action.hover',
                  textAlign: 'left',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </Paper>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<RotateCcw size={18} />}
              onClick={this.handleReset}
            >
              Reload Application
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
