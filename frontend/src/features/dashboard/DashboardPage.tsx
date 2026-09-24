import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  UserPlus,
  UserMinus,
  TrendingUp,
  RefreshCw,
  Filter,
  RotateCcw,
  Clock,
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
  Legend,
} from 'recharts';
import { PageShell } from '../../components/layout/PageShell';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { api } from '../../api/client';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

interface DashboardData {
  kpi: {
    totalEmployees: number;
    activeEmployees: number;
    newEmployees: number;
    employeeExits: number;
    employeeGrowthRate: number;
    attritionRate: number;
    departmentCount: number;
    locationCount: number;
    openPositions: number;
  };
  charts: {
    employeeGrowth: { month: string; newHires: number; totalHeadcount: number }[];
    employeesByDepartment: { name: string; count: number }[];
    roleDistribution: { role: string; count: number }[];
    employeesByLocation: { location: string; count: number }[];
    employeeStatusDistribution: { status: string; count: number }[];
    experienceDistribution: { range: string; count: number }[];
  };
}

interface DepartmentOption {
  _id: string;
  name: string;
  code: string;
}

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');

  // Load Departments for dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res: any = await api.get('/departments');
        const list = res.data?.data || res.data || [];
        setDepartments(list);
      } catch (err) {
        console.warn('Failed to load departments for filter:', err);
      }
    };
    fetchDepts();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (departmentFilter) params.department = departmentFilter;
      if (roleFilter) params.role = roleFilter;
      if (locationFilter) params.location = locationFilter;
      if (statusFilter) params.status = statusFilter;

      if (dateRangeFilter === '30D') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.startDate = d.toISOString();
      } else if (dateRangeFilter === '90D') {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        params.startDate = d.toISOString();
      } else if (dateRangeFilter === '1Y') {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        params.startDate = d.toISOString();
      }

      const res: any = await api.get('/analytics/dashboard', { params });
      const payload = res.data?.data || res.data;
      setData(payload);
    } catch (err: any) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(
        err.response?.data?.message ||
          'Unable to connect to analytics service. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, roleFilter, locationFilter, statusFilter, dateRangeFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleClearFilters = () => {
    setDepartmentFilter('');
    setRoleFilter('');
    setLocationFilter('');
    setStatusFilter('');
    setDateRangeFilter('ALL');
  };

  const hasActiveFilters = Boolean(
    departmentFilter || roleFilter || locationFilter || statusFilter || dateRangeFilter !== 'ALL'
  );

  // 8 Exact Sprint 1 KPI Cards
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
          subtitle: `${
            data.kpi.totalEmployees > 0
              ? Math.round((data.kpi.activeEmployees / data.kpi.totalEmployees) * 100)
              : 100
          }% active in roster`,
          icon: <UserCheck size={22} color="#10B981" />,
          bgColor: 'rgba(16, 185, 129, 0.1)',
          textColor: '#10B981',
        },
        {
          title: 'New Employees',
          value: data.kpi.newEmployees,
          subtitle: 'Joined in past 30 days',
          icon: <UserPlus size={22} color="#8B5CF6" />,
          bgColor: 'rgba(139, 92, 246, 0.1)',
          textColor: '#8B5CF6',
        },
        {
          title: 'Employee Exits',
          value: data.kpi.employeeExits,
          subtitle: 'Terminated / Departures',
          icon: <UserMinus size={22} color="#EF4444" />,
          bgColor: 'rgba(239, 68, 68, 0.1)',
          textColor: '#EF4444',
        },
        {
          title: 'Employee Growth Rate',
          value: `${data.kpi.employeeGrowthRate > 0 ? '+' : ''}${data.kpi.employeeGrowthRate}%`,
          subtitle: 'Net headcount velocity',
          icon: <TrendingUp size={22} color="#06B6D4" />,
          bgColor: 'rgba(6, 182, 212, 0.1)',
          textColor: '#06B6D4',
        },
        {
          title: 'Attrition Rate',
          value: `${data.kpi.attritionRate}%`,
          subtitle: 'Workforce turnover ratio',
          icon: <Clock size={22} color="#F59E0B" />,
          bgColor: 'rgba(245, 158, 11, 0.1)',
          textColor: '#F59E0B',
        },
        {
          title: 'Departments & Locations',
          value: `${data.kpi.departmentCount} / ${data.kpi.locationCount}`,
          subtitle: 'Operating units & sites',
          icon: <Building2 size={22} color="#3B82F6" />,
          bgColor: 'rgba(59, 130, 246, 0.1)',
          textColor: '#3B82F6',
        },
        {
          title: 'Open Positions',
          value: data.kpi.openPositions,
          subtitle: 'Active talent requisitions',
          icon: <Briefcase size={22} color="#EC4899" />,
          bgColor: 'rgba(236, 72, 153, 0.1)',
          textColor: '#EC4899',
        },
      ]
    : [];

  return (
    <PageShell
      title="Workforce Dashboard"
      description="Live organizational metrics, talent pipeline health, and workforce analytics distribution."
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
      {/* ------------------------------------------------------------- */}
      {/* 1. SPRINT 1 INTERACTIVE DASHBOARD FILTER BAR */}
      {/* ------------------------------------------------------------- */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 100 }}>
            <Filter size={18} color="#2563EB" />
            <Typography variant="subtitle2" fontWeight={700}>
              Filters:
            </Typography>
          </Stack>

          {/* Department Filter */}
          <FormControl size="small" sx={{ minWidth: 160, flex: 1 }}>
            <InputLabel id="dept-filter-label">Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Role Filter */}
          <TextField
            size="small"
            label="Job Role / Title"
            placeholder="e.g. Engineer, Designer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 160, flex: 1 }}
          />

          {/* Location Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel id="location-filter-label">Location</InputLabel>
            <Select
              labelId="location-filter-label"
              value={locationFilter}
              label="Location"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="San Francisco">San Francisco</MenuItem>
              <MenuItem value="New York">New York</MenuItem>
              <MenuItem value="London">London</MenuItem>
              <MenuItem value="Berlin">Berlin</MenuItem>
              <MenuItem value="Tokyo">Tokyo</MenuItem>
              <MenuItem value="Remote">Remote</MenuItem>
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
            </Select>
          </FormControl>

          {/* Date Range Filter */}
          <FormControl size="small" sx={{ minWidth: 140, flex: 1 }}>
            <InputLabel id="daterange-filter-label">Date Range</InputLabel>
            <Select
              labelId="daterange-filter-label"
              value={dateRangeFilter}
              label="Date Range"
              onChange={(e) => setDateRangeFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Time</MenuItem>
              <MenuItem value="30D">Last 30 Days</MenuItem>
              <MenuItem value="90D">Last 90 Days</MenuItem>
              <MenuItem value="1Y">Last Year</MenuItem>
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="text"
              color="secondary"
              size="small"
              startIcon={<RotateCcw size={16} />}
              onClick={handleClearFilters}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Card>

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
      {/* 2. SPRINT 1 EXACT 8 KPI CARDS SECTION */}
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
                    boxShadow:
                      theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0,0,0,0.5)'
                        : '0 4px 20px rgba(0,0,0,0.06)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                        gutterBottom
                      >
                        {kpi.title}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color={kpi.textColor}>
                        {kpi.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
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
      {/* 3. SPRINT 1 EXACT 6 CHARTS SECTION */}
      {/* ------------------------------------------------------------- */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
        Workforce Analytics & Distributions
      </Typography>

      {loading && !data ? (
        <SkeletonLoader type="card" count={6} />
      ) : data ? (
        <Grid container spacing={3}>
          {/* Chart 1: Employee Growth (Past 12 Months) */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employee Growth
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                12-month cumulative headcount expansion and new hires
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.charts.employeeGrowth}
                    margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="totalHeadcount"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Total Headcount"
                    />
                    <Line
                      type="monotone"
                      dataKey="newHires"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="New Hires"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 2: Department Distribution */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Department Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Headcount breakdown across departments
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.employeesByDepartment}
                    margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Headcount" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 3: Role Distribution */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Role Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Top job roles and positions across workforce
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.roleDistribution}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="role" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 4: Location Distribution */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Location Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Global office locations and remote presence
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.employeesByLocation}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="location"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 5: Employment Status */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Employment Status
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Workforce roster status: Active, On Leave, Inactive, Terminated
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
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {data.charts.employeeStatusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Chart 6: Experience Distribution */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Experience Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Workforce tenure and professional experience brackets
              </Typography>
              <Box sx={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.charts.experienceDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Employees" />
                  </BarChart>
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
