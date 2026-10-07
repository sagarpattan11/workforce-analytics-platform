import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Stack,
  Typography,
  Box,
  Card,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { notificationService, AppNotification } from '../../services/notification.service';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'warning'>('all');

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((list) => {
      setNotifications(list);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.read;
    if (filterTab === 'warning') return n.severity === 'warning';
    return true;
  });

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
  };

  const handleMarkSingleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAsRead(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
  };

  const handleNavigate = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  const getIcon = (notif: AppNotification) => {
    switch (notif.type) {
      case 'skill_gap':
        return <AlertTriangle size={18} color="#EF4444" />;
      case 'placement':
        return <Briefcase size={18} color="#10B981" />;
      case 'learning':
        return <GraduationCap size={18} color="#F59E0B" />;
      case 'pipeline':
      default:
        return <Sparkles size={18} color="#8B5CF6" />;
    }
  };

  const getSeverityBg = (severity: AppNotification['severity']) => {
    switch (severity) {
      case 'warning':
        return 'rgba(239, 68, 68, 0.1)';
      case 'success':
        return 'rgba(16, 185, 129, 0.1)';
      case 'error':
        return 'rgba(239, 68, 68, 0.15)';
      case 'info':
      default:
        return 'rgba(37, 99, 235, 0.1)';
    }
  };

  return (
    <PageShell
      title="Platform Notifications"
      description="Real-time alerts, operational updates, shift reminders, and approval requests."
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} Unread`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckCheck size={16} />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Mark All as Read
          </Button>
        </Stack>
      }
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 1 }}>
        {/* FILTER TABS */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={filterTab}
            onChange={(_, val) => setFilterTab(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="all"
              label={`All (${notifications.length})`}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              value="unread"
              label={`Unread (${unreadCount})`}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            <Tab
              value="warning"
              label="Critical & Alerts"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* NOTIFICATION CARDS LIST */}
        {filteredNotifications.length === 0 ? (
          <Card
            variant="outlined"
            sx={{ p: 5, textAlign: 'center', borderRadius: 2.5, bgcolor: 'background.default' }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                mb: 2,
              }}
            >
              <Bell size={36} color="#94A3B8" />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No notifications to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filterTab === 'unread'
                ? "You're all caught up! No unread notifications remaining."
                : 'No alerts match the selected criteria.'}
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                variant="outlined"
                onClick={() => {
                  if (!notif.read) notificationService.markAsRead(notif.id);
                  if (notif.link) handleNavigate(notif.link);
                }}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: notif.link ? 'pointer' : 'default',
                  bgcolor: notif.read ? 'background.paper' : 'action.hover',
                  borderColor: notif.read ? 'divider' : 'primary.light',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 1,
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: getSeverityBg(notif.severity),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 0.25,
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notif)}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="subtitle2"
                          fontWeight={notif.read ? 600 : 700}
                          color={notif.read ? 'text.secondary' : 'text.primary'}
                        >
                          {notif.title}
                        </Typography>
                        {!notif.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {notif.timestamp}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {notif.message}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {notif.link ? (
                        <Button
                          size="small"
                          endIcon={<ExternalLink size={14} />}
                          sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!notif.read) notificationService.markAsRead(notif.id);
                            handleNavigate(notif.link);
                          }}
                        >
                          View in Analytics
                        </Button>
                      ) : <Box />}

                      <Stack direction="row" spacing={1} alignItems="center">
                        {!notif.read && (
                          <Tooltip title="Mark as read">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckCircle2 size={12} />}
                              onClick={(e) => handleMarkSingleRead(notif.id, e)}
                              sx={{
                                textTransform: 'none',
                                fontSize: '0.72rem',
                                py: 0.25,
                                px: 1,
                              }}
                            >
                              Mark as read
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(notif.id, e)}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </PageShell>
  );
};

export default NotificationsPage;
