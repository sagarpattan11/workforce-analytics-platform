import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

export interface AppButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  loading = false,
  loadingText,
  disabled,
  startIcon,
  sx,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

export default AppButton;
