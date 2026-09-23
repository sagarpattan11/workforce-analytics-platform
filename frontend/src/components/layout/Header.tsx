import React, { useState } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
  Tooltip,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAppTheme } from '../../theme/ThemeContext';
import { APP_ROUTES } from '../../config/routes.config';
import { api } from '../../api/client';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { resolvedMode, toggleTheme } = useAppTheme();

  // User Dropdown State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('wfa_token');
      localStorage.removeItem('wfa_user');
      window.location.href = '/login';
    }
  };

  // Resolve current route metadata for breadcrumb
  const currentRoute = APP_ROUTES.find((r) => r.path === location.pathname);

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        flexShrink: 0,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 4px rgba(0,0,0,0.4)'
            : '0 2px 4px rgba(0,0,0,0.03)',
      }}
    >
      {/* 1. Left: Hamburger Toggle & Dynamic Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <IconButton
          onClick={onToggleSidebar}
          edge="start"
          aria-label="Toggle navigation menu"
          size="small"
        >
          <MenuIcon size={20} />
        </IconButton>

        {!isSmall && (
          <Breadcrumbs
            separator={<ChevronRight size={14} color={theme.palette.text.secondary} />}
            aria-label="breadcrumb"
            sx={{ '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
          >
            <Link
              component={RouterLink}
              to="/dashboard"
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
            >
              WFA
            </Link>
            {currentRoute?.group && (
              <Typography color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                {currentRoute.group}
              </Typography>
            )}
            <Typography
              color="text.primary"
              sx={{ fontSize: '0.85rem', fontWeight: 600 }}
              aria-current="page"
            >
              {currentRoute?.breadcrumbLabel || currentRoute?.label || 'Overview'}
            </Typography>
          </Breadcrumbs>
        )}
      </Box>

      {/* 2. Middle: Global Search Placeholder (Desktop / Tablet) */}
      {!isMobile && (
        <Paper
          component="form"
          elevation={0}
          onSubmit={(e) => e.preventDefault()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: { md: 280, lg: 380 },
            px: 1.5,
            py: 0.5,
            bgcolor: 'action.hover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Search size={16} color={theme.palette.text.secondary} />
          <InputBase
            placeholder="Search employees, skills, reports... (Ctrl+K)"
            sx={{ ml: 1.5, flex: 1, fontSize: '0.85rem' }}
            inputProps={{ 'aria-label': 'search workforce analytics' }}
          />
        </Paper>
      )}

      {/* 3. Right: Action Controls (Theme, Notifications, Profile) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Theme Toggle Button */}
        <Tooltip title={resolvedMode === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
          <IconButton onClick={toggleTheme} size="small" aria-label="Toggle visual theme">
            {resolvedMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Tooltip>

        {/* Notifications Button */}
        <Tooltip title="Notifications">
          <IconButton size="small" aria-label="Show notifications">
            <Badge badgeContent={3} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
              <Bell size={18} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* User Profile Avatar & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleOpenUserMenu}
            size="small"
            aria-controls={userMenuOpen ? 'user-profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={userMenuOpen ? 'true' : undefined}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              SA
            </Avatar>
          </IconButton>

          {!isSmall && (
            <Box sx={{ textAlign: 'left', cursor: 'pointer' }} onClick={handleOpenUserMenu}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                Sagar
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>
                Administrator
              </Typography>
            </Box>
          )}

          {/* User Menu Dropdown */}
          <Menu
            id="user-profile-menu"
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleCloseUserMenu}
            onClick={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                width: 220,
                mt: 1.5,
                borderRadius: 2,
                boxShadow: theme.shadows[3],
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Sagar
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                sagar@workforce.internal
              </Typography>
            </Box>
            <Divider />

            <MenuItem component={RouterLink} to="/profile">
              <ListItemIcon>
                <UserIcon size={16} />
              </ListItemIcon>
              <Typography variant="body2">My Profile</Typography>
            </MenuItem>

            <MenuItem component={RouterLink} to="/settings">
              <ListItemIcon>
                <Shield size={16} />
              </ListItemIcon>
              <Typography variant="body2">Security Settings</Typography>
            </MenuItem>

            <Divider />

            {/* Real Logout Action */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={16} color={theme.palette.error.main} />
              </ListItemIcon>
              <Typography variant="body2" color="error.main">
                Sign Out
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};
