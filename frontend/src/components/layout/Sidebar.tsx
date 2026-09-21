import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Shield,
} from 'lucide-react';
import { getGroupedSidebarRoutes, UserRole, NavigationGroup } from '../../config/routes.config';

export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  currentRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  collapsed,
  onToggleCollapse,
  onCloseMobile,
  currentRole = 'Admin',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const groupedRoutes = getGroupedSidebarRoutes(currentRole);
  const groups = Object.keys(groupedRoutes) as NavigationGroup[];

  const sidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRight: '1px solid',
        borderColor: 'divider',
        transition: 'width 0.2s ease-in-out',
        width: isMobile
          ? SIDEBAR_WIDTH_EXPANDED
          : collapsed
          ? SIDEBAR_WIDTH_COLLAPSED
          : SIDEBAR_WIDTH_EXPANDED,
        overflowX: 'hidden',
      }}
    >
      {/* 1. Header Area: Logo & App Title */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          minHeight: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.8,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              flexShrink: 0,
            }}
          >
            <Layers size={22} />
          </Box>
          {(!collapsed || isMobile) && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap lineHeight={1.2}>
                Workforce
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                Analytics Platform
              </Typography>
            </Box>
          )}
        </Box>

        {isMobile && (
          <IconButton onClick={onCloseMobile} size="small" aria-label="Close navigation menu">
            <X size={20} />
          </IconButton>
        )}
      </Box>

      {/* 2. User Role & Environment Indicator */}
      {(!collapsed || isMobile) && (
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield size={14} color={theme.palette.primary.main} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                ROLE:
              </Typography>
              <Chip
                label={currentRole}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
              />
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              v1.0.0
            </Typography>
          </Box>
        </Box>
      )}

      {/* 3. Navigation Route Groups */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, px: collapsed && !isMobile ? 1 : 1.5 }}>
        {groups.map((group) => {
          const routes = groupedRoutes[group];
          if (!routes || routes.length === 0) return null;

          return (
            <Box key={group} sx={{ mb: 1.5 }}>
              {/* Group Title (hidden when collapsed on desktop) */}
              {(!collapsed || isMobile) && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    display: 'block',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'text.disabled',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                  }}
                >
                  {group}
                </Typography>
              )}

              <List disablePadding>
                {routes.map((route) => {
                  const Icon = route.icon;
                  const isActive = location.pathname === route.path;

                  const buttonContent = (
                    <ListItemButton
                      component={NavLink}
                      to={route.path}
                      onClick={isMobile ? onCloseMobile : undefined}
                      sx={{
                        minHeight: 40,
                        px: collapsed && !isMobile ? 1.5 : 1.5,
                        borderRadius: 1.5,
                        mb: 0.5,
                        justifyContent: collapsed && !isMobile ? 'center' : 'initial',
                        bgcolor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'primary.contrastText' : 'text.primary',
                        '&:hover': {
                          bgcolor: isActive ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      {Icon && (
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: collapsed && !isMobile ? 0 : 1.5,
                            justifyContent: 'center',
                            color: isActive ? 'primary.contrastText' : 'text.secondary',
                          }}
                        >
                          <Icon size={18} />
                        </ListItemIcon>
                      )}
                      {(!collapsed || isMobile) && (
                        <ListItemText
                          primary={route.label}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 600 : 500,
                            noWrap: true,
                          }}
                        />
                      )}
                    </ListItemButton>
                  );

                  return (
                    <ListItem key={route.path} disablePadding sx={{ display: 'block' }}>
                      {collapsed && !isMobile ? (
                        <Tooltip title={route.label} placement="right" arrow>
                          {buttonContent}
                        </Tooltip>
                      ) : (
                        buttonContent
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* 4. Footer: Collapse Toggle (Desktop only) */}
      {!isMobile && (
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            sx={{ width: '100%', borderRadius: 1.5, py: 1 }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  // Render Mobile Temporary Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH_EXPANDED },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  // Render Desktop Persistent Sidebar
  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        flexShrink: 0,
        transition: 'width 0.2s ease-in-out',
      }}
    >
      {sidebarContent}
    </Box>
  );
};
