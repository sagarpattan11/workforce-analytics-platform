import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Alert,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  Clock,
  CalendarOff,
  UserPlus,
  Award,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { PageShell } from '../../components/layout/PageShell';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { api } from '../../api/client';

// Chart Color Palette
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

interface DashboardData {
  kpi: {
    totalEmployees: number;
    activeEmployees: number;
    totalDepartments: number;
    totalTeams: number;
    employeesPresentToday: number;
    employeesOnLeave: number;
    newHires: number;
    attendancePercentage: number;
  };
  charts: {
    employeesByDepartment: { name: string; count: number }[];
    employeesByLocation: { location: string; count: number }[];
    employmentTypeDistribution: { type: string; count: number }[];
    employeeGrowth: { month: string; newHires: number; totalHeadcount: number }[];
    employeeStatusDistribution: { status: string; count: number }[];
    recentHiringTrend: { month: string; hires: number }[];
  };
}

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.get('/analytics/dashboard');
      const payload = res.data?.data || res.data || res;
      setData(payload);
    } catch (err: any) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(err.response?.data?.message || 'Unable to connect to analytics service. Please verify your session.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 8 KPI Card Definitions
  const kpiCards = data
    ? [
        {
          title: 'Total Employees',
          value: data.kpi.totalEmployees,
          subtitle: 'Active headcount records',
          icon: <Users size={22} color="#2563EB" />,
          bgColor: 'rgba(37, 99, 235, 0.1)',
          textColor: '#2563EB',
        },
        {
          title: 'Active Employees',
          value: data.kpi.activeEmployees,
          subtitle: `${Math.round((data.kpi.activeEmployees / (data.kpi.totalEmployees || 1)) * 100)}% of workforce`,
          icon: <UserCheck size={22} color="#10B981" />,
          bgColor: 'rgba(16, 185, 129, 0.1)',
          textColor: '#10B981',
        },
        {
          title: 'Total Departments',
          value: data.kpi.totalDepartments,
          subtitle: 'Operational units',
          icon: <Building2 size={22} color="#8B5CF6" />,
          bgColor: 'rgba(139, 92, 246, 0.1)',
          textColor: '#8B5CF6',
        },
        {
          title: 'Total Teams',
          value: data.kpi.totalTeams,
          subtitle: 'Cross-functional groups',
          icon: <Briefcase size={22} color="#06B6D4" />,
          bgColor: 'rgba(6, 182, 212, 0.1)',
          textColor: '#06B6D4',
        },
        {
          title: 'Employees Present Today',
          value: data.kpi.employeesPresentToday,
          subtitle: 'Checked in or active',
          icon: <Clock size={22} color="#3B82F6" />,
          bgColor: 'rgba(59, 130, 246, 0.1)',
          textColor: '#3B82F6',
        },
        {
          title: 'Employees on Leave',
          value: data.kpi.employeesOnLeave,
          subtitle: 'Approved absence/PTO',
          icon: <CalendarOff size={22} color="#F59E0B" />,
          bgColor: 'rgba(245, 158, 11, 0.1)',
          textColor: '#F59E0B',
        },
        {
          title: 'New Hires',
          value: data.kpi.newHires,
          subtitle: 'Joined in last 30 days',
          icon: <UserPlus size={22} color="#10B981" />,
          bgColor: 'rgba(16, 185, 129, 0.1)',
          textColor: '#10B981',
        },
        {
          title: 'Attendance Percentage',
          value: `${data.kpi.attendancePercentage}%`,
          subtitle: 'Present vs Total Ratio',
          icon: <Award size={22} color="#EC4899" />,
          bgColor: 'rgba(236, 72, 153, 0.1)',
          textColor: '#EC4899',
        },
      ]
    : [];

  return (
    <PageShell
      title="Workforce Dashboard"
      description="Live organizational metrics, departmental distribution, headcount trends, and workforce health."
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<TrendingUp size={14} />}
            label="Live MongoDB Analytics"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      }
    >
      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. 8 KPI CARDS SECTION */}
      {/* ------------------------------------------------------------- */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Key Performance Indicators (KPIs)
      </Typography>

      {loading && !data ? (
        <SkeletonLoader type="card" count={8} />
      ) : (
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {kpiCards.map((kpi, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.06)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color={kpi.textColor}>
                        {kpi.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {kpi.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 2,
                        bgcolor: kpi.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {kpi.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. 6 RECHARTS VISUALIZATIONS SECTION */}
      {/* ------------------------------------------------------------- */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Workforce Analytics & Distributions
      </Typography>

      {loading && !data ? (
        <SkeletonLoader type="card" count={6} />
      ) : data ? (
        <Grid container spacing={3}>
          {/* Chart 1: Employees by Department */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employees by Department
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Headcount breakdown across organizational departments
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.employeesByDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Headcount" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 2: Employees by Location */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employees by Location
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Global office distribution and remote headcount
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.employeesByLocation} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="location" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 3: Employment Type Distribution */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employment Type Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Full-time, Part-time, Contract, and Intern breakdown
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.employmentTypeDistribution}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.charts.employmentTypeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 4: Employee Growth (Monthly Cumulative) */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employee Growth (Past 12 Months)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Cumulative workforce headcount expansion over time
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.employeeGrowth} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="totalHeadcount" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Total Headcount" />
                    <Line type="monotone" dataKey="newHires" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Monthly Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 5: Employee Status Distribution */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employee Status Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Active, On Leave, Inactive, and Terminated states
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts.employeeStatusDistribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.charts.employeeStatusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 6: Recent Hiring Trend */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Recent Hiring Trend (Past 6 Months)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Monthly recruitment velocity and talent acquisition volume
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.recentHiringTrend} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="hires" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorHires)" name="New Hires" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : null}
    </PageShell>
  );
};

export default DashboardPage;
