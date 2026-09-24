import { Request, Response } from 'express';
import { Role } from '../models/role.model';

/**
 * GET /api/v1/roles
 * Retrieves all enterprise roles, optionally filtered by departmentId or level.
 */
export const getRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, level, includeInactive } = req.query;

    const filter: Record<string, any> = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }
    if (departmentId) {
      filter.departmentId = departmentId;
    }
    if (level) {
      filter.level = level;
    }

    const roles = await Role.find(filter)
      .populate('departmentId', 'name code')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error: any) {
    console.error('Error in getRoles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve roles',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/roles/:id
 * Retrieves a single role by ID or code.
 */
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { code: id.toUpperCase() };

    const role = await Role.findOne(query).populate('departmentId', 'name code');

    if (!role) {
      res.status(404).json({
        success: false,
        message: `Role not found with identifier: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error: any) {
    console.error('Error in getRoleById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve role',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/roles
 * Creates a new role.
 */
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, departmentId, level, description, permissions } = req.body;

    if (!name || !code || !departmentId) {
      res.status(400).json({
        success: false,
        message: 'Name, code, and departmentId are required',
      });
      return;
    }

    const existing = await Role.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(409).json({
        success: false,
        message: `Role code '${code}' is already registered`,
      });
      return;
    }

    const newRole = await Role.create({
      name,
      code: code.toUpperCase(),
      departmentId,
      level: level || 'Mid',
      description,
      permissions: permissions || [],
      isActive: true,
    });

    const populated = await Role.findById(newRole._id).populate('departmentId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: populated,
    });
  } catch (error: any) {
    console.error('Error in createRole:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message,
    });
  }
};

/**
 * PUT /api/v1/roles/:id
 * Updates an existing role.
 */
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const updated = await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('departmentId', 'name code');

    if (!updated) {
      res.status(404).json({
        success: false,
        message: `Role not found with ID: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in updateRole:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message,
    });
  }
};
