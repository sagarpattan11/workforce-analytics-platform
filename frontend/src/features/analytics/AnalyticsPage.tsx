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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Award,
  AlertTriangle,
  GraduationCap,
  Layers,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  TrendingDown,
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
  Legend,
} from 'recharts';
import { PageShell } from '../../components/layout/PageShell';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { api } from '../../api/client';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

interface SkillAnalyticsData {
  skillDistribution: { category: string; count: number }[];
  requiredVsAvailable: {
    skill: string;
    category: string;
    required: number;
    available: number;
  }[];
  skillGaps: {
    id: string;
    name: string;
    category: string;
    required: number;
    available: number;
    gap: number;
    gapPercentage: number;
    status: 'Optimal' | 'Moderate' | 'Critical';
  }[];
  departmentSkillCoverage: {
    department: string;
    code: string;
    coverageRate: number;
    employeeCount: number;
  }[];
  topSkills: {
    name: string;
    category: string;
    availableEmployees: number;
  }[];
  missingSkills: {
    name: string;
    category: string;
    gap: number;
    priority: 'Optimal' | 'Moderate' | 'Critical';
  }[];
  certificationStatus: {
    totalAssessed: number;
    certifiedCount: number;
    uncertifiedCount: number;
    certificationRate: number;
  };
  trainingRecommendations: {
    id: string;
    title: string;
    category: string;
    targetSkill: string;
    durationHours: number;
    provider: string;
    difficulty: string;
    completionRate: number;
  }[];
}

