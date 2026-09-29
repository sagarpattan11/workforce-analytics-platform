import React from 'react';
import { Button, Stack, Typography, Box } from '@mui/material';
import { CreditCard, Download } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const PayrollPage: React.FC = () => {
  return (
    <PageShell
      title="Payroll & Compensation"
      description="Inspect payroll cycles, hourly rates, salary bands, and compensation summaries."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Download size={16} />}
            onClick={() => alert('Payroll summary export connects in Sprint 3.')}
          >
            Export Payroll
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
          <CreditCard size={40} color="#7C3AED" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Payroll Records Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          Salary structures, payslip generation, bonus calculations, and role compensation bands will connect in Sprint 3.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default PayrollPage;
