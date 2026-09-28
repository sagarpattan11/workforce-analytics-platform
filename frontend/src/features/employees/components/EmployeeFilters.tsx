import React, { useState, useEffect, useRef } from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, RotateCcw, X } from 'lucide-react';
import { IDepartment } from '../../../services/employee.service';

export interface EmployeeFiltersState {
  q: string;
  departmentId: string;
  status: string;
  employmentType: string;
  location: string;
}

export interface EmployeeFiltersProps {
  filters: EmployeeFiltersState;
  departments: IDepartment[];
  onFilterChange: (key: keyof EmployeeFiltersState, value: string) => void;
  onResetFilters: () => void;
  loading?: boolean;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  departments,
  onFilterChange,
  onResetFilters,
  loading = false,
}) => {
  // Local state for smooth typing without triggering immediate parent API calls
  const [searchQuery, setSearchQuery] = useState(filters.q);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local query if parent filters change (e.g. on Reset)
  useEffect(() => {
    setSearchQuery(filters.q);
  }, [filters.q]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 500ms debounce: only call API when user stops typing
    debounceTimerRef.current = setTimeout(() => {
      onFilterChange('q', val);
    }, 500);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery('');
    onFilterChange('q', '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onFilterChange('q', searchQuery);
    }
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.departmentId || filters.status || filters.employmentType || filters.location
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        mb: 2.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Left: Search Bar with 500ms Debounce */}
        <TextField
          placeholder="Search by name, ID, email, title..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#64748B" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            minWidth: { xs: '100%', md: 280 },
            flexGrow: { md: 1 },
          }}
        />

        {/* Right: Dropdown Filters & Reset */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems="center"
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          {/* Department Filter */}
          <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="dept-filter-label">Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              id="dept-filter-select"
              value={filters.departmentId}
              label="Department"
              onChange={(e) => onFilterChange('departmentId', e.target.value)}
              disabled={loading}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">
                <em>All Departments</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter-select"
              value={filters.status}
              label="Status"
              onChange={(e) => onFilterChange('status', e.target.value)}
              disabled={loading}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
            </Select>
          </FormControl>

          {/* Employment Type Filter */}
          <FormControl size="small" sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter-select"
              value={filters.employmentType}
              label="Type"
              onChange={(e) => onFilterChange('employmentType', e.target.value)}
              disabled={loading}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              <MenuItem value="Full-time">Full-time</MenuItem>
              <MenuItem value="Part-time">Part-time</MenuItem>
              <MenuItem value="Contract">Contract</MenuItem>
              <MenuItem value="Intern">Intern</MenuItem>
            </Select>
          </FormControl>

          {/* Location Filter */}
          <FormControl size="small" sx={{ minWidth: 150, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="location-filter-label">Location</InputLabel>
            <Select
              labelId="location-filter-label"
              id="location-filter-select"
              value={filters.location}
              label="Location"
              onChange={(e) => onFilterChange('location', e.target.value)}
              disabled={loading}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="">
                <em>All Locations</em>
              </MenuItem>
              <MenuItem value="Office">Office</MenuItem>
              <MenuItem value="Work From Home">Work From Home</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Tooltip title="Reset all filters">
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<RotateCcw size={14} />}
                onClick={onResetFilters}
                sx={{
                  whiteSpace: 'nowrap',
                  borderRadius: 1.5,
                  minWidth: { xs: '100%', sm: 'auto' },
                }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EmployeeFilters;
