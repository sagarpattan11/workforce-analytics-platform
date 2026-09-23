import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Stack,
  Button,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  UserPlus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { DataTableShell, Column } from '../../components/common/DataTableShell';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  employeeService,
  IEmployee,
  IDepartment,
  EmployeeStatus,
  DepartmentRef,
  TeamRef,
} from '../../services/employee.service';
import { EmployeeFilters, EmployeeFiltersState } from './components/EmployeeFilters';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeeDetailsModal } from './components/EmployeeDetailsModal';

const defaultFilters: EmployeeFiltersState = {
  q: '',
  departmentId: '',
  status: '',
  employmentType: '',
  location: '',
};

export const EmployeesPage: React.FC = () => {
  // Data states
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter & Pagination states
  const [filters, setFilters] = useState<EmployeeFiltersState>(defaultFilters);
  const [page, setPage] = useState(0); // 0-indexed for MUI
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy] = useState('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal & Dialog states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<IEmployee | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Status Action Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRowEmployee, setActiveRowEmployee] = useState<IEmployee | null>(null);

  // Debounce search query timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch departments for dropdowns
  useEffect(() => {
    employeeService
      .getDepartments()
      .then((res) => setDepartments(res.data || []))
      .catch((err) => console.error('Failed to load departments:', err));
  }, []);

  // 2. Fetch employees based on active filters and pagination
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeeService.getEmployees({
        page: page + 1, // Convert 0-indexed MUI page to 1-indexed API page
        limit: rowsPerPage,
        q: filters.q.trim() || undefined,
        departmentId: filters.departmentId || undefined,
        status: filters.status || undefined,
        employmentType: filters.employmentType || undefined,
        location: filters.location || undefined,
        sortBy,
        sortOrder,
      });

      setEmployees(response.data || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(
        err.message || 'Unable to connect to employee service. Please check your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, sortBy, sortOrder]);

  // Trigger fetch with debounce for search keyword
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchEmployees]);

  // Handle Filter Change
  const handleFilterChange = (key: keyof EmployeeFiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page whenever filters change
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  // Handle Open Create Modal
  const handleOpenCreateModal = () => {
    setFormMode('create');
    setSelectedEmployee(null);
    setFormModalOpen(true);
  };

  // Handle Open Edit Modal
  const handleOpenEditModal = (emp: IEmployee) => {
    setFormMode('edit');
    setSelectedEmployee(emp);
    setFormModalOpen(true);
  };

  // Handle Open Details Modal
  const handleOpenDetailsModal = (emp: IEmployee) => {
    setViewEmployee(emp);
    setDetailsModalOpen(true);
  };

  // Handle Open Delete Dialog
  const handleOpenDeleteDialog = (emp: IEmployee) => {
    setDeleteTarget(emp);
    setDeleteDialogOpen(true);
  };

  // Execute Soft Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(deleteTarget._id);
      setSuccessMsg(`Employee ${deleteTarget.fullName || deleteTarget.employeeId} was removed successfully.`);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: EmployeeStatus) => {
    if (!activeRowEmployee) return;
    setMenuAnchor(null);
    try {
      await employeeService.updateEmployeeStatus(activeRowEmployee._id, newStatus);
      setSuccessMsg(`Status updated to "${newStatus}" for ${activeRowEmployee.fullName}.`);
      fetchEmployees();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  // Helper for Status Badge Color
  const getStatusChipProps = (status: string) => {
    switch (status) {
      case 'Active':
        return { color: 'success' as const, icon: <CheckCircle2 size={12} /> };
      case 'On Leave':
        return { color: 'warning' as const, icon: <Clock size={12} /> };
      case 'Inactive':
        return { color: 'default' as const, icon: <AlertTriangle size={12} /> };
      case 'Terminated':
        return { color: 'error' as const, icon: <Ban size={12} /> };
      default:
        return { color: 'default' as const };
    }
  };

  // Table Columns Definition
  const columns: Column<IEmployee>[] = [
    {
      id: 'slNo',
      label: 'Sl No',
      minWidth: 70,
      align: 'center',
      render: (_row, index) => (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {page * rowsPerPage + index + 1}
        </Typography>
      ),
    },
    {
      id: 'fullName',
      label: 'Employee',
      minWidth: 220,
      render: (row) => (
        <Box>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              cursor: 'pointer',
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
            onClick={() => handleOpenDetailsModal(row)}
          >
            {row.fullName || `${row.firstName} ${row.lastName}`}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
            <Chip
              label={row.employeeId}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
            />
          </Stack>
        </Box>
      ),
    },
    {
      id: 'departmentId',
      label: 'Department / Team',
      minWidth: 180,
      render: (row) => {
        const dept = typeof row.departmentId === 'object' && row.departmentId !== null
          ? (row.departmentId as DepartmentRef).name
          : 'General';
        const team = typeof row.teamId === 'object' && row.teamId !== null
          ? (row.teamId as TeamRef).name
          : null;

        return (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {dept}
            </Typography>
            {team ? (
              <Typography variant="caption" color="text.secondary">
                {team}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                Unassigned Team
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'position',
      label: 'Position / Role',
      minWidth: 160,
      render: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.position}
        </Typography>
      ),
    },
    {
      id: 'employmentType',
      label: 'Type',
      minWidth: 110,
      render: (row) => (
        <Chip
          label={row.employmentType}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500, fontSize: '0.75rem', height: 22 }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      render: (row) => {
        const { color, icon } = getStatusChipProps(row.status);
        return (
          <Chip
            icon={icon}
            label={row.status}
            color={color}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
          />
        );
      },
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 140,
      render: (row) => {
        const loc = row.location;
        const isWfh = loc === 'Work From Home' || loc === 'Remote';
        const isHybrid = loc === 'Hybrid';

        return (
          <Chip
            label={loc}
            size="small"
            variant="outlined"
            color={isWfh ? 'info' : isHybrid ? 'secondary' : 'default'}
            sx={{ fontWeight: 500, fontSize: '0.75rem', height: 22 }}
          />
        );
      },
    },
    {
      id: 'hireDate',
      label: 'Hire Date',
      minWidth: 120,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.hireDate
            ? new Date(row.hireDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="View Profile">
            <IconButton
              size="small"
              onClick={() => handleOpenDetailsModal(row)}
              aria-label="View profile"
            >
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Details">
            <IconButton
              size="small"
              onClick={() => handleOpenEditModal(row)}
              aria-label="Edit employee"
            >
              <Edit2 size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton
              size="small"
              onClick={(e) => {
                setMenuAnchor(e.currentTarget);
                setActiveRowEmployee(row);
              }}
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <PageShell
      title="Employee Directory"
      description="Manage organization headcount, role assignments, department structures, and employee profiles."
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={`${totalCount} Total Employees`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Tooltip title="Refresh employee list">
            <span>
              <IconButton
                onClick={fetchEmployees}
                size="small"
                disabled={loading}
                aria-label="Refresh list"
              >
                <RefreshCw size={18} />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<UserPlus size={16} />}
            onClick={handleOpenCreateModal}
            sx={{ borderRadius: 1.5 }}
          >
            Add Employee
          </Button>
        </Stack>
      }
    >
      <Box sx={{ width: '100%' }}>
        {/* Success & Error Banners */}
        {successMsg && (
          <Alert
            severity="success"
            onClose={() => setSuccessMsg(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {/* Search & Dropdown Filters */}
        <EmployeeFilters
          filters={filters}
          departments={departments}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          loading={loading}
        />

        {/* Data Table */}
        <DataTableShell<IEmployee>
          columns={columns}
          data={employees}
          loading={loading}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newLimit) => {
            setRowsPerPage(newLimit);
            setPage(0);
          }}
          emptyTitle="No Employees Found"
          emptyDescription="No employee records matched your filter criteria. Try clearing search filters or add a new employee."
        />

        {/* Context Action Menu for Quick Status Change & Delete */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}
        >
          <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 700, fontSize: '0.75rem' }}>
            CHANGE STATUS
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange('Active')}
            disabled={activeRowEmployee?.status === 'Active'}
          >
            <ListItemIcon>
              <CheckCircle2 size={16} color="#16A34A" />
            </ListItemIcon>
            <ListItemText primary="Active" />
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange('On Leave')}
            disabled={activeRowEmployee?.status === 'On Leave'}
          >
            <ListItemIcon>
              <Clock size={16} color="#D97706" />
            </ListItemIcon>
            <ListItemText primary="On Leave" />
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange('Inactive')}
            disabled={activeRowEmployee?.status === 'Inactive'}
          >
            <ListItemIcon>
              <AlertTriangle size={16} color="#64748B" />
            </ListItemIcon>
            <ListItemText primary="Inactive" />
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusChange('Terminated')}
            disabled={activeRowEmployee?.status === 'Terminated'}
          >
            <ListItemIcon>
              <Ban size={16} color="#DC2626" />
            </ListItemIcon>
            <ListItemText primary="Terminated" />
          </MenuItem>
          <MenuItem
            sx={{ color: 'error.main', mt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}
            onClick={() => {
              if (activeRowEmployee) {
                setMenuAnchor(null);
                handleOpenDeleteDialog(activeRowEmployee);
              }
            }}
          >
            <ListItemIcon>
              <Trash2 size={16} color="#DC2626" />
            </ListItemIcon>
            <ListItemText primary="Delete Employee" />
          </MenuItem>
        </Menu>

        {/* Modal: Add / Edit Employee Form */}
        <EmployeeFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          mode={formMode}
          initialData={selectedEmployee}
          departments={departments}
          onSuccess={(_savedEmp, msg) => {
            setSuccessMsg(msg);
            fetchEmployees();
          }}
        />

        {/* Modal: View Employee Details Profile */}
        <EmployeeDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          employee={viewEmployee}
          onEdit={(emp) => handleOpenEditModal(emp)}
        />

        {/* Confirmation Dialog: Soft Delete */}
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Employee Record?"
          message={`Are you sure you want to delete ${deleteTarget?.fullName || deleteTarget?.employeeId}? This employee will be soft-deleted and removed from active directories, but historical audit data will be preserved.`}
          confirmLabel="Delete Employee"
          confirmColor="error"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      </Box>
    </PageShell>
  );
};

export default EmployeesPage;
