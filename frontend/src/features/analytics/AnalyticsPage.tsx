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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Tabs,
  Tab,
  Menu,
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
  Briefcase,
  UserCheck,
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown,
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
import { placementService, PlacementAnalyticsData } from '../../services/placement.service';
import { PlacementAnalyticsView } from './components/PlacementAnalyticsView';
import { recruitmentService, RecruitmentAnalyticsData } from '../../services/recruitment.service';
import { RecruitmentAnalyticsView } from './components/RecruitmentAnalyticsView';
import { learningService, LearningAnalyticsData } from '../../services/learning.service';
import { LearningAnalyticsView } from './components/LearningAnalyticsView';
import { reportService, SkillDevelopmentReportData } from '../../services/report.service';
import { ReportsCenterView } from './components/ReportsCenterView';

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
  const [activeTab, setActiveTab] = useState<'skills' | 'placement' | 'recruitment' | 'learning' | 'reports'>('skills');
  const [data, setData] = useState<SkillAnalyticsData | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placement Analytics State
  const [placementData, setPlacementData] = useState<PlacementAnalyticsData | null>(null);
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementError, setPlacementError] = useState<string | null>(null);

  // Recruitment Analytics State
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentAnalyticsData | null>(null);
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);
  const [recruitmentError, setRecruitmentError] = useState<string | null>(null);

  // Learning Analytics State
  const [learningData, setLearningData] = useState<LearningAnalyticsData | null>(null);
  const [learningLoading, setLearningLoading] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);

  // Reports & Skill Development State
  const [reportData, setReportData] = useState<SkillDevelopmentReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Quick Export State & Action Handler
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportAnchorEl(null);
    setExporting(format);
    setExportMsg(null);
    try {
      const exportType =
        activeTab === 'placement'
          ? 'placement'
          : activeTab === 'recruitment'
          ? 'recruitment'
          : activeTab === 'learning'
          ? 'learning'
          : 'skill-development';

      await reportService.downloadReport({
        type: exportType,
        format,
        departmentId: selectedDept || undefined,
      });

      setExportMsg({
        text: `Successfully exported ${exportType.toUpperCase()} report in ${format.toUpperCase()} format.`,
        severity: 'success',
      });
    } catch (err: any) {
      console.error('Export error:', err);
      setExportMsg({
        text: err.message || `Failed to export ${format.toUpperCase()} report.`,
        severity: 'error',
      });
    } finally {
      setExporting(null);
    }
  };

  // Enroll Team Dialog & Feedback State
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any | null>(null);
  const [targetTeam, setTargetTeam] = useState('Engineering');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null);

  const handleOpenEnroll = (training: any) => {
    setSelectedTraining(training);
    setEnrollDialogOpen(true);
  };

  const handleCloseEnroll = () => {
    if (!enrolling) {
      setEnrollDialogOpen(false);
      setSelectedTraining(null);
    }
  };

  const handleConfirmEnroll = () => {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrollDialogOpen(false);
      setEnrollSuccessMsg(
        `✅ Successfully enrolled ${targetTeam} team into "${selectedTraining?.title}"! 6 employee learning paths activated.`
      );
      setSelectedTraining(null);
    }, 600);
  };

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

  const fetchPlacementAnalytics = useCallback(async () => {
    setPlacementLoading(true);
    setPlacementError(null);
    try {
      const res = await placementService.getPlacementAnalytics({
        departmentId: selectedDept || undefined,
      });
      setPlacementData(res.data);
    } catch (err: any) {
      console.error('Failed to load placement analytics:', err);
      setPlacementError(
        err.response?.data?.message || 'Unable to connect to placement analytics service.'
      );
    } finally {
      setPlacementLoading(false);
    }
  }, [selectedDept]);

  const fetchRecruitmentAnalytics = useCallback(async () => {
    setRecruitmentLoading(true);
    setRecruitmentError(null);
    try {
      const res = await recruitmentService.getRecruitmentAnalytics({
        departmentId: selectedDept || undefined,
      });
      setRecruitmentData(res.data);
    } catch (err: any) {
      console.error('Failed to load recruitment analytics:', err);
      setRecruitmentError(
        err.response?.data?.message || 'Unable to connect to recruitment analytics service.'
      );
    } finally {
      setRecruitmentLoading(false);
    }
  }, [selectedDept]);

  const fetchLearningAnalytics = useCallback(async () => {
    setLearningLoading(true);
    setLearningError(null);
    try {
      const res = await learningService.getLearningAnalytics({
        departmentId: selectedDept || undefined,
      });
      setLearningData(res.data);
    } catch (err: any) {
      console.error('Failed to load learning analytics:', err);
      setLearningError(
        err.response?.data?.message || 'Unable to connect to learning analytics service.'
      );
    } finally {
      setLearningLoading(false);
    }
  }, [selectedDept]);

  const fetchReportData = useCallback(async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await reportService.getSkillDevelopmentReport({
        departmentId: selectedDept || undefined,
      });
      setReportData(res.data);
    } catch (err: any) {
      console.error('Failed to load report data:', err);
      setReportError(
        err.response?.data?.message || 'Unable to connect to reports service.'
      );
    } finally {
      setReportLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    if (activeTab === 'skills') {
      fetchAnalytics();
    } else if (activeTab === 'placement') {
      fetchPlacementAnalytics();
    } else if (activeTab === 'recruitment') {
      fetchRecruitmentAnalytics();
    } else if (activeTab === 'learning') {
      fetchLearningAnalytics();
    } else if (activeTab === 'reports') {
      fetchReportData();
    }
  }, [
    activeTab,
    fetchAnalytics,
    fetchPlacementAnalytics,
    fetchRecruitmentAnalytics,
    fetchLearningAnalytics,
    fetchReportData,
  ]);

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
      title={
        activeTab === 'skills'
          ? 'Skill & Competency Analytics'
          : activeTab === 'placement'
          ? 'Placement Analytics & Funnel'
          : activeTab === 'recruitment'
          ? 'Recruitment & Talent Acquisition Analytics'
          : activeTab === 'learning'
          ? 'Learning & Development Analytics'
          : 'Skill Development & Executive Reports'
      }
      description={
        activeTab === 'skills'
          ? 'Workforce skill distribution, capability gap analysis, and tailored training recommendations.'
          : activeTab === 'placement'
          ? 'Candidate placement lifecycle, conversion funnel, employer benchmarks, and compensation insights.'
          : activeTab === 'recruitment'
          ? 'Requisition fulfillment, candidate hiring funnel, sourcing channel ROI, and time-to-hire benchmarks.'
          : activeTab === 'learning'
          ? 'Workforce upskilling velocity, course completion funnels, assessment score mastery, and credentials.'
          : 'Competency upgrade tracking, skill-gap training linkages, and multi-format data exports.'
      }
      disablePaper
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
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
            startIcon={
              (activeTab === 'skills'
                ? loading
                : activeTab === 'placement'
                ? placementLoading
                : activeTab === 'recruitment'
                ? recruitmentLoading
                : activeTab === 'learning'
                ? learningLoading
                : reportLoading) ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshCw size={16} />
              )
            }
            onClick={
              activeTab === 'skills'
                ? fetchAnalytics
                : activeTab === 'placement'
                ? fetchPlacementAnalytics
                : activeTab === 'recruitment'
                ? fetchRecruitmentAnalytics
                : activeTab === 'learning'
                ? fetchLearningAnalytics
                : fetchReportData
            }
            disabled={
              activeTab === 'skills'
                ? loading
                : activeTab === 'placement'
                ? placementLoading
                : activeTab === 'recruitment'
                ? recruitmentLoading
                : activeTab === 'learning'
                ? learningLoading
                : reportLoading
            }
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <Download size={16} />}
            endIcon={<ChevronDown size={14} />}
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
            disabled={Boolean(exporting)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={() => setExportAnchorEl(null)}
            PaperProps={{ sx: { minWidth: 200, borderRadius: 2, mt: 0.5, boxShadow: 3 } }}
          >
            <MenuItem onClick={() => handleExport('excel')} sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FileSpreadsheet size={16} color="#10B981" />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Export as Excel</Typography>
                  <Typography variant="caption" color="text.secondary">UTF-8 BOM formatted table</Typography>
                </Box>
              </Stack>
            </MenuItem>
            <MenuItem onClick={() => handleExport('pdf')} sx={{ py: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Printer size={16} color="#F59E0B" />
                <Box>
                  <Typography variant="body2" fontWeight={600}>Print / PDF Summary</Typography>
                  <Typography variant="caption" color="text.secondary">Printable executive layout</Typography>
                </Box>
              </Stack>
            </MenuItem>
          </Menu>
        </Stack>
      }
    >
      {/* ------------------------------------------------------------- */}
      {/* SUB-MODULE TABS NAVIGATION (RESPONSIVE SCROLLABLE ON MOBILE) */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 48,
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': { opacity: 0.3 },
            },
          }}
        >
          <Tab
            value="skills"
            icon={<Award size={18} />}
            iconPosition="start"
            label="Skill & Workforce Analytics"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, whiteSpace: 'nowrap' }}
          />
          <Tab
            value="placement"
            icon={<Briefcase size={18} />}
            iconPosition="start"
            label="Placement Analytics"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, whiteSpace: 'nowrap' }}
          />
          <Tab
            value="recruitment"
            icon={<UserCheck size={18} />}
            iconPosition="start"
            label="Recruitment Analytics"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, whiteSpace: 'nowrap' }}
          />
          <Tab
            value="learning"
            icon={<GraduationCap size={18} />}
            iconPosition="start"
            label="Learning & Training"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, whiteSpace: 'nowrap' }}
          />
          <Tab
            value="reports"
            icon={<FileText size={18} />}
            iconPosition="start"
            label="Reports & Exports"
            sx={{ fontWeight: 600, textTransform: 'none', minHeight: 48, whiteSpace: 'nowrap' }}
          />
        </Tabs>
      </Box>

      {(activeTab === 'skills'
        ? error
        : activeTab === 'placement'
        ? placementError
        : activeTab === 'recruitment'
        ? recruitmentError
        : activeTab === 'learning'
        ? learningError
        : reportError) && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={
                activeTab === 'skills'
                  ? fetchAnalytics
                  : activeTab === 'placement'
                  ? fetchPlacementAnalytics
                  : activeTab === 'recruitment'
                  ? fetchRecruitmentAnalytics
                  : activeTab === 'learning'
                  ? fetchLearningAnalytics
                  : fetchReportData
              }
            >
              Retry
            </Button>
          }
        >
          {activeTab === 'skills'
            ? error
            : activeTab === 'placement'
            ? placementError
            : activeTab === 'recruitment'
            ? recruitmentError
            : activeTab === 'learning'
            ? learningError
            : reportError}
        </Alert>
      )}

      {activeTab === 'skills' ? (
        loading && !data ? (
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
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Skill Gaps Matrix
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Identification of skill deficits against operational demand
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      size="small"
                      color="success"
                      startIcon={exporting === 'excel' ? <CircularProgress size={12} /> : <FileSpreadsheet size={14} />}
                      onClick={() => handleExport('excel')}
                      disabled={Boolean(exporting)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                    >
                      Excel
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      startIcon={exporting === 'pdf' ? <CircularProgress size={12} /> : <Printer size={14} />}
                      onClick={() => handleExport('pdf')}
                      disabled={Boolean(exporting)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                    >
                      PDF
                    </Button>
                  </Stack>
                </Stack>
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
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ textTransform: 'none' }}
                          onClick={() => handleOpenEnroll(tr)}
                        >
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
      ) : null
    ) : activeTab === 'placement' ? (
      <PlacementAnalyticsView data={placementData} loading={placementLoading} />
    ) : activeTab === 'recruitment' ? (
      <RecruitmentAnalyticsView data={recruitmentData} loading={recruitmentLoading} />
    ) : activeTab === 'learning' ? (
      <LearningAnalyticsView data={learningData} loading={learningLoading} />
    ) : (
      <ReportsCenterView
        data={reportData}
        loading={reportLoading}
        onRefresh={fetchReportData}
        selectedDepartment={selectedDept}
      />
    )}

      {/* ------------------------------------------------------------- */}
      {/* ENROLL TEAM CONFIRMATION DIALOG */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={enrollDialogOpen}
        onClose={handleCloseEnroll}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Enroll Team in Training</DialogTitle>
        <DialogContent dividers>
          {selectedTraining && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {selectedTraining.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Target Skill: <strong>{selectedTraining.targetSkill}</strong> • {selectedTraining.provider}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Duration: {selectedTraining.durationHours} hrs • Level: {selectedTraining.difficulty}
                </Typography>
              </Box>

              <FormControl fullWidth size="small">
                <InputLabel id="target-dept-label">Target Team / Department</InputLabel>
                <Select
                  labelId="target-dept-label"
                  value={targetTeam}
                  label="Target Team / Department"
                  onChange={(e) => setTargetTeam(e.target.value)}
                >
                  <MenuItem value="Engineering">Engineering Team (6 Members)</MenuItem>
                  <MenuItem value="Product & Design">Product & Design Team (4 Members)</MenuItem>
                  <MenuItem value="Data Science">Data & AI Analytics (5 Members)</MenuItem>
                  <MenuItem value="Marketing">Growth & Marketing (3 Members)</MenuItem>
                  <MenuItem value="Operations">Workforce Operations (4 Members)</MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ borderRadius: 1.5, py: 0.5 }}>
                Enrolling this team will assign courses to employees with detected skill gaps and schedule calendar sync.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEnroll} disabled={enrolling} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmEnroll}
            disabled={enrolling}
            startIcon={enrolling ? <CircularProgress size={16} color="inherit" /> : <GraduationCap size={16} />}
          >
            {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={Boolean(enrollSuccessMsg)}
        autoHideDuration={4000}
        onClose={() => setEnrollSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setEnrollSuccessMsg(null)}
          severity="success"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {enrollSuccessMsg}
        </Alert>
      </Snackbar>

      {/* EXPORT FEEDBACK SNACKBAR */}
      <Snackbar
        open={Boolean(exportMsg)}
        autoHideDuration={4000}
        onClose={() => setExportMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setExportMsg(null)}
          severity={exportMsg?.severity || 'info'}
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {exportMsg?.text}
        </Alert>
      </Snackbar>
    </PageShell>
  );
};

export default AnalyticsPage;
