import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There are no records available to display.',
  actionLabel,
  onAction,
  icon = <FolderOpen size={48} color="#94A3B8" />,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      textAlign="center"
      borderRadius={2}
      border="1px dashed"
      borderColor="divider"
      bgcolor="background.paper"
    >
      <Box mb={2}>{icon}</Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400} mb={actionLabel ? 3 : 0}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="outlined" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
