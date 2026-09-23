import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Button,
  Divider,
} from '@mui/material';
import { RotateCcw } from 'lucide-react';
import { LoadingState } from '../feedback/LoadingState';
import { EmptyState } from '../feedback/EmptyState';

export interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  description,
  actions,
  loading = false,
  loadingMessage = 'Loading data...',
  error = null,
  onRetry,
  empty = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There is currently no data to display for this module.',
  children,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Page Header with Title, Description & Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700} color="text.primary">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>

      <Divider />

      {/* 2. Loading State Slot */}
      {loading && <LoadingState message={loadingMessage} minHeight="40vh" />}

      {/* 3. Error State Slot */}
      {!loading && error && (
        <Alert
          severity="error"
          action={
            onRetry && (
              <Button
                color="inherit"
                size="small"
                startIcon={<RotateCcw size={16} />}
                onClick={onRetry}
              >
                Retry
              </Button>
            )
          }
          sx={{ borderRadius: 2 }}
        >
          <AlertTitle>Unable to load data</AlertTitle>
          {error}
        </Alert>
      )}

      {/* 4. Empty State Slot */}
      {!loading && !error && empty && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}

      {/* 5. Main Content Area Slot */}
      {!loading && !error && !empty && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          {children}
        </Paper>
      )}
    </Box>
  );
};

export default PageShell;
