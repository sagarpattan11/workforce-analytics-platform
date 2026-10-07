import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Stack,
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
} from '@mui/material';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Award,
  Star,
  TrendingUp,
  BookOpen,
  Building2,
  Sparkles,
  BarChart2,
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
import { LearningAnalyticsData } from '../../../services/learning.service';

interface LearningAnalyticsViewProps {
  data: LearningAnalyticsData | null;
  loading: boolean;
}

export const LearningAnalyticsView: React.FC<LearningAnalyticsViewProps> = ({
  data,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading && !data) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading Learning & Development Analytics...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No learning data found for the selected filter criteria. Try adjusting or resetting filters.
      </Alert>
    );
  }

  const { kpis, statusDistribution, scoreDistribution, breakdowns, recentRecords } = data;

  // 6 Top KPI Cards
  const kpiCards = [
    {
      title: 'Total Enrolments',
      value: kpis.totalEnrolments.toLocaleString(),
      subtext: `${kpis.uniqueLearners} unique learners`,
      icon: <GraduationCap size={22} color="#2563EB" />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.08)',
    },
    {
      title: 'Completion Rate',
      value: `${kpis.completionRate}%`,
      subtext: `${kpis.completedEnrolments} courses completed`,
      icon: <CheckCircle2 size={22} color="#10B981" />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Training Hours',
      value: `${kpis.totalHoursSpent} hrs`,
      subtext: `Avg. ${kpis.avgHoursPerLearner} hrs / learner`,
      icon: <Clock size={22} color="#F59E0B" />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Avg. Test Score',
      value: `${kpis.avgAssessmentScore}%`,
      subtext: `${kpis.passRate}% assessment pass rate`,
      icon: <TrendingUp size={22} color="#6366F1" />,
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.08)',
    },
    {
      title: 'Certifications',
      value: kpis.certificationsEarned.toLocaleString(),
      subtext: 'Verified credentials awarded',
      icon: <Award size={22} color="#8B5CF6" />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
    },
    {
      title: 'Effectiveness',
      value: `${kpis.avgEffectivenessRating} / 5.0`,
      subtext: 'Manager & learner evaluation',
      icon: <Star size={22} color="#EC4899" />,
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.08)',
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
              <Box>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }} noWrap>
                  {card.subtext}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 2. PROGRESS STATUS & ASSESSMENT SCORE TIERS */}
      <Grid container spacing={3}>
        {/* Enrolment Progress & Status Funnel */}
        <Grid item xs={12} md={5}>
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
              justifyContent: 'space-between',
            }}
          >
            <Box mb={2}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <BookOpen size={20} color="#2563EB" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Enrolment & Progress Funnel
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Pipeline distribution of active workforce learning journeys
              </Typography>
            </Box>

            <Stack spacing={2} my="auto">
              {statusDistribution.map((item, idx) => {
                const color =
                  item.status === 'Completed'
                    ? '#10B981'
                    : item.status === 'In Progress'
                    ? '#3B82F6'
                    : item.status === 'Enrolled'
                    ? '#8B5CF6'
                    : '#94A3B8';

                return (
                  <Box key={idx}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                        <Typography variant="body2" fontWeight={600}>
                          {item.status}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({item.percentage}%)
                        </Typography>
                      </Stack>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mt: 3,
                borderRadius: 2,
                bgcolor: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  Completion Efficiency
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="success.main">
                  {kpis.completionRate}% Successful Completion
                </Typography>
              </Box>
              <Chip
                label={`${kpis.completedEnrolments} / ${kpis.totalEnrolments} Finished`}
                size="small"
                color="success"
                sx={{ fontWeight: 600 }}
              />
            </Paper>
          </Card>
        </Grid>

        {/* Assessment Score Tier Distribution */}
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
            <Box mb={2}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <BarChart2 size={20} color="#6366F1" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Assessment Score Distribution
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Learner competency proficiency evaluated post-training
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="tier"
                    tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                    interval={0}
                    angle={isMobile ? -20 : 0}
                    textAnchor={isMobile ? 'end' : 'middle'}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Learners`, 'Count']}
                    labelFormatter={(label) => `Score Tier: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Grid container spacing={1.5} mt={1}>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg. Score
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {kpis.avgAssessmentScore}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Passing Count
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    {kpis.passedAssessments} Passed
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Pass Rate
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="info.main">
                    {kpis.passRate}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Certifications
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="secondary.main">
                    {kpis.certificationsEarned} Earned
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* 3. SEGMENTATIONS: BY DEPARTMENT & BY CATEGORY */}
      <Grid container spacing={3}>
        {/* Department Training Performance */}
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
                  Department Engagement & Completion
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enrolments, completed courses, and average assessment scores by department
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns.byDepartment} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="departmentCode" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [val, name]}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="totalEnrolments" name="Total Enrolled" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Training by Category */}
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
                  Training Category Distribution
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Course enrolments and completion velocity across strategic learning tracks
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdowns.byCategory} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: theme.palette.text.secondary }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: string) => [val, name]}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                  <Bar dataKey="totalEnrolments" name="Enrolments" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed Courses" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 4. TOP TRAINING COURSES LEADERBOARD */}
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
            <Typography variant="subtitle1" fontWeight={700}>
              Top Learning Courses Leaderboard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High-impact courses ranked by employee participation, completion rate, and feedback
            </Typography>
          </Box>
          <Chip label={`${breakdowns.byCourse.length} Active Courses`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        <Grid container spacing={2}>
          {breakdowns.byCourse.map((course) => (
            <Grid item xs={12} sm={6} md={3} key={course.trainingId}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip label={course.category} size="small" color="primary" sx={{ fontSize: '0.7rem', height: 20 }} />
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <Typography variant="caption" fontWeight={700}>
                        {course.avgRating ? course.avgRating.toFixed(1) : '4.8'}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                    {course.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {course.provider} &bull; {course.durationHours} hrs
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {course.completed}/{course.enrolments} Finished
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="success.main">
                      {course.completionRate}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={course.completionRate}
                    color={course.completionRate >= 80 ? 'success' : 'primary'}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 5. ACTIVE LEARNING DIRECTORY TABLE */}
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
                Live Learning & Certification Directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Recent employee course progress, assessment test scores, and earned credentials
              </Typography>
            </Box>
            <Chip
              label={`${recentRecords.length} Enrolment Records`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        <TableContainer sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>EMPLOYEE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>COURSE / TRAINING</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>TARGET SKILL</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>PROGRESS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>SCORE</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>HOURS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CERTIFICATION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentRecords.map((record) => {
                const empName = record.employeeId
                  ? `${record.employeeId.firstName} ${record.employeeId.lastName}`
                  : 'Employee';
                const empEmail = record.employeeId ? record.employeeId.email : '';
                const courseTitle = record.trainingId ? record.trainingId.title : 'Course';
                const skillName = record.targetSkillId ? record.targetSkillId.name : 'General';
                const deptCode = record.departmentId ? record.departmentId.code : 'GEN';

                return (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {empName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {empEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {courseTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={skillName} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" fontWeight={600}>
                        {deptCode}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600}>
                          {record.progressPct}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={record.progressPct}
                          color={record.status === 'Completed' ? 'success' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {record.assessmentScore !== undefined && record.assessmentScore !== null ? (
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={record.assessmentScore >= 75 ? 'success.main' : 'warning.main'}
                        >
                          {record.assessmentScore}%
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{record.hoursSpent} hrs</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        color={
                          record.status === 'Completed'
                            ? 'success'
                            : record.status === 'In Progress'
                            ? 'primary'
                            : record.status === 'Enrolled'
                            ? 'info'
                            : 'default'
                        }
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {record.certificationEarned ? (
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
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};
