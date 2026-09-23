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
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#172554' : '#1D4ED8'),
        color: '#FFFFFF',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
      }}
    >
      {/* 1. Left: Hamburger Toggle & Dynamic Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <IconButton
          onClick={onToggleSidebar}
          edge="start"
          aria-label="Toggle navigation menu"
          size="small"
          sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' } }}
        >
          <MenuIcon size={20} />
        </IconButton>

        {!isSmall && (
          <Breadcrumbs
            separator={<ChevronRight size={14} color="rgba(255, 255, 255, 0.7)" />}
            aria-label="breadcrumb"
            sx={{ '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
          >
            <Link
              component={RouterLink}
              to="/dashboard"
              underline="hover"
              sx={{
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.85)',
                '&:hover': { color: '#FFFFFF' },
              }}
            >
              WFA
            </Link>
            {currentRoute?.group && (
              <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                {currentRoute.group}
              </Typography>
            )}
            <Typography
              sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}
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
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            transition: 'background-color 0.2s, border-color 0.2s',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.22)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
          }}
        >
          <Search size={16} color="rgba(255, 255, 255, 0.85)" />
          <InputBase
            placeholder="Search employees, skills, reports... (Ctrl+K)"
            sx={{
              ml: 1.5,
              flex: 1,
              fontSize: '0.85rem',
              color: '#FFFFFF',
              '& input::placeholder': {
                color: 'rgba(255, 255, 255, 0.75)',
                opacity: 1,
              },
            }}
            inputProps={{ 'aria-label': 'search workforce analytics' }}
          />
        </Paper>
      )}

      {/* 3. Right: Action Controls (Theme, Notifications, Profile) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Theme Toggle Button */}
        <Tooltip title={resolvedMode === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
          <IconButton
            onClick={toggleTheme}
            size="small"
            aria-label="Toggle visual theme"
            sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' } }}
          >
            {resolvedMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
        </Tooltip>

        {/* Notifications Button */}
        <Tooltip title="Notifications">
          <IconButton
            size="small"
            aria-label="Show notifications"
            sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' } }}
          >
            <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
              <Bell size={18} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ mx: 0.5, height: 24, alignSelf: 'center', borderColor: 'rgba(255, 255, 255, 0.25)' }}
        />

        {/* User Profile Avatar & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleOpenUserMenu}
            size="small"
            aria-controls={userMenuOpen ? 'user-profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={userMenuOpen ? 'true' : undefined}
            sx={{ p: 0.5 }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#FFFFFF',
                color: '#1D4ED8',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              SA
            </Avatar>
          </IconButton>

          {!isSmall && (
            <Box sx={{ textAlign: 'left', cursor: 'pointer' }} onClick={handleOpenUserMenu}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2} sx={{ color: '#FFFFFF' }}>
                Sagar
              </Typography>
              <Typography variant="caption" lineHeight={1} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
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
