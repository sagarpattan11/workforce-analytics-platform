import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { BarChart3, Filter, Download } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const AnalyticsPage: React.FC = () => {
  return (
    <PageShell
      title="Skill & Workforce Analytics"
      description="Analyze skill distribution, required versus available competencies, and departmental skill gaps."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Filter size={16} />}
            onClick={() => alert('Department filters will activate in Sprint 1.')}
          >
            Filter Department
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Skill gap report export connects in Sprint 1.')}
          >
            Export Matrix
          </Button>
        </Stack>
      }
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 2,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            mb: 2,
          }}
        >
          <BarChart3 size={40} color="#7C3AED" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Skill Analytics Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Skill matrices, gap evaluations, top/missing skill distribution, and automated training recommendations will render here upon database connection.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default AnalyticsPage;