interface DepartmentOption {
  _id: string;
  name: string;
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<SkillAnalyticsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments list
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res: any = await api.get('/departments');
        setDepartments(res.data?.data || res.data || []);
      } catch (err) {
        console.warn('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (selectedDept) params.departmentId = selectedDept;

      const res: any = await api.get('/skills/analytics', { params });
      setData(res.data?.data || res.data);
    } catch (err: any) {
      console.error('Failed to load skill analytics:', err);
      setError(
        err.response?.data?.message || 'Unable to connect to skill analytics service.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getPriorityChip = (status: 'Optimal' | 'Moderate' | 'Critical') => {
    switch (status) {
      case 'Critical':
        return <Chip label="Critical Gap" size="small" color="error" sx={{ fontWeight: 600 }} />;
      case 'Moderate':
        return <Chip label="Moderate" size="small" color="warning" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label="Optimal" size="small" color="success" sx={{ fontWeight: 600 }} />;
    }
  };

  return (
    <PageShell
      title="Skill & Competency Analytics"
      description="Workforce skill distribution, capability gap analysis, and tailored training recommendations."
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="dept-filter-analytics">Department Filter</InputLabel>
            <Select
              labelId="dept-filter-analytics"
              value={selectedDept}
              label="Department Filter"
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchAnalytics}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <SkeletonLoader type="card" count={8} />
      ) : data ? (
        <Box>
          {/* ------------------------------------------------------------- */}
          {/* SUMMARY KPI METRIC CARDS */}
          {/* ------------------------------------------------------------- */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Skills Tracked
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#2563EB">
                      {data.skillDistribution.reduce((acc, curr) => acc + curr.count, 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across 5 categories
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                    <Layers size={24} color="#2563EB" />
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Critical Skill Gaps
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#EF4444">
                      {data.skillGaps.filter((g) => g.status === 'Critical').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Requiring talent action
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                    <AlertTriangle size={24} color="#EF4444" />
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Certification Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#10B981">
                      {data.certificationStatus.certificationRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.certificationStatus.certifiedCount} verified credentials
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                    <Award size={24} color="#10B981" />
                  </Box>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Active Course Catalog
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#8B5CF6">
                      {data.trainingRecommendations.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Targeted upskilling paths
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
                    <GraduationCap size={24} color="#8B5CF6" />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* ------------------------------------------------------------- */}
          {/* PANEL 1 & 2: REQUIRED VS AVAILABLE & SKILL DISTRIBUTION */}
          {/* ------------------------------------------------------------- */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Panel 1: Required vs Available Skills */}
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Required vs. Available Skills
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Benchmark comparison between workforce demand and active skilled personnel
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.requiredVsAvailable}
                      margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="skill"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="required" fill="#94A3B8" name="Required Headcount" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="available" fill="#2563EB" name="Available Skilled" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Panel 2: Skill Distribution */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Skill Distribution by Category
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Classification across technical and operational domains
                </Typography>
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.skillDistribution}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {data.skillDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* ------------------------------------------------------------- */}
          {/* PANEL 3 & 4: DEPARTMENT COVERAGE & SKILL GAP MATRIX */}
          {/* ------------------------------------------------------------- */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Panel 3: Department Skill Coverage */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Department Skill Coverage
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                  Percentage of required competency standards met per department
                </Typography>
                <Stack spacing={2.5}>
                  {data.departmentSkillCoverage.map((dept, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {dept.department}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={dept.coverageRate >= 75 ? 'success.main' : 'warning.main'}>
                          {dept.coverageRate}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={dept.coverageRate}
                        color={dept.coverageRate >= 75 ? 'primary' : 'warning'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* Panel 4: Skill Gaps Matrix */}
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Skill Gaps Matrix
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Identification of skill deficits against operational demand
                </Typography>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700 }}>Skill Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Req.</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Avail.</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Deficit</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.skillGaps.slice(0, 6).map((gap) => (
                        <TableRow key={gap.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{gap.name}</TableCell>
                          <TableCell>
                            <Chip label={gap.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">{gap.required}</TableCell>
                          <TableCell align="center">{gap.available}</TableCell>
                          <TableCell align="center">
                            <Typography variant="caption" fontWeight={700} color={gap.gap > 0 ? 'error.main' : 'success.main'}>
                              {gap.gap > 0 ? `-${gap.gap}` : '0'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{getPriorityChip(gap.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>

          {/* ------------------------------------------------------------- */}
          {/* PANEL 5 & 6: TOP / MISSING SKILLS & CERTIFICATION STATUS */}
          {/* ------------------------------------------------------------- */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Top Skills */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TrendingUp size={18} color="#10B981" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Top In-Demand Skills
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Highest talent depth across team members
                </Typography>
                <Stack spacing={1.5}>
                  {data.topSkills.map((sk, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {sk.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sk.category}
                        </Typography>
                      </Box>
                      <Chip label={`${sk.availableEmployees} experts`} size="small" color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* Missing Critical Skills */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TrendingDown size={18} color="#EF4444" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Missing Critical Skills
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Top deficit capabilities needing hiring or training
                </Typography>
                <Stack spacing={1.5}>
                  {data.missingSkills.map((sk, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {sk.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sk.category}
                        </Typography>
                      </Box>
                      <Chip label={`Deficit: ${sk.gap}`} size="small" color="error" />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            {/* Certification Status */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Award size={18} color="#2563EB" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Certification Status
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                  Verified enterprise credentials vs uncertified competencies
                </Typography>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="h3" fontWeight={800} color="#2563EB">
                    {data.certificationStatus.certificationRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Workforce Certification Rate
                  </Typography>
                </Box>
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle2 size={16} color="#10B981" />
                      <Typography variant="body2">Certified Credentials</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700}>
                      {data.certificationStatus.certifiedCount}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Layers size={16} color="#94A3B8" />
                      <Typography variant="body2">Uncertified Skills</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700}>
                      {data.certificationStatus.uncertifiedCount}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>

          {/* ------------------------------------------------------------- */}
          {/* PANEL 7: TRAINING RECOMMENDATIONS */}
          {/* ------------------------------------------------------------- */}
          <Card variant="outlined" sx={{ borderRadius: 2.5, p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Automated Training Recommendations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Curated courses automatically mapped to eliminate detected skill deficits
                </Typography>
              </Box>
              <Chip
                icon={<BookOpen size={14} />}
                label="AI Curated Upskilling"
                color="secondary"
                size="small"
                variant="outlined"
              />
            </Stack>

            <Grid container spacing={2}>
              {data.trainingRecommendations.map((tr) => (
                <Grid item xs={12} sm={6} md={3} key={tr.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: 'background.default',
                    }}
                  >
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Chip label={tr.category} size="small" color="primary" variant="outlined" />
                        <Chip label={tr.difficulty} size="small" />
                      </Stack>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        {tr.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Target Skill: <strong>{tr.targetSkill}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Provider: {tr.provider} • {tr.durationHours} hrs
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Success: <strong>{tr.completionRate}%</strong>
                        </Typography>
                        <Button variant="contained" size="small" sx={{ textTransform: 'none' }}>
                          Enroll Team
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Box>
      ) : null}
    </PageShell>
  );
};

export default AnalyticsPage;
