import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

export interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 3,
}) => {
  if (type === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Box key={idx} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1.5, mb: 1.5 }} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1.5 }} />
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton key={idx} variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" width="30%" height={16} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default SkeletonLoader;
