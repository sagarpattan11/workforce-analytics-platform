import React, { useState } from 'react';
import { Button, Stack, TextField, InputAdornment, Typography, Box } from '@mui/material';
import { Search, UserPlus, Filter, Users } from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';

export const EmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PageShell
      title="Employee Directory"
      description="Manage organization headcount, role assignments, and employee profiles."
      actions={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
          <TextField
            placeholder="Search by name, role, or ID..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<Filter size={16} />}
            onClick={() => alert('Advanced filters will activate when database is connected.')}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<UserPlus size={16} />}
            onClick={() => alert('Employee onboarding modal will connect in Sprint 1.')}
          >
            Add Employee
          </Button>
        </Stack>
      }
    >
      {/* Clean Employee Directory Placeholder Shell */}
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
          <Users size={40} color="#1D4ED8" />
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Employee Directory Shell
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto">
          The employee table with sorting, pagination, and multi-parameter filters will render here once the backend employee APIs and database models are connected.
        </Typography>
      </Box>
    </PageShell>
  );
};

export default EmployeesPage;
