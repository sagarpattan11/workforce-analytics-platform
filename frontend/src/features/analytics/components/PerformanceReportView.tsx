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
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Award,
  Star,
  Target,
  Users,
  Search,
  RefreshCw,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import performanceService, {
  IPerformanceReportData,
  IPromotionReadyEmployee,
} from '../../../services/performance.service';

export const PerformanceReportView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IPerformanceReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [departmentList, setDepartmentList] = useState<Array<{ departmentId: string; departmentName: string; code?: string }>>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Nomination Action State
  const [nominatedCandidate, setNominatedCandidate] = useState<IPromotionReadyEmployee | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { departmentId?: string; reviewPeriod?: string } = {};
      if (selectedPeriod !== 'ALL') params.reviewPeriod = selectedPeriod;
      if (selectedDepartment !== 'ALL') params.departmentId = selectedDepartment;

      const res = await performanceService.getPerformanceReport(params);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.allDepartments && res.data.allDepartments.length > 0) {
          setDepartmentList(res.data.allDepartments);
        }
      }
    } catch (err: any) {
      console.error('Error fetching performance analytics:', err);
      setError(err.message || 'Failed to load performance analytics report.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedDepartment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNominateClick = (candidate: IPromotionReadyEmployee) => {
    setNominatedCandidate(candidate);
    setDialogOpen(true);
  };

  const handleConfirmNomination = () => {
    if (nominatedCandidate) {
      setSnackbarMessage(
        `Successfully submitted promotion nomination for ${nominatedCandidate.name} to ${nominatedCandidate.recommendedRole}.`
      );
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Aggregating Performance Reviews, Goal Achievements & Promotion Pipelines...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
          {error || 'Unable to display performance reporting data.'}
        </Alert>
      </Box>
    );
  }

  const { summary, departmentRatings, performanceTrends, promotionReadiness, correlationMatrix } = data;

  // Filter promotion candidates by search term
  const filteredCandidates = promotionReadiness.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Filters */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Award size={28} color="#2563EB" />
            <Typography variant="h5" fontWeight={700}>
              Multi-Dimensional Performance & Promotion Readiness
            </Typography>
            <Chip
              label="Appraisal Intelligence"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quarterly performance evaluation trajectories, department goal achievement, behavioral correlations, and algorithmic promotion pipelines.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            select
            size="small"
            label="Department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="ALL">All Departments</MenuItem>
            {(departmentList.length > 0 ? departmentList : data.allDepartments || departmentRatings).map((dept) => (
              <MenuItem key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Review Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="ALL">All Quarters</MenuItem>
            <MenuItem value="2026-Q1">2026-Q1</MenuItem>
            <MenuItem value="2025-Q4">2025-Q4</MenuItem>
            <MenuItem value="2025-Q3">2025-Q3</MenuItem>
            <MenuItem value="2025-Q2">2025-Q2</MenuItem>
            <MenuItem value="2025-Q1">2025-Q1</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<RefreshCw size={18} />}
            onClick={() => fetchData()}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* 2. Top 5 Outlined KPI Cards (No colored side borders) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Reviews Evaluated */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  REVIEWS EVALUATED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
                  {summary.totalReviews}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Appraisals Processed
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                <Users size={22} color="#2563EB" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Average Rating */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  AVERAGE RATING
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#F59E0B" sx={{ mt: 0.5 }}>
                  {summary.avgRating} <Typography component="span" variant="body2" color="text.secondary">/ 5.0</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Company Appraisal Mean
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
                <Star size={22} color="#F59E0B" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Goal Achievement Rate */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  GOAL ACHIEVEMENT
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#10B981" sx={{ mt: 0.5 }}>
                  {summary.avgGoalAchievement}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  OKR & KPI Target Attainment
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                <Target size={22} color="#10B981" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOP PERFORMERS
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#7C3AED" sx={{ mt: 0.5 }}>
                  {summary.topPerformersCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rating ≥ 4.5 Stars
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                <Sparkles size={22} color="#7C3AED" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Promotion-Ready Candidates */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  PROMOTION READY
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#EC4899" sx={{ mt: 0.5 }}>
                  {summary.promotionReadyCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qualified For Advancement
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(236, 72, 153, 0.1)' }}>
                <ArrowUpRight size={22} color="#EC4899" />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Row 1: Quarterly Trajectory & Department Breakdown */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance Trajectory Over Time */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Quarterly Performance Rating Trajectory
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Evolution of company-wide average rating across evaluation cycles
            </Typography>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrends} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="reviewPeriod" tick={{ fontSize: 12 }} />
                  <YAxis domain={[2.5, 5.0]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    name="Average Rating (out of 5.0)"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563EB' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Department Ratings & Goal Achievement */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Department Ratings & Goal Attainment
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Comparison of average appraisal rating across functional units
            </Typography>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentRatings} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5.0]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRating" name="Avg Rating (/5.0)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Row 2: Behavioral Performance Correlations */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance vs. Attendance */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <Clock size={20} color="#10B981" />
              <Typography variant="subtitle1" fontWeight={700}>
                Performance vs. Attendance Rate Correlation
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Proves statistical correlation between punctuality/presence and high performance scores
            </Typography>

            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={correlationMatrix.performanceVsAttendance} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="attendanceBand" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5.0]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="avgPerformanceRating" name="Avg Rating (/5.0)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Performance vs. Training Hours */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <GraduationCap size={20} color="#EC4899" />
              <Typography variant="subtitle1" fontWeight={700}>
                Performance vs. Training & L&D Hours
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Demonstrates tangible ROI of corporate learning programs on appraisal ratings
            </Typography>

            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={correlationMatrix.performanceVsTrainingHours} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="trainingBand" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5.0]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="avgPerformanceRating" name="Avg Rating (/5.0)" fill="#EC4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 5. Promotion Readiness Priority Pipeline Table */}
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ArrowUpRight size={22} color="#7C3AED" />
              <Typography variant="subtitle1" fontWeight={700}>
                Algorithmically Qualified Promotion Candidates
              </Typography>
              <Chip
                label={`${promotionReadiness.length} Qualified Candidates`}
                color="success"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Qualified candidates meeting rating $\ge$ 4.2, tenure $\ge$ 12 months, and goal attainment $\ge$ 80%
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search candidate name, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Current Position</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Appraisal Rating
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Goal Completion
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Tenure
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Promotion Score
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Recommended Next Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No promotion candidates matching search filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {c.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.department}</TableCell>
                    <TableCell>{c.position}</TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={<Star size={12} color="#F59E0B" fill="#F59E0B" />}
                        label={`${c.rating} / 5.0`}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color="#10B981">
                        {c.goalsAchievedRate}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {Math.floor(c.tenureMonths / 12)}y {c.tenureMonths % 12}m
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <Box sx={{ width: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={c.promotionReadinessScore}
                            color="success"
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={700}>
                          {c.promotionReadinessScore}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#7C3AED' }}>
                      {c.recommendedRole}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleNominateClick(c)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                      >
                        Nominate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Nomination Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nominate for Promotion</DialogTitle>
        <DialogContent dividers>
          {nominatedCandidate && (
            <Stack spacing={2}>
              <Typography variant="body2">
                Are you sure you want to officially nominate <strong>{nominatedCandidate.name}</strong> ({nominatedCandidate.employeeId}) for promotion?
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Current Position:</Typography>
                <Typography variant="body2" fontWeight={600}>{nominatedCandidate.position} ({nominatedCandidate.department})</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Recommended Target Position:</Typography>
                <Typography variant="body2" fontWeight={700} color="#7C3AED">{nominatedCandidate.recommendedRole}</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Readiness Match Score:</Typography>
                <Typography variant="body2" fontWeight={700} color="#10B981">{nominatedCandidate.promotionReadinessScore}%</Typography>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmNomination}>
            Confirm Nomination
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification Snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default PerformanceReportView;
