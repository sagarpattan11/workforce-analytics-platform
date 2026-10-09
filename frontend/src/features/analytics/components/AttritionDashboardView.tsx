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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Cpu,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  ArrowUpRight,
  User,
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
  LineChart,
  Line,
} from 'recharts';
import attritionService, {
  IAttritionOverviewResponse,
  IExplainabilityResponse,
  IHighRiskEmployee,
  RiskCategory,
} from '../../../services/attrition.service';

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export const AttritionDashboardView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [overview, setOverview] = useState<IAttritionOverviewResponse['data'] | null>(null);
  const [explainability, setExplainability] = useState<IExplainabilityResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<IHighRiskEmployee | null>(null);
  const [explainabilityOpen, setExplainabilityOpen] = useState<boolean>(false);

  // Load Attrition Overview & Model Explainability
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, explainRes] = await Promise.all([
        attritionService.getAttritionOverview(),
        attritionService.getAttritionExplainability(),
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data);
      }
      if (explainRes.success) {
        setExplainability(explainRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load attrition analytics:', err);
      setError(err.message || 'Failed to load attrition prediction analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger batch prediction recalculation
  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await attritionService.recalculatePredictions();
      await fetchData();
    } catch (err: any) {
      console.error('Recalculation error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Running Explainable AI Attrition Scoring Pipeline...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !overview) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchData}>Retry</Button>}>
          {error || 'Unable to render Attrition Risk Dashboard.'}
        </Alert>
      </Box>
    );
  }

  const { summary, categoryDistribution, departmentComparison, riskTrend, highRiskEmployees, mainContributingFactors } = overview;

  // Filter high-risk employees by search term
  const filteredEmployees = highRiskEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Actions Bar */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <BrainCircuit size={28} color="#2563EB" />
            <Typography variant="h5" fontWeight={700}>
              Explainable AI Attrition Risk Dashboard
            </Typography>
            <Chip label={explainability?.modelVersion || 'v2.4-xgboost-explainable'} color="primary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time multi-factor attrition risk scoring, SHAP feature attribution, and predictive HR intervention recommendations.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Cpu size={18} />}
            onClick={() => setExplainabilityOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            SHAP Explainability & Quality
          </Button>
          <Button
            variant="contained"
            startIcon={recalculating ? <CircularProgress size={18} color="inherit" /> : <RefreshCw size={18} />}
            onClick={handleRecalculate}
            disabled={recalculating}
            sx={{ borderRadius: 2 }}
          >
            {recalculating ? 'Scoring...' : 'Recalculate Risk Scores'}
          </Button>
        </Stack>
      </Stack>

      {/* 2. Top Summary KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOTAL EVALUATED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
                  {summary.totalEmployeesEvaluated}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Employee Dataset
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                <User size={22} color="#2563EB" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="error.main" fontWeight={700}>
                  HIGH RISK COUNT
                </Typography>
                <Typography variant="h4" fontWeight={800} color="error.main" sx={{ mt: 0.5 }}>
                  {summary.highRiskCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Requires Urgent HR Action
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                <ShieldAlert size={22} color="#EF4444" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="warning.main" fontWeight={700}>
                  MEDIUM RISK COUNT
                </Typography>
                <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 0.5 }}>
                  {summary.mediumRiskCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monitor 1-on-1 Check-ins
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)' }}>
                <AlertTriangle size={22} color="#F59E0B" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  LOW RISK COUNT
                </Typography>
                <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 0.5 }}>
                  {summary.lowRiskCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Stable & Engaged
                </Typography>
              </Box>
              <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                <ShieldCheck size={22} color="#10B981" />
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
            <Typography variant="caption" color="secondary.main" fontWeight={700}>
              AVG ATTRITION RISK
            </Typography>
            <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mt: 0.5 }}>
              {summary.averageRiskScore}%
            </Typography>
            <LinearProgress variant="determinate" value={summary.averageRiskScore} color="secondary" sx={{ mt: 1.5, height: 6, borderRadius: 3 }} />
          </Card>
        </Grid>
      </Grid>

      {/* 3. Analytics Visualizations Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Risk Category Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Risk Category Distribution
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categoryDistribution.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number, name: string) => [`${val} Employees`, `${name} Risk`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Department Risk Comparison Bar Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Department Risk Score Comparison
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentComparison}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="departmentName" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val: number) => [`${val}%`, 'Avg Risk Score']} />
                  <Bar dataKey="avgRiskScore" fill="#2563EB" radius={[6, 6, 0, 0]} name="Avg Risk Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* 6-Month Risk Trend Curve */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              6-Month Attrition Risk Trend Curve
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgRiskScore" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} name="Avg Risk Score (%)" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Top Contributing Risk Driver Factors */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Main Organizational Risk Drivers
            </Typography>
            <Stack spacing={2}>
              {mainContributingFactors.map((item) => (
                <Box key={item.factor}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.factor}
                    </Typography>
                    <Chip label={`Weight: +${item.avgWeight}`} size="small" color="error" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.min(100, item.impactCount * 20)} color="error" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* 4. High-Risk Employees Action Table */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              High-Risk Employees Needing HR Intervention ({filteredEmployees.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Employees sorted by risk severity with actionable recommended HR intervention strategies.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search by name, ID, position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department & Position</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Risk Score</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Primary Risk Driver</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Recommended HR Action</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Inspect</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {emp.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emp.employeeId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{emp.position}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emp.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={800} color={CATEGORY_COLORS[emp.riskCategory]}>
                      {emp.riskScore}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={emp.riskCategory}
                      size="small"
                      sx={{
                        bgcolor: emp.riskCategory === 'High' ? '#FEE2E2' : '#FEF3C7',
                        color: CATEGORY_COLORS[emp.riskCategory],
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={emp.topFactor} size="small" variant="outlined" color="error" />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" color="text.secondary">
                      {emp.recommendedAction}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" size="small" onClick={() => setSelectedEmployee(emp)}>
                      <ArrowUpRight size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No high-risk employees matching search query.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Single Employee Drilldown Dialog */}
      <Dialog open={Boolean(selectedEmployee)} onClose={() => setSelectedEmployee(null)} maxWidth="sm" fullWidth>
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <User color="#2563EB" />
                <Typography variant="h6" fontWeight={700}>
                  {selectedEmployee.name} ({selectedEmployee.employeeId})
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">POSITION & DEPARTMENT</Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {selectedEmployee.position} - {selectedEmployee.department}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">ATTRITION RISK SCORE</Typography>
                  <Typography variant="h5" fontWeight={800} color={CATEGORY_COLORS[selectedEmployee.riskCategory]}>
                    {selectedEmployee.riskScore}% ({selectedEmployee.riskCategory} Risk)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">PRIMARY RISK DRIVER</Typography>
                  <Alert severity="error" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {selectedEmployee.topFactor}
                  </Alert>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">RECOMMENDED HR ACTION</Typography>
                  <Alert severity="info" sx={{ mt: 0.5 }}>
                    {selectedEmployee.recommendedAction}
                  </Alert>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedEmployee(null)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 5. SHAP Model Quality & Explainability Dialog */}
      <Dialog open={explainabilityOpen} onClose={() => setExplainabilityOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Cpu color="#2563EB" />
            <Typography variant="h6" fontWeight={700}>
              SHAP Explainability & Model Evaluation Metrics
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {explainability && (
            <Stack spacing={3}>
              {/* Quality Metrics Grid */}
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">ACCURACY</Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {explainability.metrics.accuracy}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">PRECISION</Typography>
                    <Typography variant="h6" fontWeight={800} color="success.main">
                      {explainability.metrics.precision}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">RECALL</Typography>
                    <Typography variant="h6" fontWeight={800} color="warning.main">
                      {explainability.metrics.recall}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">F1 SCORE</Typography>
                    <Typography variant="h6" fontWeight={800} color="secondary.main">
                      {explainability.metrics.f1Score}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Confusion Matrix */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Model Confusion Matrix & Drift
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Alert severity="success" icon={<CheckCircle2 />}>
                      True Positives: <strong>{explainability.confusionMatrix.truePositives}</strong> | True Negatives: <strong>{explainability.confusionMatrix.trueNegatives}</strong>
                    </Alert>
                  </Grid>
                  <Grid item xs={6}>
                    <Alert severity="warning" icon={<XCircle />}>
                      False Positives: <strong>{explainability.confusionMatrix.falsePositives}</strong> | False Negatives: <strong>{explainability.confusionMatrix.falseNegatives}</strong>
                    </Alert>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Model Drift: <strong>{explainability.metrics.modelDriftPct}%</strong> (Status: Stable) | Last Evaluated: {new Date(explainability.metrics.lastEvaluatedAt).toLocaleDateString()}
                </Typography>
              </Box>

              {/* SHAP Feature Importance Rankings */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Global SHAP Feature Importance Rankings
                </Typography>
                <Stack spacing={1.5}>
                  {explainability.featureImportanceRanks.map((item, idx) => (
                    <Box key={item.feature}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          #{idx + 1} {item.feature}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="primary">
                          {item.importancePct}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={item.importancePct * 3} sx={{ height: 6, borderRadius: 3, my: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplainabilityOpen(false)} variant="contained">
            Close Panel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttritionDashboardView;
