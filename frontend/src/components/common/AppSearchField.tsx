import React from 'react';
import { TextField, InputAdornment, IconButton, TextFieldProps } from '@mui/material';
import { Search, X } from 'lucide-react';

export interface AppSearchFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const AppSearchField: React.FC<AppSearchFieldProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  size = 'small',
  fullWidth = true,
  ...props
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
  };

  return (
    <TextField
      size={size}
      fullWidth={fullWidth}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={18} color="#94A3B8" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} aria-label="Clear search">
              <X size={16} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
        },
      }}
      {...props}
    />
  );
};

export default AppSearchField;
