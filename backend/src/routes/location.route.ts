import { Router } from 'express';
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
} from '../controllers/location.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All location endpoints are protected by authentication
router.get('/', requireAuth, getLocations);
router.get('/:id', requireAuth, getLocationById);
router.post('/', requireAuth, createLocation);
router.put('/:id', requireAuth, updateLocation);

export default router;
