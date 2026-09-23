import { createTheme, ThemeOptions } from '@mui/material/styles';
import { tokens } from './tokens';

export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const isLight = mode === 'light';
  const paletteColors = isLight ? tokens.colors.light : tokens.colors.dark;

  return {
    palette: {
      mode,
      primary: tokens.colors.primary,
      secondary: tokens.colors.secondary,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
      info: tokens.colors.info,
      background: {
        default: paletteColors.background,
        paper: paletteColors.surface,
      },
      text: {
        primary: paletteColors.textPrimary,
        secondary: paletteColors.textSecondary,
        disabled: paletteColors.textDisabled,
      },
      divider: paletteColors.divider,
    },
    typography: {
      fontFamily: tokens.typography.fontFamily,
      h1: tokens.typography.h1,
      h2: tokens.typography.h2,
      h3: tokens.typography.h3,
      body1: tokens.typography.body1,
      body2: tokens.typography.body2,
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: tokens.borderRadius.md,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: tokens.borderRadius.md,
            padding: '8px 16px',
            fontWeight: 600,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: paletteColors.surface,
            border: `1px solid ${paletteColors.border}`,
            borderRadius: tokens.borderRadius.lg,
            boxShadow: tokens.shadows.sm,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  };
};

export const lightTheme = createTheme(getThemeOptions('light'));
export const darkTheme = createTheme(getThemeOptions('dark'));
