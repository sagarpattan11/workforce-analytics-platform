import { apiClient } from '../api/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';

export interface DepartmentRef {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface TeamRef {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

export interface IEmployee extends Record<string, unknown> {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: DepartmentRef | string;
  teamId?: TeamRef | string | null;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  location: string;
  hireDate: string;
  yearsOfExperience?: number;
  salary?: number;
  avatarUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface ITeam {
  _id: string;
  name: string;
  code: string;
  departmentId: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface EmployeeQueryFilters {
  page?: number;
  limit?: number;
  q?: string;
  departmentId?: string;
  teamId?: string;
  status?: string;
  employmentType?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isDeleted?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedEmployeesResponse {
  success: boolean;
  data: IEmployee[];
  pagination: PaginationMeta;
}

export interface CreateEmployeeInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  teamId?: string | null;
  position: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  location: string;
  hireDate: string;
  yearsOfExperience?: number;
  salary?: number;
  avatarUrl?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  teamId?: string | null;
  position?: string;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  location?: string;
  hireDate?: string;
  yearsOfExperience?: number;
  salary?: number;
  avatarUrl?: string;
}

// ============================================================================
// EMPLOYEE SERVICE API CLIENT
// ============================================================================

export const employeeService = {
  /**
   * Fetches paginated, searchable, and filtered list of employees
   * GET /api/v1/employees
   */
  async getEmployees(params?: EmployeeQueryFilters): Promise<PaginatedEmployeesResponse> {
    const response = await apiClient.get<PaginatedEmployeesResponse>('/employees', { params });
    return response.data;
  },

  /**
   * Fetches a single employee by MongoDB ObjectId or employeeId
   * GET /api/v1/employees/:id
   */
  async getEmployeeById(id: string): Promise<{ success: boolean; data: IEmployee }> {
    const response = await apiClient.get<{ success: boolean; data: IEmployee }>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Creates a new employee with unique checks and department validation
   * POST /api/v1/employees
   */
  async createEmployee(data: CreateEmployeeInput): Promise<{ success: boolean; message: string; data: IEmployee }> {
    const response = await apiClient.post<{ success: boolean; message: string; data: IEmployee }>('/employees', data);
    return response.data;
  },

  /**
   * Updates an existing employee record
   * PUT /api/v1/employees/:id
   */
  async updateEmployee(id: string, data: UpdateEmployeeInput): Promise<{ success: boolean; message: string; data: IEmployee }> {
    const response = await apiClient.put<{ success: boolean; message: string; data: IEmployee }>(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * Performs quick status change (Active, Inactive, On Leave, Terminated)
   * PATCH /api/v1/employees/:id/status
   */
  async updateEmployeeStatus(id: string, status: EmployeeStatus): Promise<{ success: boolean; message: string; data: IEmployee }> {
    const response = await apiClient.patch<{ success: boolean; message: string; data: IEmployee }>(`/employees/${id}/status`, { status });
    return response.data;
  },

  /**
   * Soft deletes an employee (preserves historical data)
   * DELETE /api/v1/employees/:id
   */
  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Restores a soft-deleted employee back to Active status
   * PATCH /api/v1/employees/:id/restore
   */
  async restoreEmployee(id: string): Promise<{ success: boolean; message: string; data: IEmployee }> {
    const response = await apiClient.patch<{ success: boolean; message: string; data: IEmployee }>(`/employees/${id}/restore`);
    return response.data;
  },

  /**
   * Retrieves all departments for filter dropdowns and form selects
   * GET /api/v1/departments
   */
  async getDepartments(): Promise<{ success: boolean; data: IDepartment[] }> {
    const response = await apiClient.get<{ success: boolean; data: IDepartment[] }>('/departments');
    return response.data;
  },

  /**
   * Retrieves all teams, optionally filtered by departmentId
   * GET /api/v1/teams?departmentId=...
   */
  async getTeams(departmentId?: string): Promise<{ success: boolean; data: ITeam[] }> {
    const params = departmentId ? { departmentId } : undefined;
    const response = await apiClient.get<{ success: boolean; data: ITeam[] }>('/teams', { params });
    return response.data;
  },
};

export default employeeService;
