import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  IconButton,
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
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Sun,
  Moon,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Shield,
  CheckCheck,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAppTheme } from '../../theme/ThemeContext';
import { APP_ROUTES, UserRole } from '../../config/routes.config';
import { api } from '../../api/client';
import { notificationService, AppNotification } from '../../services/notification.service';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentRole = 'Admin',
  onRoleChange,
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const { resolvedMode, toggleTheme } = useAppTheme();

  const navigate = useNavigate();

  // Notification State & Handlers
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifMenuOpen = Boolean(notifAnchorEl);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotifMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setNotifAnchorEl(null);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAllAsRead();
  };

  const handleNotificationClick = (notif: AppNotification) => {
    notificationService.markAsRead(notif.id);
    handleCloseNotifMenu();
    if (notif.link) {
      navigate(notif.link);
    }
  };

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

      {/* Right: Action Controls (Theme, Notifications, Profile) */}
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
        <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
          <IconButton
            size="small"
            aria-label="Show notifications"
            aria-controls={notifMenuOpen ? 'notifications-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={notifMenuOpen ? 'true' : undefined}
            onClick={handleOpenNotifMenu}
            sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)' } }}
          >
            <Badge
              badgeContent={unreadCount}
              invisible={unreadCount === 0}
              color="error"
              sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}
            >
              <Bell size={18} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Notifications Dropdown Menu */}
        <Menu
          id="notifications-menu"
          anchorEl={notifAnchorEl}
          open={notifMenuOpen}
          onClose={handleCloseNotifMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              width: { xs: 320, sm: 380 },
              maxHeight: 480,
              mt: 1.5,
              borderRadius: 2.5,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                />
              )}
            </Stack>
            {unreadCount > 0 && (
              <Button
                size="small"
                variant="text"
                startIcon={<CheckCheck size={14} />}
                onClick={handleMarkAllRead}
                sx={{ fontSize: '0.75rem', textTransform: 'none', py: 0.25 }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          {/* Notification List */}
          <Box sx={{ maxHeight: 330, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Bell size={32} color="#94A3B8" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No notifications
                </Typography>
              </Box>
            ) : (
              notifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    whiteSpace: 'normal',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor:
                        notif.severity === 'warning'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : notif.severity === 'success'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : notif.severity === 'info'
                          ? 'rgba(37, 99, 235, 0.1)'
                          : 'rgba(139, 92, 246, 0.1)',
                      color:
                        notif.severity === 'warning'
                          ? '#EF4444'
                          : notif.severity === 'success'
                          ? '#10B981'
                          : notif.severity === 'info'
                          ? '#2563EB'
                          : '#8B5CF6',
                      mt: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {notif.type === 'skill_gap' ? (
                      <AlertTriangle size={16} />
                    ) : notif.type === 'placement' ? (
                      <Briefcase size={16} />
                    ) : notif.type === 'learning' ? (
                      <GraduationCap size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="body2"
                        fontWeight={notif.read ? 600 : 700}
                        color={notif.read ? 'text.secondary' : 'text.primary'}
                        noWrap
                      >
                        {notif.title}
                      </Typography>
                      {!notif.read && (
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            ml: 1,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        my: 0.5,
                      }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {notif.timestamp}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
              textAlign: 'center',
            }}
          >
            <Button
              fullWidth
              size="small"
              variant="text"
              onClick={() => {
                handleCloseNotifMenu();
                navigate('/notifications');
              }}
              sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600 }}
            >
              View All in Notification Center →
            </Button>
          </Box>
        </Menu>

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
                {currentRole}
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
                width: 240,
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
                Current Role: <strong>{currentRole}</strong>
              </Typography>
            </Box>
            <Divider />

            {/* RBAC Role Switcher */}
            {onRoleChange && (
              <>
                <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    SWITCH ROLE (RBAC DEMO)
                  </Typography>
                </Box>
                {(
                  [
                    'Admin',
                    'HR Manager',
                    'Executive',
                    'Department Manager',
                    'Team Lead',
                    'Employee',
                  ] as UserRole[]
                ).map((r) => (
                  <MenuItem
                    key={r}
                    selected={currentRole === r}
                    onClick={() => {
                      onRoleChange(r);
                      handleCloseUserMenu();
                    }}
                    sx={{ py: 0.5, fontSize: '0.825rem' }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={currentRole === r ? 700 : 400}
                      color={currentRole === r ? 'primary.main' : 'text.primary'}
                    >
                      {r} {currentRole === r ? '✓' : ''}
                    </Typography>
                  </MenuItem>
                ))}
                <Divider />
              </>
            )}

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
