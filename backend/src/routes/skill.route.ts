import { Router } from 'express';
import {
  getSkills,
  createSkill,
  getSkillAnalytics,
} from '../controllers/skill.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All skill endpoints are protected by authentication
router.get('/', requireAuth, getSkills);
router.post('/', requireAuth, createSkill);
router.get('/analytics', requireAuth, getSkillAnalytics);

export default router;
