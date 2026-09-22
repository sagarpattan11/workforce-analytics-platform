import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography, Link, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from '../../config/routes.config';

interface MainLayoutProps {
  currentRole?: UserRole;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentRole = 'Admin' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sidebar States
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflow: 'hidden',
      }}
    >
      {/* 1. Enterprise Sidebar */}
      <Sidebar
        open={mobileOpen}
        collapsed={desktopCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onCloseMobile={handleCloseMobile}
        currentRole={currentRole}
      />

      {/* 2. Main Page Column */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Sticky Header */}
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Dynamic Route Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </Box>

        {/* Enterprise Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: { xs: 2, md: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2026 Workforce Analytics Platform. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="#"
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              underline="hover"
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
              onClick={(e) => e.preventDefault()}
            >
              Compliance Notice
            </Link>
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              Enterprise Ready
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
