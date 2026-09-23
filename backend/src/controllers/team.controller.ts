import { Request, Response } from 'express';
import { Team } from '../models/team.model';
import { Department } from '../models/department.model';
import { createTeamSchema, updateTeamSchema } from '../validations/team.validation';

/**
 * 1. GET /api/v1/teams
 * Retrieves teams, optionally filtered by departmentId
 */
export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, includeInactive } = req.query;

    const query: any = {};
    if (departmentId) query.departmentId = departmentId;
    if (includeInactive !== 'true') query.isActive = true;

    const teams = await Team.find(query)
      .sort({ name: 1 })
      .populate('departmentId', 'name code')
      .populate('leadId', 'firstName lastName email position');

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    console.error('Error in getTeams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve teams',
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/v1/teams/:id
 * Retrieves a single team by ID
 */
export const getTeamById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate('departmentId', 'name code description')
      .populate('leadId', 'firstName lastName email position');

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    console.error('Error in getTeamById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team',
      error: error.message,
    });
  }
};

/**
 * 3. POST /api/v1/teams
 * Creates a new team under a specified department
 */
export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createTeamSchema.parse(req.body);

    // Verify that the referenced department exists in database
    const department = await Department.findById(validatedData.departmentId);
    if (!department) {
      res.status(404).json({
        success: false,
        message: `Department not found with ID: ${validatedData.departmentId}`,
      });
      return;
    }

    // Check for duplicate team code within the same department
    const existing = await Team.findOne({
      departmentId: validatedData.departmentId,
      $or: [
        { code: validatedData.code },
        { name: new RegExp(`^${validatedData.name}$`, 'i') },
      ],
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `A team with this name or code already exists in ${department.name}`,
      });
      return;
    }

    // Create and populate
    const createData: any = { ...validatedData };
    if (!createData.leadId) delete createData.leadId;
    const team = await Team.create(createData);
    await (team as any).populate('departmentId', 'name code');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error: any) {
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

    console.error('Error in createTeam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message,
    });
  }
};

/**
 * 4. PUT /api/v1/teams/:id
 * Updates an existing team
 */
export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateTeamSchema.parse(req.body);

    // If departmentId is changed, verify that new department exists
    if (validatedData.departmentId) {
      const department = await Department.findById(validatedData.departmentId);
      if (!department) {
        res.status(404).json({
          success: false,
          message: `Department not found with ID: ${validatedData.departmentId}`,
        });
        return;
      }
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name code');

    if (!team) {
      res.status(404).json({
        success: false,
        message: 'Team not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
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

    console.error('Error in updateTeam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message,
    });
  }
};
