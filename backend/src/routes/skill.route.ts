import { Router } from 'express';
import {
  getSkills,
  createSkill,
  getSkillAnalytics,
} from '../controllers/skill.controller';

const router = Router();

router.get('/', getSkills);
router.post('/', createSkill);
router.get('/analytics', getSkillAnalytics);

export default router;
