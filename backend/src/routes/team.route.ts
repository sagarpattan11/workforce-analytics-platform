import { Router } from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
} from '../controllers/team.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// GET /api/v1/teams -> List teams (optionally filter by ?departmentId=...)
router.get('/', requireAuth, getTeams);

// GET /api/v1/teams/:id -> Get team by ID
router.get('/:id', requireAuth, getTeamById);

// POST /api/v1/teams -> Create new team
router.post('/', requireAuth, createTeam);

// PUT /api/v1/teams/:id -> Update team
router.put('/:id', requireAuth, updateTeam);

export default router;
