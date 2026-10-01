import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  FormHelperText,
} from '@mui/material';
import { AppModal } from '../../../components/common/AppModal';
import {
  employeeService,
  IEmployee,
  IDepartment,
  ITeam,
  EmploymentType,
  EmployeeStatus,
  DepartmentRef,
  TeamRef,
} from '../../../services/employee.service';

export interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: IEmployee | null;
  departments: IDepartment[];
  onSuccess: (savedEmployee: IEmployee, message: string) => void;
}

interface FormState {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  teamId: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  location: string;
  hireDate: string;
  yearsOfExperience: string;
  salary: string;
}

const WORK_LOCATION_OPTIONS = ['Office', 'Work From Home', 'Hybrid'];

const defaultFormState: FormState = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  teamId: '',
  position: '',
  employmentType: 'Full-time',
  status: 'Active',
  location: 'Office',
  hireDate: new Date().toISOString().split('T')[0],
  yearsOfExperience: '',
  salary: '',
};

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onClose,
  mode,
  initialData,
  departments,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormState>(defaultFormState);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Reset or initialize form when opened or initialData changes
  useEffect(() => {
    if (open) {
      setFormError(null);
      setFieldErrors({});

      if (mode === 'edit' && initialData) {
        const deptId =
          typeof initialData.departmentId === 'object' && initialData.departmentId !== null
            ? (initialData.departmentId as DepartmentRef)._id
            : (initialData.departmentId as string) || '';

        const tmId =
          typeof initialData.teamId === 'object' && initialData.teamId !== null
            ? (initialData.teamId as TeamRef)._id
            : (initialData.teamId as string) || '';

        const dateStr = initialData.hireDate
          ? new Date(initialData.hireDate).toISOString().split('T')[0]
          : '';

        setFormData({
          employeeId: initialData.employeeId || '',
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          departmentId: deptId,
          teamId: tmId,
          position: initialData.position || '',
          employmentType: initialData.employmentType || 'Full-time',
          status: initialData.status || 'Active',
          location: initialData.location || '',
          hireDate: dateStr,
          yearsOfExperience:
            initialData.yearsOfExperience !== undefined ? String(initialData.yearsOfExperience) : '',
          salary: initialData.salary ? String(initialData.salary) : '',
        });

        if (deptId) {
          fetchTeams(deptId);
        }
      } else {
        setFormData(defaultFormState);
        setTeams([]);
      }
    }
  }, [open, mode, initialData]);

  // Fetch teams whenever departmentId changes
  const fetchTeams = async (departmentId: string) => {
    if (!departmentId) {
      setTeams([]);
      return;
    }
    setLoadingTeams(true);
    try {
      const res = await employeeService.getTeams(departmentId);
      setTeams(res.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    setFormData((prev) => ({ ...prev, departmentId, teamId: '' }));
    fetchTeams(departmentId);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'create') {
      if (!formData.employeeId.trim()) {
        errors.employeeId = 'Employee ID is required (e.g., EMP-1001)';
      } else if (formData.employeeId.trim().length < 3) {
        errors.employeeId = 'Employee ID must be at least 3 characters';
      }
    }

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!formData.departmentId) errors.departmentId = 'Department is required';
    if (!formData.position.trim()) errors.position = 'Position / Job title is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.hireDate) errors.hireDate = 'Hire date is required';

    if (
      formData.yearsOfExperience &&
      (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0)
    ) {
      errors.yearsOfExperience = 'Years of experience must be a non-negative number';
    }

    if (formData.salary && (isNaN(Number(formData.salary)) || Number(formData.salary) < 0)) {
      errors.salary = 'Salary must be a valid positive number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const payload = {
          employeeId: formData.employeeId.trim().toUpperCase(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          departmentId: formData.departmentId,
          teamId: formData.teamId || null,
          position: formData.position.trim(),
          employmentType: formData.employmentType,
          status: formData.status,
          location: formData.location.trim(),
          hireDate: formData.hireDate,
          yearsOfExperience: formData.yearsOfExperience !== '' ? Number(formData.yearsOfExperience) : undefined,
          salary: formData.salary ? Number(formData.salary) : undefined,
        };

        const res = await employeeService.createEmployee(payload);
        onSuccess(res.data, res.message || 'Employee created successfully');
        onClose();
      } else if (mode === 'edit' && initialData) {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          departmentId: formData.departmentId,
          teamId: formData.teamId || null,
          position: formData.position.trim(),
          employmentType: formData.employmentType,
          status: formData.status,
          location: formData.location.trim(),
          hireDate: formData.hireDate,
          yearsOfExperience: formData.yearsOfExperience !== '' ? Number(formData.yearsOfExperience) : undefined,
          salary: formData.salary ? Number(formData.salary) : undefined,
        };

        const res = await employeeService.updateEmployee(initialData._id, payload);
        onSuccess(res.data, res.message || 'Employee updated successfully');
        onClose();
      }
    } catch (err: any) {
      console.error('Error saving employee:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to save employee. Please check inputs and try again.';
      setFormError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={mode === 'create' ? 'Add New Employee' : 'Edit Employee Details'}
      subtitle={
        mode === 'create'
          ? 'Enter organization records, team assignment, and profile data.'
          : `Editing ${initialData?.fullName || initialData?.employeeId || 'employee'}`
      }
      maxWidth="md"
      actions={
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" width="100%">
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Employee' : 'Save Changes'}
          </Button>
        </Stack>
      }
    >
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ pt: 1 }}>
        {formError && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {formError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Employee ID */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Employee ID"
              size="small"
              fullWidth
              required
              disabled={mode === 'edit' || submitting}
              placeholder="e.g. EMP-9001"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, employeeId: e.target.value.toUpperCase() }))
              }
              error={Boolean(fieldErrors.employeeId)}
              helperText={fieldErrors.employeeId || 'Unique workforce identifier'}
            />
          </Grid>

          {/* First Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="First Name"
              size="small"
              fullWidth
              required
              disabled={submitting}
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              error={Boolean(fieldErrors.firstName)}
              helperText={fieldErrors.firstName}
            />
          </Grid>

          {/* Last Name */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Last Name"
              size="small"
              fullWidth
              required
              disabled={submitting}
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              error={Boolean(fieldErrors.lastName)}
              helperText={fieldErrors.lastName}
            />
          </Grid>

          {/* Work Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Work Email"
              type="email"
              size="small"
              fullWidth
              required
              disabled={submitting}
              placeholder="name@workforce.internal"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number"
              size="small"
              fullWidth
              disabled={submitting}
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </Grid>

          {/* Department */}
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth required error={Boolean(fieldErrors.departmentId)}>
              <InputLabel id="form-dept-label">Department</InputLabel>
              <Select
                labelId="form-dept-label"
                value={formData.departmentId}
                label="Department"
                disabled={submitting}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.departmentId && (
                <FormHelperText>{fieldErrors.departmentId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Team (Filtered by Department) */}
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth>
              <InputLabel id="form-team-label">
                {loadingTeams ? 'Loading Teams...' : 'Team (Optional)'}
              </InputLabel>
              <Select
                labelId="form-team-label"
                value={formData.teamId}
                label={loadingTeams ? 'Loading Teams...' : 'Team (Optional)'}
                disabled={submitting || !formData.departmentId || loadingTeams}
                onChange={(e) => setFormData((prev) => ({ ...prev, teamId: e.target.value }))}
              >
                <MenuItem value="">
                  <em>None (Department General)</em>
                </MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team._id} value={team._id}>
                    {team.name} ({team.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Position / Title */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Position / Job Title"
              size="small"
              fullWidth
              required
              disabled={submitting}
              placeholder="e.g. Lead Software Architect"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              error={Boolean(fieldErrors.position)}
              helperText={fieldErrors.position}
            />
          </Grid>

          {/* Work Location Dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth required error={Boolean(fieldErrors.location)}>
              <InputLabel id="form-location-label">Work Location</InputLabel>
              <Select
                labelId="form-location-label"
                value={formData.location}
                label="Work Location"
                disabled={submitting}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              >
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Work From Home">Work From Home</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
                {formData.location &&
                  !WORK_LOCATION_OPTIONS.includes(formData.location) && (
                    <MenuItem value={formData.location}>
                      {formData.location} (Current)
                    </MenuItem>
                  )}
              </Select>
              {fieldErrors.location && (
                <FormHelperText>{fieldErrors.location}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Employment Type */}
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="form-type-label">Employment Type</InputLabel>
              <Select
                labelId="form-type-label"
                value={formData.employmentType}
                label="Employment Type"
                disabled={submitting}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employmentType: e.target.value as EmploymentType,
                  }))
                }
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Intern">Intern</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="form-status-label">Status</InputLabel>
              <Select
                labelId="form-status-label"
                value={formData.status}
                label="Status"
                disabled={submitting}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value as EmployeeStatus }))
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Hire Date */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Hire Date"
              type="date"
              size="small"
              fullWidth
              required
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
              value={formData.hireDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, hireDate: e.target.value }))}
              error={Boolean(fieldErrors.hireDate)}
              helperText={fieldErrors.hireDate}
            />
          </Grid>

          {/* Years of Experience */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Years of Experience"
              type="number"
              size="small"
              fullWidth
              disabled={submitting}
              placeholder="e.g. 5"
              inputProps={{ min: 0, step: 0.5 }}
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
              error={Boolean(fieldErrors.yearsOfExperience)}
              helperText={fieldErrors.yearsOfExperience || 'Total professional experience (years)'}
            />
          </Grid>

          {/* Annual Salary */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Annual Salary (₹ INR)"
              type="number"
              size="small"
              fullWidth
              disabled={submitting}
              placeholder="e.g. 1350000"
              value={formData.salary}
              onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
              error={Boolean(fieldErrors.salary)}
              helperText={fieldErrors.salary || 'Base compensation in INR (optional)'}
            />
          </Grid>
        </Grid>
      </Box>
    </AppModal>
  );
};

export default EmployeeFormModal;
