import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  Button,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  FileText,
  Download,
  ShieldCheck,
  History,
  BrainCircuit,
  TrendingUp,
  Sliders,
  Award,
  BookOpen,
  Users,
  Search,
  Printer,
  FileSpreadsheet,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { reportService, ReportType } from '../../services/report.service';

interface IReportCardConfig {
  id: ReportType;
  title: string;
  category: 'predictive' | 'talent';
  categoryLabel: string;
  categoryColor: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  dataPoints: string[];
  frequency: string;
}

const REPORT_CATALOG: IReportCardConfig[] = [
  {
    id: 'attrition',
    title: 'Attrition Risk & Retention Strategy Report',
    category: 'predictive',
    categoryLabel: 'Predictive AI',
    categoryColor: 'primary',
    icon: <BrainCircuit size={24} color="#2563EB" />,
    subtitle: 'Who is at risk of leaving, why, and what actions will retain them?',
    description:
      'Extracts employee attrition probabilities, risk tier classification (High/Medium/Low), top SHAP risk drivers, prediction confidence levels, and automated HR retention action plans.',
    dataPoints: ['Risk Score (0-100%)', 'Risk Tiers', 'SHAP Feature Drivers', 'Retention Playbook', 'Confidence %'],
    frequency: 'Weekly Automated Run',
  },
  {
    id: 'demand',
    title: '12-Month Workforce Demand & Hiring Forecast',
    category: 'predictive',
    categoryLabel: 'Forecasting',
    categoryColor: 'info',
    icon: <TrendingUp size={24} color="#0284C7" />,
    subtitle: 'Where are our talent shortages and how much budget is needed?',
    description:
      'Predictive headcount requirements across departments and job roles over the next 12 months. Highlights critical skill shortages, quarterly hiring quotas (Q1–Q4), and talent acquisition budgets in ₹ INR.',
    dataPoints: ['Projected Need', 'Net Talent Gaps', 'Quarterly Hiring Schedule', 'Skill Shortages', 'Hiring Budget (₹ INR)'],
    frequency: 'Monthly Cycle',
  },
  {
    id: 'workforce-planning',
    title: 'Strategic Scenario Planning & Budget Simulation',
    category: 'predictive',
    categoryLabel: 'Scenario Engine',
    categoryColor: 'warning',
    icon: <Sliders size={24} color="#D97706" />,
    subtitle: 'What happens under business expansion, hiring freezes, or budget shocks?',
    description:
      'Comprehensive modeling across 7 enterprise business scenarios. Evaluates workforce headcount adjustments, internal transfer matches, required upskilling programs, and financial budget variance in ₹ INR.',
    dataPoints: ['7 Business Scenarios', 'Headcount Variance', 'Internal Mobility Matches', 'Upskilling Linkages', 'Budget Impact (₹ INR)'],
    frequency: 'Quarterly Executive Review',
  },
  {
    id: 'performance',
    title: 'Performance Appraisal & Promotion Readiness Pipeline',
    category: 'talent',
    categoryLabel: 'Appraisal Intelligence',
    categoryColor: 'success',
    icon: <Award size={24} color="#059669" />,
    subtitle: 'Who are our top contributors and algorithmic promotion nominees?',
    description:
      'Aggregated quarterly appraisal evaluations, OKR goal completion percentages, attendance & training behavioral correlations, and automated promotion-ready nominations for leadership review.',
    dataPoints: ['Quarterly Ratings (1-5)', 'Goal Attainment %', 'Behavioral Correlations', 'Promotion Nominees', 'Role Progression'],
    frequency: 'Quarterly Cycle',
  },
  {
    id: 'skill-development',
    title: 'Skill Development & Gap Resolution Tracking',
    category: 'talent',
    categoryLabel: 'Competency L&D',
    categoryColor: 'secondary',
    icon: <BookOpen size={24} color="#7C3AED" />,
    subtitle: 'How effectively are training programs closing enterprise skill gaps?',
    description:
      'Cross-references baseline employee competency assessments with post-training evaluation scores, course completion hours, official certifications awarded, and verified organizational skill gap closures.',
    dataPoints: ['Baseline vs Post-Training', 'Competency Gains', 'Course Progress & Hours', 'Certifications Earned', 'Gap Resolution Rate'],
    frequency: 'Bi-Weekly Refresh',
  },
  {
    id: 'recruitment',
    title: 'Talent Acquisition & Requisition Fulfillment Report',
    category: 'talent',
    categoryLabel: 'Talent Acquisition',
    categoryColor: 'info',
    icon: <Users size={24} color="#0891B2" />,
    subtitle: 'What is our hiring speed, requisition fulfillment, and cost per hire?',
    description:
      'End-to-end recruitment pipeline metrics: active requisitions, applicant funnel conversion rates, average time-to-hire in days, cost per hire in ₹ INR, and performance by sourcing channel.',
    dataPoints: ['Open Requisitions', 'Fulfillment %', 'Time to Hire (Days)', 'Cost per Hire (₹ INR)', 'Sourcing Channels'],
    frequency: 'Monthly Cycle',
  },
];

