import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Skeleton,
  Box,
} from '@mui/material';
import { EmptyState } from '../feedback/EmptyState';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableShellProps<T> {
  columns: Column<T>[];
  data?: T[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTableShell<T extends Record<string, unknown>>({
  columns,
  data = [],
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  emptyTitle = 'No Records Found',
  emptyDescription = 'There are no records matching your criteria.',
}: DataTableShellProps<T>) {
  return (
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader aria-label="workforce data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth, fontWeight: 600 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`}>
                      <Skeleton variant="text" height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={`row-${rowIndex}`}>
                  {columns.map((column) => {
                    const value = row[column.id as string];
                    return (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {column.render ? column.render(row, rowIndex) : (value as React.ReactNode)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalCount > 0 && onPageChange && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
          />
        </Box>
      )}
    </Paper>
  );
}

export default DataTableShell;
