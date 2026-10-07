import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Stack,
  Button,
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
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import {
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Search,
  Sparkles,
  Briefcase,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import {
  SkillDevelopmentReportData,
  reportService,
  ExportReportParams,
} from '../../../services/report.service';

interface ReportsCenterViewProps {
  data: SkillDevelopmentReportData | null;
  loading: boolean;
  onRefresh?: () => void;
  selectedDepartment?: string;
}

export const ReportsCenterView: React.FC<ReportsCenterViewProps> = ({
  data,
  loading,
  selectedDepartment,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Export Loading States
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);

  const handleDownload = async (type: ExportReportParams['type'], format: ExportReportParams['format']) => {
    const key = `${type}-${format}`;
    setDownloadingType(key);
    setExportSuccessMsg(null);
    setExportErrorMsg(null);
    try {
      await reportService.downloadReport({
        type,
        format,
        departmentId: selectedDepartment || undefined,
      });
      setExportSuccessMsg(`Successfully generated ${type.toUpperCase()} report in ${format.toUpperCase()} format.`);
    } catch (err: any) {
      console.error('Export download failed:', err);
      setExportErrorMsg(err.message || 'Export download failed. Please try again.');
    } finally {
      setDownloadingType(null);
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading Skill Gap & Reporting Center...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No report data available for the selected filters. Try adjusting or resetting filters.
      </Alert>
    );
  }

  const { summary, records } = data;

  // Filter records by search term
  const filteredRecords = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.employee.name.toLowerCase().includes(term) ||
      r.employee.email.toLowerCase().includes(term) ||
      r.course.title.toLowerCase().includes(term) ||
      r.targetSkill.name.toLowerCase().includes(term) ||
      r.department.code.toLowerCase().includes(term)
    );
  });

  // Export Hub Domain Cards
  const exportDomains = [
    {
      type: 'skill-development' as const,
      title: 'Skill Development & Gap Resolution',
      description: 'Employee competency upgrades, baseline vs post-training ratings, and verified closed skill deficits.',
      icon: <Sparkles size={20} color="#8B5CF6" />,
      tagColor: 'secondary' as const,
    },
    {
      type: 'placement' as const,
      title: 'Candidate Placement Analytics',
      description: 'Placement conversion lifecycle, corporate hiring partners, placement durations, and salary offerings (₹ INR).',
      icon: <Briefcase size={20} color="#2563EB" />,
      tagColor: 'primary' as const,
    },
    {
      type: 'recruitment' as const,
      title: 'Recruitment & Job Requisitions',
      description: 'Job requisition fulfillment progress, sourcing channel efficiency (LinkedIn vs Direct), and cost per hire.',
      icon: <UserCheck size={20} color="#10B981" />,
      tagColor: 'success' as const,
    },
    {
      type: 'learning' as const,
      title: 'Learning & Development Analytics',
      description: 'Course enrolments, training completion rates, assessment exam scores, and professional certifications awarded.',
      icon: <GraduationCap size={20} color="#F59E0B" />,
      tagColor: 'warning' as const,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* SUCCESS BANNER */}
      {exportSuccessMsg && (
        <Alert severity="success" onClose={() => setExportSuccessMsg(null)} sx={{ borderRadius: 2 }}>
          {exportSuccessMsg}
        </Alert>
      )}

      {/* 1. SKILL GAP RESOLUTION & ROI SUMMARY CARDS */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Learners Tracked
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.08)' }}>
                <Users size={18} color="#2563EB" />
              </Box>
            </Stack>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700}>
              {summary.totalTracked}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.completedCount} completed programs
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Identified Deficits
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.08)' }}>
                <AlertTriangle size={18} color="#EF4444" />
              </Box>
            </Stack>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="error.main">
              {summary.gapsIdentified} Gaps
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Targeted for training upskilling
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Resolved Deficits
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.08)' }}>
                <CheckCircle2 size={18} color="#10B981" />
              </Box>
            </Stack>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="success.main">
              {summary.gapsResolved} Closed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verified via assessment score ≥ 75%
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card
            elevation={0}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Gap Resolution Rate
              </Typography>
              <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.08)' }}>
                <TrendingUp size={18} color="#8B5CF6" />
              </Box>
            </Stack>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="secondary.main">
              {summary.resolutionRate}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={summary.resolutionRate}
              color="secondary"
              sx={{ height: 6, borderRadius: 3, mt: 1 }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* 2. ONE-CLICK EXECUTIVE EXPORT HUB */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Download size={20} color="#2563EB" />
              <Typography variant="subtitle1" fontWeight={700}>
                Executive Workforce Export Center
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Download authenticated, audit-ready data streams in Microsoft Excel (.xlsx format) or printable PDF reports
            </Typography>
          </Box>
          <Chip label="RBAC Protected" size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
        </Stack>

        <Grid container spacing={2}>
          {exportDomains.map((domain) => (
            <Grid item xs={12} md={6} key={domain.type}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: 'background.default',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: theme.shadows[1],
                  },
                }}
              >
                <Box mb={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    {domain.icon}
                    <Typography variant="subtitle2" fontWeight={700}>
                      {domain.title}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {domain.description}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>

                  {/* Excel Export Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    color="success"
                    startIcon={
                      downloadingType === `${domain.type}-excel` ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <FileSpreadsheet size={14} />
                      )
                    }
                    onClick={() => handleDownload(domain.type, 'excel')}
                    disabled={Boolean(downloadingType)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Excel
                  </Button>

                  {/* PDF Printable Summary Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={
                      downloadingType === `${domain.type}-pdf` ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Printer size={14} />
                      )
                    }
                    onClick={() => handleDownload(domain.type, 'pdf')}
                    disabled={Boolean(downloadingType)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    PDF View
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 3. LIVE SKILL DEVELOPMENT DIRECTORY TABLE */}
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Live Skill Development & Gap Resolution Directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Individual employee competency progression, baseline vs post-training ratings, and verified gap closure
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search employee, skill, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#94A3B8" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table size="small" sx={{ minWidth: 850 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>TARGET COMPETENCY</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>ENROLLED TRAINING</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>BASELINE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>POST-TRAIN</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>GAIN</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>EXAM SCORE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>GAP RESOLUTION</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CREDENTIAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No matching employee skill development records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {r.employee.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.employee.email} &bull; {r.department.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.targetSkill.name} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {r.course.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.course.provider} &bull; {r.course.durationHours} hrs
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{r.baselineRating.toFixed(1)} / 5.0</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {r.postTrainingRating.toFixed(1)} / 5.0
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`+${r.ratingDelta.toFixed(1)}`}
                        size="small"
                        color={r.ratingDelta > 0 ? 'success' : 'default'}
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 20 }}
                      />
                    </TableCell>
                    <TableCell>
                      {r.assessmentScore !== undefined ? (
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={r.passedAssessment ? 'success.main' : 'warning.main'}
                        >
                          {r.assessmentScore}% {r.passedAssessment ? '✓' : ''}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.gapResolved ? (
                        <Chip
                          icon={<CheckCircle2 size={12} />}
                          label="YES (Resolved)"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                        />
                      ) : (
                        <Chip
                          label="In Progress"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.72rem' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {r.certificationEarned ? (
                        <Chip
                          icon={<Award size={12} />}
                          label="Certified"
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* SUCCESS FEEDBACK SNACKBAR */}
      <Snackbar
        open={Boolean(exportSuccessMsg)}
        autoHideDuration={4000}
        onClose={() => setExportSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setExportSuccessMsg(null)}
          severity="success"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {exportSuccessMsg}
        </Alert>
      </Snackbar>

      {/* ERROR FEEDBACK SNACKBAR */}
      <Snackbar
        open={Boolean(exportErrorMsg)}
        autoHideDuration={5000}
        onClose={() => setExportErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setExportErrorMsg(null)}
          severity="error"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >
          {exportErrorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
