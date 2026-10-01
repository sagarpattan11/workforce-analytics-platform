import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Building2,
  Sparkles,
  MapPin,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import { PlacementAnalyticsData } from '../../../services/placement.service';

interface PlacementAnalyticsViewProps {
  data: PlacementAnalyticsData | null;
  loading: boolean;
}

const FUNNEL_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981'];

export const PlacementAnalyticsView: React.FC<PlacementAnalyticsViewProps> = ({
  data,
  loading,
}) => {
  const theme = useTheme();

  if (loading && !data) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading Placement Analytics...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No placement data found for the selected filter criteria. Try adjusting or resetting filters.
      </Alert>
    );
  }

  const { kpis, funnel, breakdowns, recentCandidates } = data;

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 5 Top KPI Cards
  const kpiCards = [
    {
      title: 'Total Candidates',
      value: kpis.totalCandidates.toLocaleString(),
      subtext: 'In active placement funnel',
      icon: <Users size={22} color="#2563EB" />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      title: 'Candidates Placed',
      value: kpis.candidatesPlaced.toLocaleString(),
      subtext: 'Confirmed employment',
      icon: <CheckCircle2 size={22} color="#10B981" />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Placement Rate',
      value: `${kpis.placementRate}%`,
      subtext: 'Pipeline conversion efficiency',
      icon: <TrendingUp size={22} color="#8B5CF6" />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
    },
    {
      title: 'Avg. Placement Time',
      value: `${kpis.averagePlacementTimeDays} Days`,
      subtext: 'Application to confirmed offer',
      icon: <Clock size={22} color="#F59E0B" />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Avg. Base Salary',
      value: formatCurrency(kpis.salaryAnalysis.avgSalary),
      subtext: `Median: ${formatCurrency(kpis.salaryAnalysis.medianSalary)}`,
      icon: <DollarSign size={22} color="#059669" />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. TOP KPI METRICS ROW */}
      <Grid container spacing={2.5}>
        {kpiCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  borderColor: card.color,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="text.primary" lineHeight={1.2}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {card.subtext}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. PLACEMENT FUNNEL & SALARY ANALYSIS */}
      <Grid container spacing={3}>
        {/* Left: 5-Stage Placement Funnel Chart */}
        <Grid item xs={12} lg={7}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Placement Conversion Funnel
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stage-by-stage candidate progression from application to successful placement
                </Typography>
              </Box>
              <Chip
                label={`${kpis.placementRate}% Overall Conversion`}
                color="primary"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Box sx={{ width: '100%', height: 320, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnel}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    width={140}
                  />
                  <Tooltip
                    formatter={(value: any) => {
                      const totalApps = funnel[0]?.count || 1;
                      const pct = Math.round((Number(value) / totalApps) * 100);
                      return [`${value} Candidates (${pct}% of applicants)`, 'Stage Volume'];
                    }}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 8,
                      borderColor: theme.palette.divider,
                      boxShadow: theme.shadows[3],
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Quick in-progress pipeline summary pills */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mt={2} pt={2} borderTop="1px solid" borderColor="divider">
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ alignSelf: 'center' }}>
                Active in Pipeline:
              </Typography>
              <Chip label={`In Review: ${data.stageBreakdown.applied}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover' }} />
              <Chip label={`In Screening: ${data.stageBreakdown.screened}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover' }} />
              <Chip label={`In Interviews: ${data.stageBreakdown.interviewed}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover' }} />
              <Chip label={`Offers Pending: ${data.stageBreakdown.offered}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover' }} />
              <Chip label={`Placed: ${data.stageBreakdown.placed}`} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
            </Stack>
          </Card>
        </Grid>

        {/* Right: Salary Analysis & Department Compensation */}
        <Grid item xs={12} lg={5}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Salary Distribution by Department
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average base compensation package for placed talent
              </Typography>
            </Box>

            {/* 3 Salary Percentile Badges */}
            <Grid container spacing={1.5} mb={2}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Minimum
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                    {formatCurrency(kpis.salaryAnalysis.minSalary)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, borderColor: 'primary.main', bgcolor: 'primary.50' }}
                >
                  <Typography variant="caption" color="primary.main" fontWeight={600} display="block">
                    Median (50th)
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {formatCurrency(kpis.salaryAnalysis.medianSalary)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Maximum
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                    {formatCurrency(kpis.salaryAnalysis.maxSalary)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Department Average Salary Bar Chart */}
            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdowns.byDepartment}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="departmentCode"
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    tickFormatter={(val) => `$${val / 1000}k`}
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Avg. Base Salary']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Bar dataKey="avgSalary" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 3. SEGMENTATIONS: TOP EMPLOYERS & IN-DEMAND SKILLS */}
      <Grid container spacing={3}>
        {/* Top Employers Breakdown */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Building2 size={20} color="#2563EB" />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Placements by Employer Partner
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Top hiring corporate partners and average salary offered
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns.byEmployer} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="employer" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any, name: string) => [value, name === 'placed' ? 'Candidates Placed' : 'Total Applied']} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Applied" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" name="Placed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* In-Demand Skills Breakdown */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Sparkles size={20} color="#8B5CF6" />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  High-Demand Placement Skills
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Competencies with the highest successful hire conversion
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns.bySkill} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="skill" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any, name: string) => [value, name === 'placedCount' ? 'Placed Candidates' : 'Applicants']} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="candidateCount" name="Applicants" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placedCount" name="Placed" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 4. RECENT CANDIDATES DIRECTORY */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Recent Placement Candidates
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Latest candidate applicants, verified employer matches, and pipeline status
              </Typography>
            </Box>
            <Chip label={`${recentCandidates.length} Active Profiles`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Candidate</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Employer Partner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Stage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Offered Base</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Days to Place</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentCandidates.map((candidate) => (
                <TableRow key={candidate._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {candidate.candidateName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {candidate.candidateEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Briefcase size={14} color="#64748B" />
                      <Typography variant="body2">{candidate.roleTitle}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {candidate.employer}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MapPin size={14} color="#64748B" />
                      <Typography variant="body2">{candidate.location}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.stage}
                      size="small"
                      color={
                        candidate.stage === 'Placed'
                          ? 'success'
                          : candidate.stage === 'Offered'
                          ? 'primary'
                          : candidate.stage === 'Interviewed'
                          ? 'info'
                          : candidate.stage === 'Screened'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color={candidate.salary?.baseSalary ? 'text.primary' : 'text.disabled'}>
                      {candidate.salary?.baseSalary ? formatCurrency(candidate.salary.baseSalary) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {candidate.daysToPlace !== undefined ? `${candidate.daysToPlace} days` : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
