import { Request, Response } from 'express';
import { Department } from '../models/department.model';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from '../validations/department.validation';

/**
 * 1. GET /api/v1/departments
 * Retrieves all departments (optionally filtered by isActive status)
 */
export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { includeInactive } = req.query;

    // By default, return only active departments unless includeInactive=true
    const query = includeInactive === 'true' ? {} : { isActive: true };

    const departments = await Department.find(query)
      .sort({ name: 1 })
      .populate('managerId', 'firstName lastName email position');

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error: any) {
    console.error('Error in getDepartments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve departments',
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/v1/departments/:id
 * Retrieves a single department by its MongoDB ObjectId or unique Code
 */
export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if ID is a valid MongoDB ObjectId or a department code (e.g., 'ENG')
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { code: id.toUpperCase() };

    const department = await Department.findOne(query).populate(
      'managerId',
      'firstName lastName email position'
    );

    if (!department) {
      res.status(404).json({
        success: false,
        message: `Department not found with identifier: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error: any) {
    console.error('Error in getDepartmentById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve department',
      error: error.message,
    });
  }
};

/**
 * 3. POST /api/v1/departments
 * Creates a new department after validating input with Zod
 */
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body using our Zod schema
    const validatedData = createDepartmentSchema.parse(req.body);

    // Check for duplicate department name or code
    const existing = await Department.findOne({
      $or: [
        { code: validatedData.code },
        { name: new RegExp(`^${validatedData.name}$`, 'i') },
      ],
    });

    if (existing) {
      const duplicateField = existing.code === validatedData.code ? 'code' : 'name';
      res.status(409).json({
        success: false,
        message: `A department with this ${duplicateField} already exists: "${validatedData[duplicateField]}"`,
      });
      return;
    }

    // Save to MongoDB
    const createData: any = { ...validatedData };
    if (!createData.managerId) delete createData.managerId;
    const department = await Department.create(createData);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error: any) {
    // If Zod validation failed
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Error in createDepartment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message,
    });
  }
};

/**
 * 4. PUT /api/v1/departments/:id
 * Updates an existing department
 */
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateDepartmentSchema.parse(req.body);

    const department = await Department.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!department) {
      res.status(404).json({
        success: false,
        message: 'Department not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }

    console.error('Error in updateDepartment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message,
    });
  }
};
