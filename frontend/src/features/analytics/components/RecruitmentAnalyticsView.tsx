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
  useMediaQuery,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Briefcase,
  Users,
  UserCheck,
  Clock,
  IndianRupee,
  CheckCircle2,
  Share2,
  Building2,
  AlertCircle,
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
import { RecruitmentAnalyticsData } from '../../../services/recruitment.service';

interface RecruitmentAnalyticsViewProps {
  data: RecruitmentAnalyticsData | null;
  loading: boolean;
}

const FUNNEL_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981'];

export const RecruitmentAnalyticsView: React.FC<RecruitmentAnalyticsViewProps> = ({
  data,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading && !data) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading Recruitment Analytics...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No recruitment data found for the selected filter criteria. Try adjusting or resetting filters.
      </Alert>
    );
  }

  const { kpis, funnel, breakdowns, activeRequisitions } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getPriorityChip = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <Chip label="Critical" size="small" color="error" sx={{ fontWeight: 600 }} />;
      case 'High':
        return <Chip label="High" size="small" color="warning" sx={{ fontWeight: 600 }} />;
      case 'Medium':
        return <Chip label="Medium" size="small" color="info" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Low" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Closed':
        return <Chip label="Closed" size="small" color="success" sx={{ fontWeight: 600 }} />;
      case 'Offer Sent':
        return <Chip label="Offer Sent" size="small" color="primary" sx={{ fontWeight: 600 }} />;
      case 'Interviewing':
        return <Chip label="Interviewing" size="small" color="secondary" sx={{ fontWeight: 600 }} />;
      case 'Open':
        return <Chip label="Open" size="small" color="warning" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" variant="outlined" />;
    }
  };

  // 6 Top KPI Cards
  const kpiCards = [
    {
      title: 'Open Positions',
      value: kpis.openPositions.toLocaleString(),
      subtext: `${kpis.filledPositions} positions filled`,
      icon: <Briefcase size={22} color="#2563EB" />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      title: 'Total Applications',
      value: kpis.applications.toLocaleString(),
      subtext: `${kpis.totalRequisitions} active requisitions`,
      icon: <Users size={22} color="#6366F1" />,
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.08)',
    },
    {
      title: 'Successful Hires',
      value: kpis.successfulHires.toLocaleString(),
      subtext: `${kpis.offers} offers extended`,
      icon: <UserCheck size={22} color="#10B981" />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Avg. Time to Hire',
      value: `${kpis.timeToHireDays} Days`,
      subtext: 'Requisition open to accepted offer',
      icon: <Clock size={22} color="#F59E0B" />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Avg. Cost per Hire',
      value: formatCurrency(kpis.costPerHire),
      subtext: 'Sourcing & operational fees',
      icon: <IndianRupee size={22} color="#059669" />,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.08)',
    },
    {
      title: 'Offer Acceptance',
      value: `${kpis.offerAcceptanceRate}%`,
      subtext: 'Candidate offer conversion',
      icon: <CheckCircle2 size={22} color="#8B5CF6" />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. TOP KPI METRICS ROW */}
      <Grid container spacing={2}>
        {kpiCards.map((card, idx) => (
          <Grid item xs={6} sm={4} lg={2} key={idx}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.2 },
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: { xs: 0.5, sm: 0.8 },
                    borderRadius: 2,
                    bgcolor: card.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {React.cloneElement(card.icon as React.ReactElement, { size: isMobile ? 18 : 22 })}
                </Box>
              </Stack>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} color="text.primary" lineHeight={1.2}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: { xs: '0.68rem', sm: '0.75rem' } }} noWrap>
                {card.subtext}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. RECRUITMENT FUNNEL & SOURCING CHANNELS */}
      <Grid container spacing={3}>
        {/* Left: 5-Stage Cumulative Funnel */}
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
                  Recruitment Conversion Funnel
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cumulative progression from application to successful hire
                </Typography>
              </Box>
              <Chip
                label={`${funnel[4]?.percentage || 0}% Overall Hire Rate`}
                color="primary"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Box sx={{ width: '100%', height: 300, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnel}
                  layout="vertical"
                  margin={{ top: 10, right: isMobile ? 15 : 30, left: isMobile ? -10 : 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.secondary }}
                    width={isMobile ? 105 : 140}
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

            {/* Quick funnel stage pills */}
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Pipeline Volume by Stage:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
                <Chip label={`Applied: ${kpis.applications}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover', fontWeight: 500 }} />
                <Chip label={`Shortlisted: ${kpis.shortlisted}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover', fontWeight: 500 }} />
                <Chip label={`Interviewed: ${kpis.interviews}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover', fontWeight: 500 }} />
                <Chip label={`Offered: ${kpis.offers}`} size="small" variant="filled" sx={{ bgcolor: 'action.hover', fontWeight: 500 }} />
                <Chip label={`Hired: ${kpis.successfulHires}`} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* Right: Sourcing Channels Efficiency */}
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
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Share2 size={20} color="#6366F1" />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Sourcing Channel Performance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Applicant volume vs hires by recruitment channel
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdowns.byChannel}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="channel"
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      val,
                      name === 'hires' ? 'Successful Hires' : 'Applications',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="applications" name="Applications" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hires" name="Hires" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Channel Cost Insights */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mt={1} pt={1.5} borderTop="1px solid" borderColor="divider">
              {breakdowns.byChannel.slice(0, 3).map((ch, i) => (
                <Chip
                  key={i}
                  label={`${ch.channel}: ${formatCurrency(ch.costPerHire)}/hire`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 3. DEPARTMENT OPENINGS & PRIORITY BREAKDOWN */}
      <Grid container spacing={3}>
        {/* Left: Department Hiring Demand */}
        <Grid item xs={12} md={7}>
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
                  Hiring Demand by Department
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Open vs filled positions across functional units
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breakdowns.byDepartment}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="departmentCode"
                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      val,
                      name === 'openPositions' ? 'Open Positions' : 'Positions Filled',
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="openPositions" name="Open Positions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="filledPositions" name="Filled" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Right: Requisition Priority Distribution */}
        <Grid item xs={12} md={5}>
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
              <AlertCircle size={20} color="#EF4444" />
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Requisitions by Priority
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Urgency and opening allocations
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {breakdowns.byPriority.map((p, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {getPriorityChip(p.priority)}
                    <Typography variant="body2" fontWeight={600}>
                      {p.requisitionsCount} {p.requisitionsCount === 1 ? 'Requisition' : 'Requisitions'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {p.openPositions} Open • {p.hires} Hired
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 4. ACTIVE REQUISITIONS DIRECTORY TABLE */}
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
                Active Job Requisitions Directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live drill-down of all job requisitions, hiring managers, and fulfillment progress
              </Typography>
            </Box>
            <Chip
              label={`${activeRequisitions.length} Requisitions`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>REQ #</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>JOB TITLE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>FULFILLMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>SOURCING</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>TIME TO HIRE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>PRIORITY</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeRequisitions.map((req) => {
                const deptName =
                  typeof req.departmentId === 'object' && req.departmentId !== null
                    ? req.departmentId.name
                    : 'Engineering';
                const progressPct =
                  req.openPositions > 0
                    ? Math.round((req.filledPositions / req.openPositions) * 100)
                    : 0;

                return (
                  <TableRow key={req._id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'primary.main' }}>
                      {req.requisitionNumber}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {req.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {req.applicationsCount} applicants • {req.interviewedCount} interviewed
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{deptName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{req.location}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Stack spacing={0.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" fontWeight={600}>
                            {req.filledPositions}/{req.openPositions}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {progressPct}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progressPct, 100)}
                          color={progressPct >= 100 ? 'success' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={req.sourcingChannel} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontWeight={600}>
                        {req.timeToHireDays} Days
                      </Typography>
                    </TableCell>
                    <TableCell>{getPriorityChip(req.priority)}</TableCell>
                    <TableCell>{getStatusChip(req.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
