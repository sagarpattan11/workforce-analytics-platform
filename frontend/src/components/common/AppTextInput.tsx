import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type AppTextInputProps = TextFieldProps;

export const AppTextInput: React.FC<AppTextInputProps> = ({
  size = 'small',
  fullWidth = true,
  variant = 'outlined',
  sx,
  ...props
}) => {
  return (
    <TextField
      size={size}
      fullWidth={fullWidth}
      variant={variant}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default AppTextInput;
