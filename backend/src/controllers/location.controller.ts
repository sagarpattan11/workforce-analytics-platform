import { Request, Response } from 'express';
import { Location } from '../models/location.model';

/**
 * GET /api/v1/locations
 * Retrieves all locations, optionally filtered by type or status.
 */
export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, includeInactive } = req.query;

    const filter: Record<string, any> = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }
    if (type) {
      filter.type = type;
    }

    const locations = await Location.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error: any) {
    console.error('Error in getLocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/locations/:id
 * Retrieves a single location by ID or code.
 */
export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { code: id.toUpperCase() };

    const location = await Location.findOne(query);

    if (!location) {
      res.status(404).json({
        success: false,
        message: `Location not found with identifier: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error: any) {
    console.error('Error in getLocationById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve location',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/locations
 * Creates a new location.
 */
export const createLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, city, country, address, type, capacity } = req.body;

    if (!name || !code || !city || !country) {
      res.status(400).json({
        success: false,
        message: 'Name, code, city, and country are required',
      });
      return;
    }

    const existing = await Location.findOne({
      $or: [{ code: code.toUpperCase() }, { name }],
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Location with this code or name already exists',
      });
      return;
    }

    const newLocation = await Location.create({
      name,
      code: code.toUpperCase(),
      city,
      country,
      address,
      type: type || 'Office',
      capacity: capacity ? Number(capacity) : undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      data: newLocation,
    });
  } catch (error: any) {
    console.error('Error in createLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: error.message,
    });
  }
};

/**
 * PUT /api/v1/locations/:id
 * Updates an existing location.
 */
export const updateLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const updated = await Location.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404).json({
        success: false,
        message: `Location not found with ID: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message,
    });
  }
};
