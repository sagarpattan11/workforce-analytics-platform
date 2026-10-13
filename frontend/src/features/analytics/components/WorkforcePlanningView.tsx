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
  MenuItem,
  Slider,
  Divider,
} from '@mui/material';
import {
  Sliders,
  TrendingUp,
  AlertTriangle,
  Building2,
  Sparkles,
  Clock,
  BrainCircuit,
  IndianRupee,
  Users,
  ArrowRight,
  GraduationCap,
  Briefcase,
  History,
  CheckCircle2,
  LucideIcon,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import planningService, {
  WorkforceScenarioType,
  IWorkforcePlan,
  IScenarioCatalogItem,
} from '../../../services/planning.service';

// Currency formatter for Indian Rupees (₹ INR)
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Scenario metadata with icons and badge colors
const SCENARIO_META: Record<
  WorkforceScenarioType,
  { icon: LucideIcon; color: string }
> = {
  'Business Growth': { icon: TrendingUp, color: '#2563EB' },
  'High Attrition': { icon: AlertTriangle, color: '#EF4444' },
  'Department Expansion': { icon: Building2, color: '#7C3AED' },
  'New Projects': { icon: Sparkles, color: '#F59E0B' },
  'Hiring Freeze': { icon: Clock, color: '#6B7280' },
  'Skill Shortages': { icon: BrainCircuit, color: '#EC4899' },
  'Budget Reduction': { icon: IndianRupee, color: '#10B981' },
};

const PIE_COLORS = ['#2563EB', '#7C3AED', '#EC4899', '#10B981'];

export const WorkforcePlanningView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [catalog, setCatalog] = useState<IScenarioCatalogItem[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<WorkforceScenarioType>('Business Growth');
  const [currentPlan, setCurrentPlan] = useState<IWorkforcePlan | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<IWorkforcePlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simulation Parameters State
  const [growthRate, setGrowthRate] = useState<number>(15);
  const [attritionMultiplier, setAttritionMultiplier] = useState<number>(1.5);
  const [targetDepartment, setTargetDepartment] = useState<string>('Engineering');
  const [newProjectsCount, setNewProjectsCount] = useState<number>(4);
  const [budgetCapINR, setBudgetCapINR] = useState<number>(5000000);
  const [freezeDurationMonths, setFreezeDurationMonths] = useState<number>(6);

  // Initial Load: Fetch Catalog and Saved Scenarios
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [catRes, savedRes] = await Promise.all([
        planningService.getScenarioCatalog(),
        planningService.getSavedScenarios(),
      ]);

      setCatalog(catRes);
      setSavedScenarios(savedRes);

      if (savedRes.length > 0) {
        setCurrentPlan(savedRes[0]);
        setSelectedScenario(savedRes[0].scenarioName);
      } else {
        // Run default simulation if none exists
        const plan = await planningService.simulateScenario({
          scenarioName: 'Business Growth',
          title: 'Q3 Enterprise Expansion Plan',
          description: 'Simulating 15% headcount growth for key operating units',
          parameters: { growthRatePercent: 15, targetDepartment: 'Engineering' },
        });
        setCurrentPlan(plan);
      }
    } catch (err: any) {
      console.error('Failed to load workforce planning data:', err);
      setError(err.message || 'Failed to initialize workforce scenario engine.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Execute Simulation
  const handleRunSimulation = async () => {
    try {
      setSimulating(true);
      setError(null);

      const params: Record<string, any> = {};
      if (selectedScenario === 'Business Growth') params.growthRatePercent = growthRate;
      if (selectedScenario === 'High Attrition') params.attritionMultiplier = attritionMultiplier;
      if (selectedScenario === 'Department Expansion') {
        params.targetDepartment = targetDepartment;
        params.growthRatePercent = growthRate;
      }
      if (selectedScenario === 'New Projects') params.newProjectsCount = newProjectsCount;
      if (selectedScenario === 'Hiring Freeze') params.freezeDurationMonths = freezeDurationMonths;
      if (selectedScenario === 'Budget Reduction') params.budgetCapINR = budgetCapINR;

      const result = await planningService.simulateScenario({
        scenarioName: selectedScenario,
        title: `${selectedScenario} Strategic Simulation`,
        description: `Simulated impact on headcount, skill matrix, and budget in INR.`,
        parameters: params,
      });

      setCurrentPlan(result);

      // Refresh saved scenarios list
      const updatedSaved = await planningService.getSavedScenarios();
      setSavedScenarios(updatedSaved);
    } catch (err: any) {
      console.error('Error running scenario simulation:', err);
      setError(err.message || 'Failed to execute scenario simulation.');
    } finally {
      setSimulating(false);
    }
  };

  // Handle Scenario Card Selection with instant plan loading or simulation
  const handleScenarioSelect = async (scenarioName: WorkforceScenarioType) => {
    setSelectedScenario(scenarioName);

    // If a saved plan for this scenario exists, load it immediately
    const existing = savedScenarios.find((p) => p.scenarioName === scenarioName);
    if (existing) {
      setCurrentPlan(existing);
      return;
    }

    // Otherwise auto-run simulation with default parameters for this scenario
    try {
      setSimulating(true);
      const params: Record<string, any> = {};
      if (scenarioName === 'Business Growth') params.growthRatePercent = growthRate;
      if (scenarioName === 'High Attrition') params.attritionMultiplier = attritionMultiplier;
      if (scenarioName === 'Department Expansion') {
        params.targetDepartment = targetDepartment;
        params.growthRatePercent = growthRate;
      }
      if (scenarioName === 'New Projects') params.newProjectsCount = newProjectsCount;
      if (scenarioName === 'Hiring Freeze') params.freezeDurationMonths = freezeDurationMonths;
      if (scenarioName === 'Budget Reduction') params.budgetCapINR = budgetCapINR;

      const result = await planningService.simulateScenario({
        scenarioName,
        title: `${scenarioName} Strategic Simulation`,
        description: `Simulated impact on headcount, skill matrix, and budget in INR.`,
        parameters: params,
      });

      setCurrentPlan(result);
      const updatedSaved = await planningService.getSavedScenarios();
      setSavedScenarios(updatedSaved);
    } catch (err: any) {
      console.error('Error auto-simulating scenario:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            Initializing Strategic Workforce Planning Simulator...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const impact = currentPlan?.simulatedImpact;

  // Prepare Chart Data
  const headcountChartData = impact
    ? [
        {
          metric: 'Headcount',
          'Current Workforce': impact.currentTotalHeadcount,
          'Projected Required': impact.projectedRequiredHeadcount,
          'Net Gap': impact.netHeadcountGap,
        },
      ]
    : [];

  const financialPieData = impact
    ? [
        { name: 'Recruitment Cost', value: impact.financialImpact.additionalRecruitmentCostINR },
        { name: 'Salary Cost', value: impact.financialImpact.additionalSalaryCostINR },
        { name: 'Upskilling Cost', value: impact.financialImpact.trainingAndUpskillingCostINR },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Overview */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Sliders size={28} color="#2563EB" />
            <Typography variant="h5" fontWeight={700}>
              Strategic Workforce Planning & Simulation
            </Typography>
            <Chip
              label="7-Scenario Engine"
              color="primary"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Simulate business scenarios, project headcount requirements, evaluate internal transfers, and model budget impact in ₹ INR.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={simulating ? <CircularProgress size={16} color="inherit" /> : <Sparkles size={18} />}
          disabled={simulating}
          onClick={handleRunSimulation}
          sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
        >
          {simulating ? 'Simulating Impact...' : 'Run Simulation'}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 2. The 7 Scenario Selection Cards */}
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, letterSpacing: 0.5 }}>
        SELECT BUSINESS SCENARIO TO MODEL
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {(catalog.length > 0
          ? catalog
          : (Object.keys(SCENARIO_META) as WorkforceScenarioType[]).map((name) => ({
              name,
              label: name,
              description: '',
              defaultParameters: {},
            }))
        ).map((item) => {
          const isSelected = selectedScenario === item.name;
          const meta = SCENARIO_META[item.name as WorkforceScenarioType] || {
            icon: Sliders,
            color: '#2563EB',
          };
          const IconComp = meta.icon;

          return (
            <Grid item xs={12} sm={6} md={3} lg={1.71} key={item.name}>
              <Card
                variant="outlined"
                onClick={() => handleScenarioSelect(item.name as WorkforceScenarioType)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 2,
                  borderColor: isSelected ? meta.color : 'divider',
                  bgcolor: isSelected ? `${meta.color}0D` : 'background.paper',
                  borderWidth: isSelected ? 2 : 1,
                  transition: 'all 0.2s ease-in-out',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    borderColor: meta.color,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  },
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: `${meta.color}1A`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp size={20} color={meta.color} />
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: isSelected ? meta.color : 'text.primary' }}>
                    {item.label}
                  </Typography>
                </Stack>
                {isSelected && (
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      mt: 1.5,
                      alignSelf: 'flex-start',
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: meta.color,
                      color: '#FFF',
                    }}
                  />
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 3. Interactive Scenario Parameters Control Panel */}
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          Configure Scenario Parameters: {selectedScenario}
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* Growth Rate Parameter */}
          {(selectedScenario === 'Business Growth' || selectedScenario === 'Department Expansion') && (
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                GROWTH RATE: {growthRate}%
              </Typography>
              <Slider
                value={growthRate}
                min={5}
                max={50}
                step={5}
                onChange={(_, val) => setGrowthRate(val as number)}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
          )}

          {/* Attrition Multiplier Parameter */}
          {selectedScenario === 'High Attrition' && (
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                TURNOVER MULTIPLIER: {attritionMultiplier}x
              </Typography>
              <Slider
                value={attritionMultiplier}
                min={1.1}
                max={2.5}
                step={0.1}
                onChange={(_, val) => setAttritionMultiplier(val as number)}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
          )}

          {/* Target Department */}
          {(selectedScenario === 'Department Expansion' || selectedScenario === 'Business Growth') && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Target Department"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
              >
                {['Engineering', 'Product', 'Operations', 'Marketing', 'Sales', 'HR', 'Finance'].map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* New Projects Count */}
          {selectedScenario === 'New Projects' && (
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                UPCOMING CLIENT PROJECTS: {newProjectsCount}
              </Typography>
              <Slider
                value={newProjectsCount}
                min={1}
                max={10}
                step={1}
                onChange={(_, val) => setNewProjectsCount(val as number)}
                valueLabelDisplay="auto"
                sx={{ mt: 1 }}
              />
            </Grid>
          )}

          {/* Freeze Duration */}
          {selectedScenario === 'Hiring Freeze' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Hiring Freeze Duration"
                value={freezeDurationMonths}
                onChange={(e) => setFreezeDurationMonths(Number(e.target.value))}
              >
                <MenuItem value={3}>3 Months (Quarterly Freeze)</MenuItem>
                <MenuItem value={6}>6 Months (Half-Year Freeze)</MenuItem>
                <MenuItem value={12}>12 Months (Full-Year Freeze)</MenuItem>
              </TextField>
            </Grid>
          )}

          {/* Budget Cap */}
          {selectedScenario === 'Budget Reduction' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Total Budget Cap (₹ INR)"
                value={budgetCapINR}
                onChange={(e) => setBudgetCapINR(Number(e.target.value))}
              >
                <MenuItem value={2500000}>₹25,00,000 (₹25 Lakhs)</MenuItem>
                <MenuItem value={5000000}>₹50,00,000 (₹50 Lakhs)</MenuItem>
                <MenuItem value={10000000}>₹1,00,00,000 (₹1 Crore)</MenuItem>
              </TextField>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<Sparkles size={16} />}
                onClick={handleRunSimulation}
                disabled={simulating}
                sx={{ borderRadius: 2 }}
              >
                Re-Simulate
              </Button>
              <Typography variant="caption" color="text.secondary">
                Calculates real headcount gap & ₹ budget impact
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* 4. Top KPI Metric Cards (Outlined, No Colored Borders) */}
      {impact && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Current Headcount */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    CURRENT HEADCOUNT
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#2563EB" sx={{ mt: 0.5 }}>
                    {impact.currentTotalHeadcount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Non-Deleted Workforce
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(37, 99, 235, 0.1)' }}>
                  <Users size={22} color="#2563EB" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Projected Headcount */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PROJECTED HEADCOUNT
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#7C3AED" sx={{ mt: 0.5 }}>
                    {impact.projectedRequiredHeadcount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target Workforce Capacity
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(124, 58, 237, 0.1)' }}>
                  <TrendingUp size={22} color="#7C3AED" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Net Headcount Gap */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    NET HEADCOUNT GAP
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color={impact.netHeadcountGap > 0 ? '#EF4444' : impact.netHeadcountGap < 0 ? '#10B981' : '#6B7280'}
                    >
                      {impact.netHeadcountGap > 0 ? `+${impact.netHeadcountGap}` : impact.netHeadcountGap}
                    </Typography>
                    <Chip
                      label={
                        impact.netHeadcountGap > 0
                          ? 'Shortage'
                          : impact.netHeadcountGap < 0
                          ? 'Surplus'
                          : 'Balanced'
                      }
                      size="small"
                      color={impact.netHeadcountGap > 0 ? 'error' : impact.netHeadcountGap < 0 ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Hiring or Reallocation Delta
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor:
                      impact.netHeadcountGap > 0
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <AlertTriangle
                    size={22}
                    color={impact.netHeadcountGap > 0 ? '#EF4444' : '#10B981'}
                  />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Total Budget Impact */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL BUDGET IMPACT (₹)
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="#10B981" sx={{ mt: 0.5 }}>
                    {formatINR(impact.financialImpact.totalBudgetImpactINR)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recruitment + Salary + Training
                  </Typography>
                </Box>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                  <IndianRupee size={22} color="#10B981" />
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 5. Visual Charts: Headcount Delta & Financial Breakdown */}
      {impact && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Headcount Capacity Comparison */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Workforce Capacity Comparison
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Current vs. Simulated Headcount Requirements for {selectedScenario}
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headcountChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Current Workforce" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Projected Required" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Net Gap" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Financial Budget Composition in ₹ INR */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                Scenario Budget Distribution (₹ INR)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Breakdown of additional recruitment, salary, and training expenditures
              </Typography>

              {financialPieData.length > 0 ? (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {financialPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatINR(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No incremental costs for this scenario (Optimal / Cost Neutral).
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 6. Hiring Requirements Generated */}
      {impact && impact.hiringRequirements.length > 0 && (
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Briefcase size={20} color="#2563EB" />
            <Typography variant="subtitle1" fontWeight={700}>
              Scenario Hiring Requirements & Requisitions
            </Typography>
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Position Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Positions Needed
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Est. Cost per Hire (₹)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Total Hiring Cost (₹)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Priority
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {impact.hiringRequirements.map((req, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{req.role}</TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell align="center">
                      <Chip label={`+${req.headcountNeeded}`} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{formatINR(req.estimatedCostPerHireINR)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#10B981' }}>
                      {formatINR(req.headcountNeeded * req.estimatedCostPerHireINR)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={req.priority}
                        size="small"
                        color={
                          req.priority === 'Critical'
                            ? 'error'
                            : req.priority === 'High'
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* 7. Internal Talent Mobility & Cross-Department Transfers */}
      {impact && impact.internalTransfers.length > 0 && (
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <Users size={20} color="#7C3AED" />
            <Typography variant="subtitle1" fontWeight={700}>
              Internal Talent Mobility & Smart Re-Deployment Recommendations
            </Typography>
            <Chip label="Zero External Hiring Cost" size="small" color="success" variant="outlined" />
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Current Assignment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Recommended Re-Deployment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Skill Match Score
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {impact.internalTransfers.map((trans, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{trans.employeeName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{trans.currentRole}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trans.sourceDepartment}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ArrowRight size={14} color="#7C3AED" />
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="#7C3AED">
                            {trans.targetRole}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trans.targetDepartment}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${trans.skillMatchScorePercent}% Match`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                        Initiate Transfer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* 8. Upskilling Needs & Training Linkage */}
      {impact && impact.upskillingNeeds.length > 0 && (
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <GraduationCap size={20} color="#EC4899" />
            <Typography variant="subtitle1" fontWeight={700}>
              Targeted Upskilling & Training Interventions
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {impact.upskillingNeeds.map((need, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#EC4899">
                    {need.skillName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Target Department: {need.targetDepartment}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Recommended Course:
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {need.trainingName}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Target Trainees:
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="primary">
                      {need.employeeCount} Employees
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Estimated Cost:
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#10B981">
                      {formatINR(need.estimatedCostINR)}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* 9. Saved Scenarios History */}
      {savedScenarios.length > 0 && (
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <History size={20} color="#6B7280" />
            <Typography variant="subtitle1" fontWeight={700}>
              Scenario Simulation History & Log
            </Typography>
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Scenario Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Simulation Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Current Headcount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Net Gap
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Budget Impact (₹)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Simulated On
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedScenarios.slice(0, 5).map((plan) => (
                  <TableRow key={plan._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{plan.scenarioName}</TableCell>
                    <TableCell>{plan.title}</TableCell>
                    <TableCell align="center">{plan.simulatedImpact?.currentTotalHeadcount || 33}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          (plan.simulatedImpact?.netHeadcountGap || 0) > 0
                            ? `+${plan.simulatedImpact.netHeadcountGap}`
                            : plan.simulatedImpact?.netHeadcountGap || 0
                        }
                        size="small"
                        color={
                          (plan.simulatedImpact?.netHeadcountGap || 0) > 0
                            ? 'error'
                            : (plan.simulatedImpact?.netHeadcountGap || 0) < 0
                            ? 'success'
                            : 'default'
                        }
                        sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#10B981' }}>
                      {formatINR(plan.simulatedImpact?.financialImpact?.totalBudgetImpactINR || 0)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<CheckCircle2 size={12} />}
                        label={plan.status}
                        color="success"
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" color="text.secondary">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setCurrentPlan(plan);
                          setSelectedScenario(plan.scenarioName);
                        }}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                      >
                        Load Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default WorkforcePlanningView;
