import { Request, Response } from 'express';
import { Employee } from '../models/employee.model';
import { Department } from '../models/department.model';
import { Team } from '../models/team.model';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  employeeQuerySchema,
} from '../validations/employee.validation';

/**
 * 1. GET /api/v1/employees
 * Retrieves paginated, searchable, sorted, and filtered employees
 */
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryParams = employeeQuerySchema.parse(req.query);
    const {
      page,
      limit,
      q,
      search,
      departmentId,
      teamId,
      status,
      employmentType,
      location,
      sortBy,
      sortOrder,
      isDeleted,
    } = queryParams;

    // Base filter: Return soft-deleted employees if isDeleted=true, otherwise exclude them
    const filter: any = {};
    if (isDeleted === true) {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = { $ne: true };
    }

    // Search query: Case-insensitive match across name, email, employee ID, and position
    const searchTerm = q || search;
    if (searchTerm) {
      const regex = new RegExp(searchTerm.trim(), 'i');
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeId: regex },
        { position: regex },
      ];
    }

    // Filters
    if (departmentId) filter.departmentId = departmentId;
    if (teamId) filter.teamId = teamId;
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (location) filter.location = new RegExp(location.trim(), 'i');

    // Sorting & Pagination
    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('departmentId', 'name code')
        .populate('teamId', 'name code'),
      Employee.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Invalid query parameters', errors: error.errors });
      return;
    }
    console.error('Error in getEmployees:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve employees', error: error.message });
  }
};

/**
 * 2. GET /api/v1/employees/:id
 * Retrieves a single employee by MongoDB ObjectId or employeeId
 */
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isObjectId
      ? { _id: id, isDeleted: { $ne: true } }
      : { employeeId: id.toUpperCase(), isDeleted: { $ne: true } };

    const employee = await Employee.findOne(filter)
      .populate('departmentId', 'name code description')
      .populate('teamId', 'name code description');

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error: any) {
    console.error('Error in getEmployeeById:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve employee', error: error.message });
  }
};

/**
 * 3. POST /api/v1/employees
 * Creates a new employee with referential and uniqueness checks
 */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createEmployeeSchema.parse(req.body);

    // 1. Verify unique employeeId
    const existingId = await Employee.findOne({ employeeId: validatedData.employeeId });
    if (existingId) {
      res.status(409).json({
        success: false,
        message: `Employee ID "${validatedData.employeeId}" is already assigned`,
      });
      return;
    }

    // 2. Verify unique email
    const existingEmail = await Employee.findOne({ email: validatedData.email });
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: `An employee with email "${validatedData.email}" already exists`,
      });
      return;
    }

    // 3. Verify referenced department exists
    const department = await Department.findById(validatedData.departmentId);
    if (!department) {
      res.status(404).json({
        success: false,
        message: `Department not found with ID: ${validatedData.departmentId}`,
      });
      return;
    }

    // 4. Verify referenced team exists if provided
    if (validatedData.teamId) {
      const team = await Team.findById(validatedData.teamId);
      if (!team) {
        res.status(404).json({
          success: false,
          message: `Team not found with ID: ${validatedData.teamId}`,
        });
        return;
      }
    }

    // Create employee
    const createData: any = { ...validatedData };
    if (!createData.teamId) delete createData.teamId;
    const employee = await Employee.create(createData);
    await (employee as any).populate('departmentId', 'name code');
    if ((employee as any).teamId) await (employee as any).populate('teamId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    console.error('Error in createEmployee:', error);
    res.status(500).json({ success: false, message: 'Failed to create employee', error: error.message });
  }
};

/**
 * 4. PUT /api/v1/employees/:id
 * Updates an employee's details
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateEmployeeSchema.parse(req.body);

    // If updating email, ensure it's not taken by another employee
    if (validatedData.email) {
      const existingEmail = await Employee.findOne({
        email: validatedData.email,
        _id: { $ne: id },
      });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: `Email "${validatedData.email}" is already used by another employee`,
        });
        return;
      }
    }

    // If departmentId changed, verify it exists
    if (validatedData.departmentId) {
      const department = await Department.findById(validatedData.departmentId);
      if (!department) {
        res.status(404).json({ success: false, message: 'Department not found' });
        return;
      }
    }

    const updateDoc: any = { ...validatedData };
    if (validatedData.status === 'Terminated') {
      if (!updateDoc.exitDate) {
        updateDoc.exitDate = new Date();
      }
    } else if (validatedData.status) {
      updateDoc.exitDate = null;
      updateDoc.exitReason = null;
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: updateDoc },
      { new: true, runValidators: true }
    )
      .populate('departmentId', 'name code')
      .populate('teamId', 'name code');

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      return;
    }
    console.error('Error in updateEmployee:', error);
    res.status(500).json({ success: false, message: 'Failed to update employee', error: error.message });
  }
};

/**
 * 5. PATCH /api/v1/employees/:id/status
 * Quick update for employee status (Active, Inactive, On Leave, Terminated)
 */
export const updateEmployeeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = updateEmployeeStatusSchema.parse(req.body);

    const updateDoc: any = { status };
    if (status === 'Terminated') {
      updateDoc.exitDate = new Date();
    } else {
      // When reactivating or changing away from Terminated, clear exitDate and exitReason
      updateDoc.exitDate = null;
      updateDoc.exitReason = null;
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: updateDoc },
      { new: true }
    );

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Employee status updated to ${status}`,
      data: employee,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      return;
    }
    console.error('Error in updateEmployeeStatus:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

/**
 * 6. DELETE /api/v1/employees/:id
 * Soft delete: sets isDeleted: true instead of removing document
 */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found or already deleted' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Employee "${employee.fullName}" (${employee.employeeId}) has been removed`,
    });
  } catch (error: any) {
    console.error('Error in deleteEmployee:', error);
    res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
  }
};

/**
 * 7. PATCH /api/v1/employees/:id/restore
 * Restores a soft-deleted employee back to Active status
 */
export const restoreEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndUpdate(
      { _id: id, isDeleted: true },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          status: 'Active',
          exitDate: null,
          exitReason: null,
        },
      },
      { new: true }
    );

    if (!employee) {
      res.status(404).json({ success: false, message: 'Soft-deleted employee not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Employee "${employee.fullName}" (${employee.employeeId}) has been restored to Active`,
      data: employee,
    });
  } catch (error: any) {
    console.error('Error in restoreEmployee:', error);
    res.status(500).json({ success: false, message: 'Failed to restore employee', error: error.message });
  }
};