export const ReportsPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Export Trigger
  const handleExport = async (type: ReportType, format: 'csv' | 'excel' | 'pdf') => {
    const actionKey = `${type}-${format}`;
    try {
      setDownloadingId(actionKey);
      setErrorMessage(null);

      await reportService.downloadReport({
        type,
        format,
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
      });

      const reportConfig = REPORT_CATALOG.find((r) => r.id === type);
      const formatLabel = format === 'pdf' ? 'Printable PDF Summary' : format.toUpperCase();
      setSnackbarMessage(`Successfully exported ${reportConfig?.title || type} (${formatLabel}).`);
    } catch (err: any) {
      console.error('Export generation error:', err);
      setErrorMessage(err.message || 'Failed to generate report export. Please check permissions.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter Catalog
  const filteredReports = REPORT_CATALOG.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.dataPoints.some((dp) => dp.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      activeTab === 'all' ||
      (activeTab === 'predictive' && report.category === 'predictive') ||
      (activeTab === 'talent' && report.category === 'talent');

    return matchesSearch && matchesCategory;
  });

  return (
    <PageShell
      title="Executive Reporting Portal"
      description="Multi-format intelligence export center. Generate and download executive-grade reports across Attrition AI, Demand Forecasting, Scenario Planning, Performance Appraisals, and L&D Competencies."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={16} />}
            onClick={() => {
              setSelectedDept('ALL');
              setSearchTerm('');
              setActiveTab('all');
              setSnackbarMessage('Refreshed executive report catalog.');
            }}
          >
            Reset Filters
          </Button>
        </Stack>
      }
    >
      <Box sx={{ width: '100%', pb: 4 }}>
        {/* 1. Executive Outlined KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    REPORT SUITES
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
                    6 Ready
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active Analytics Pipelines
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                  <FileText size={24} color="#2563EB" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    EXPORT FORMATS
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#10B981" sx={{ mt: 0.5 }}>
                    3 Multi-Tier
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    CSV • Excel (BOM) • PDF
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                  <Download size={24} color="#10B981" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DATA GOVERNANCE
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#7C3AED" sx={{ mt: 0.5 }}>
                    RBAC Scoped
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Department Access Filters
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                  <ShieldCheck size={24} color="#7C3AED" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AUDIT COMPLIANCE
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#F59E0B" sx={{ mt: 0.5 }}>
                    100% Logged
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Immutable Export Tracking
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
                  <History size={24} color="#F59E0B" />
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* 2. Global Filter Controls & Category Tabs */}
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ minHeight: 40 }}
            >
              <Tab label="All Reports (6)" value="all" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Predictive & AI (3)" value="predictive" sx={{ fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Talent & Performance (3)" value="talent" sx={{ fontWeight: 600, textTransform: 'none' }} />
            </Tabs>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
              <TextField
                select
                size="small"
                label="Department Scope"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
                <MenuItem value="Product & Design">Product & Design</MenuItem>
                <MenuItem value="Legal & Compliance">Legal & Compliance</MenuItem>
              </TextField>

              <TextField
                size="small"
                placeholder="Search reports..."
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
            </Stack>
          </Stack>
        </Card>

        {/* 3. Error Alert if any */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* 4. Executive Report Catalog Grid */}
        <Grid container spacing={2.5}>
          {filteredReports.map((report) => (
            <Grid item xs={12} md={6} key={report.id}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  },
                }}
              >
                <Box>
                  {/* Card Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover' }}>{report.icon}</Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {report.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.frequency}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={report.categoryLabel}
                      size="small"
                      color={report.categoryColor}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </Stack>

                  {/* Subtitle / Question */}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ mb: 1, fontStyle: 'italic' }}
                  >
                    "{report.subtitle}"
                  </Typography>

                  {/* Detailed Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {report.description}
                  </Typography>

                  {/* Key Included Fields Chips */}
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>
                      CORE DATA DIMENSIONS:
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {report.dataPoints.map((dp, idx) => (
                        <Chip
                          key={idx}
                          label={dp}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            borderRadius: 1.5,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* Card Action Footer with 3 Multi-Format Export Buttons */}
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="caption" color="text.secondary">
                      Export Format:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      {/* CSV Export */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={
                          downloadingId === `${report.id}-csv` ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <FileSpreadsheet size={15} />
                          )
                        }
                        disabled={downloadingId !== null}
                        onClick={() => handleExport(report.id, 'csv')}
                        sx={{ fontSize: '0.75rem', textTransform: 'none', borderRadius: 1.5 }}
                      >
                        CSV
                      </Button>

                      {/* Excel Export */}
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={
                          downloadingId === `${report.id}-excel` ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <FileSpreadsheet size={15} />
                          )
                        }
                        disabled={downloadingId !== null}
                        onClick={() => handleExport(report.id, 'excel')}
                        sx={{ fontSize: '0.75rem', textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Excel
                      </Button>

                      {/* PDF / Printable HTML */}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          downloadingId === `${report.id}-pdf` ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Printer size={15} />
                          )
                        }
                        disabled={downloadingId !== null}
                        onClick={() => handleExport(report.id, 'pdf')}
                        sx={{ fontSize: '0.75rem', textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Print PDF
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 5. Enterprise Security & Audit Banner */}
        <Card
          variant="outlined"
          sx={{
            p: 2.5,
            mt: 4,
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            borderLeft: '4px solid #2563EB',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
              <Lock size={22} color="#2563EB" />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Enterprise Audit & Compliance Traceability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Every executive report export is cryptographically logged to the central immutable audit ledger with the user's
                identity, IP address, department filter scope, and timestamp to satisfy SOX, GDPR, and ISO 27001 data governance standards.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* 6. Success Feedback Notification */}
        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarMessage(null)}
          message={snackbarMessage}
        />
      </Box>
    </PageShell>
  );
};

export default ReportsPage;
