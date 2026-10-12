import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  ShieldAlert,
  IndianRupee,
  RefreshCw,
  Search,
  Building2,
  MapPin,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
} from 'recharts';
import demandService, {
  IDemandForecastingData,
  ShortageSeverity,
} from '../../../services/demand.service';

const SEVERITY_COLORS: Record<ShortageSeverity, { bg: string; text: string; muiColor: 'error' | 'warning' | 'info' | 'success' }> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', muiColor: 'error' },
  Severe: { bg: 'rgba(249, 115, 22, 0.1)', text: '#F97316', muiColor: 'warning' },
  Moderate: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', muiColor: 'warning' },
  Optimal: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', muiColor: 'success' },
};

// Currency formatter for Indian Rupees (₹ INR)
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DemandForecastingView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IDemandForecastingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const fetchData = useCallback(async (refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await demandService.getDemandForecasting(refresh);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Unable to load demand forecasting projections.');
      }
    } catch (err: any) {
      console.error('Failed to load demand forecasting:', err);
      setError(err.message || 'Failed to connect to demand forecasting service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Synthesizing 12-Month Strategic Workforce Demand Projections...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => fetchData()}>Retry</Button>}>
          {error || 'Unable to display workforce demand forecasting data.'}
        </Alert>
      </Box>
    );
  }

  const { summary, byDepartment, byRole, quarterlyTimeline, locationDemand, topRequiredSkills } = data;

  // Filter roles by search and severity
  const filteredRoles = byRole.filter((role) => {
    const matchesSearch = role.roleName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'ALL' || role.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Quick Actions */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TrendingUp size={28} color="#2563EB" />
            <Typography variant="h5" fontWeight={700}>
              Workforce Demand Forecasting
            </Typography>
            <Chip
              label="12-Month Strategic Horizon"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Predictive headcount planning, role-wise hiring demand, quarterly budget projections, and talent shortage mitigation.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshCw size={18} />}
          onClick={() => fetchData(true)}
          sx={{ borderRadius: 2 }}
        >
          Refresh Projections
        </Button>
      </Stack>

      {/* 2. Top Summary KPI Cards (Clean, Outlined, No colored borders) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Current Headcount */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  CURRENT HEADCOUNT
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
                  {summary.totalCurrentHeadcount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Staff Across Roles
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                <Users size={22} color="#2563EB" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* 12-Month Projected Demand */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PROJECTED DEMAND
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#7C3AED" sx={{ mt: 0.5 }}>
                  {summary.totalProjectedDemand}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target 12-Mo Capacity
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                <TrendingUp size={22} color="#7C3AED" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Expected Workforce Shortage */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="warning.main" fontWeight={700}>
                  WORKFORCE SHORTAGE
                </Typography>
                <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 0.5 }}>
                  {summary.totalHeadcountShortage}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Net Open Positions to Hire
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
                <AlertTriangle size={22} color="#F59E0B" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Critical Shortages */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="error.main" fontWeight={700}>
                  CRITICAL DEFICITS
                </Typography>
                <Typography variant="h4" fontWeight={800} color="error.main" sx={{ mt: 0.5 }}>
                  {summary.criticalShortagesCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Roles in Urgent Need
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                <ShieldAlert size={22} color="#EF4444" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Estimated Hiring Budget in ₹ INR */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  EST. HIRING BUDGET
                </Typography>
                <Typography variant="h5" fontWeight={800} color="success.main" sx={{ mt: 0.5 }}>
                  {formatINR(summary.totalEstimatedBudgetINR)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Target INR Capital Need
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                <IndianRupee size={22} color="#10B981" />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Visualizations Row 1: Department Demand & Quarterly Timeline */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Department Demand Comparison */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Workforce Demand by Department
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current Headcount vs. 12-Month Projected Hiring Capacity
                </Typography>
              </Box>
              <Building2 size={20} color="#6B7280" />
            </Stack>
            <Box sx={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDepartment} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => [`${val} Employees`]} />
                  <Legend />
                  <Bar dataKey="currentHeadcount" name="Current Headcount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projectedDemand" name="Projected Demand" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shortage" name="Workforce Shortage" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Quarterly Hiring & Budget Timeline */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Quarterly Hiring & Budget Timeline
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2026 Phased Onboarding & Budget Distribution (₹ INR)
                </Typography>
              </Box>
              <Calendar size={20} color="#6B7280" />
            </Stack>
            <Box sx={{ height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={quarterlyTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      name === 'Hires Needed' ? `${val} Hires` : formatINR(val),
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="requiredHires" name="Hires Needed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Visualizations Row 2: Location Demand & Top Skills */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Location-wise Workforce Demand */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Regional Workforce Demand
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Talent Distribution across Operating Hubs
                </Typography>
              </Box>
              <MapPin size={20} color="#6B7280" />
            </Stack>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationDemand} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="location" type="category" width={105} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val: number) => [`${val} Headcount`]} />
                  <Legend />
                  <Bar dataKey="currentCount" name="Current Staff" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="shortage" name="Hiring Shortage" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Top Required Skills */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  High-Priority Skills in Demand
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Core Competencies Required for Future Project Delivery
                </Typography>
              </Box>
              <Sparkles size={20} color="#8B5CF6" />
            </Stack>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {topRequiredSkills.slice(0, 5).map((skill, idx) => (
                <Box key={skill.skillName}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {idx + 1}. {skill.skillName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Demand Index: {skill.demandFrequency} Roles
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, skill.demandFrequency * 20)}
                    color={idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'info'}
                    sx={{ height: 7, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Future Hiring by Role & Expected Shortages Table */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Future Hiring by Role & Expected Workforce Shortages
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Detailed role-wise current staffing, projected 12-month requirements, and shortage severity indicators.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <TextField
                size="small"
                placeholder="Search by role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />

              <Stack direction="row" spacing={0.5}>
                {['ALL', 'Critical', 'Severe', 'Moderate', 'Optimal'].map((sev) => (
                  <Chip
                    key={sev}
                    label={sev}
                    size="small"
                    clickable
                    color={selectedSeverity === sev ? 'primary' : 'default'}
                    variant={selectedSeverity === sev ? 'filled' : 'outlined'}
                    onClick={() => setSelectedSeverity(sev)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Role Title</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Current Staff</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Projected Target</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Net Shortage</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Deficit Severity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Recommended Hiring Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No roles match the selected filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.roleName} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {role.roleName}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{role.currentHeadcount}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color="#7C3AED">
                        {role.projectedDemand}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={role.shortage > 0 ? 'error.main' : 'success.main'}
                      >
                        +{role.shortage} Hires
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={role.severity}
                        size="small"
                        color={SEVERITY_COLORS[role.severity]?.muiColor || 'default'}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {role.severity === 'Critical'
                          ? 'Prioritize immediate external recruiting pipeline in Q1 2026.'
                          : role.severity === 'Severe'
                          ? 'Initiate proactive sourcing and evaluate internal transfer talent.'
                          : role.severity === 'Moderate'
                          ? 'Schedule standard requisition fulfillment across Q2-Q3.'
                          : 'Staffing levels optimal; continue routine capability monitoring.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DemandForecastingView;
