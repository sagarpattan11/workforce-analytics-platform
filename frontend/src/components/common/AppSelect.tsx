import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  FormHelperText,
} from '@mui/material';

export interface AppSelectOption {
  value: string | number;
  label: string;
}

export interface AppSelectProps extends Omit<SelectProps, 'children'> {
  label: string;
  options: AppSelectOption[];
  helperText?: string;
  error?: boolean;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  label,
  options,
  helperText,
  error,
  size = 'small',
  fullWidth = true,
  value,
  id,
  ...props
}) => {
  const labelId = `${id || 'app-select'}-label`;

  return (
    <FormControl size={size} fullWidth={fullWidth} error={error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        value={value}
        label={label}
        sx={{ borderRadius: 2 }}
        {...props}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default AppSelect;
