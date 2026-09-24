import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Avatar,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import {
  Mail,
  Phone,
  Building2,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Award,
} from 'lucide-react';
import { AppModal } from '../../../components/common/AppModal';
import { IEmployee, DepartmentRef, TeamRef } from '../../../services/employee.service';

export interface EmployeeDetailsModalProps {
  open: boolean;
  onClose: () => void;
  employee: IEmployee | null;
  onEdit?: (employee: IEmployee) => void;
}

const getStatusColor = (status: string): 'success' | 'warning' | 'default' | 'error' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'On Leave':
      return 'warning';
    case 'Inactive':
      return 'default';
    case 'Terminated':
      return 'error';
    default:
      return 'default';
  }
};

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  open,
  onClose,
  employee,
  onEdit,
}) => {
  if (!employee) return null;

  const departmentName =
    typeof employee.departmentId === 'object' && employee.departmentId !== null
      ? (employee.departmentId as DepartmentRef).name
      : 'Unassigned';

  const departmentCode =
    typeof employee.departmentId === 'object' && employee.departmentId !== null
      ? (employee.departmentId as DepartmentRef).code
      : '';

  const teamName =
    typeof employee.teamId === 'object' && employee.teamId !== null
      ? (employee.teamId as TeamRef).name
      : 'General';

  const initials = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();

  const formattedHireDate = employee.hireDate
    ? new Date(employee.hireDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const formattedSalary = employee.salary
    ? `$${employee.salary.toLocaleString()} / year`
    : 'Not disclosed';

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Employee Profile"
      subtitle={`Internal ID: ${employee.employeeId}`}
      maxWidth="sm"
      actions={
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" width="100%">
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          {onEdit && (
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
            >
              Edit Details
            </Button>
          )}
        </Stack>
      }
    >
      <Box sx={{ pt: 1, pb: 2 }}>
        {/* Profile Header */}
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                {employee.fullName || `${employee.firstName} ${employee.lastName}`}
              </Typography>
              <Chip
                label={employee.status}
                color={getStatusColor(employee.status)}
                size="small"
                sx={{ fontWeight: 600, height: 22 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {employee.position} &bull; {departmentName}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Detailed Information Grid */}
        <Grid container spacing={2}>
          {/* Email */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Mail size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Work Email
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {employee.email}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Phone size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Phone
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {employee.phone || 'Not provided'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Department */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Building2 size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Department
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {departmentName} {departmentCode && `(${departmentCode})`}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Team */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Users size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Team
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {teamName}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Position & Employment Type */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Briefcase size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Employment Type
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {employee.employmentType}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <MapPin size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Work Location
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {employee.location}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Hire Date */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Calendar size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Hire Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formattedHireDate}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Salary */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <DollarSign size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Compensation
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formattedSalary}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Total Experience */}
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Award size={18} color="#64748B" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Experience
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {employee.yearsOfExperience !== undefined && employee.yearsOfExperience !== null
                    ? `${employee.yearsOfExperience} Years`
                    : 'Not specified'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {employee.createdAt && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Clock size={14} color="#94A3B8" />
              <Typography variant="caption" color="text.secondary">
                Profile created {new Date(employee.createdAt).toLocaleString()}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </AppModal>
  );
};

export default EmployeeDetailsModal;
