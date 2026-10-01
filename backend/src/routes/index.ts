import { Router } from 'express';
import healthRoute from './health.route';
import authRoute from './auth.route';
import passkeyRoute from './passkey.route';
import departmentRoute from './department.route';
import teamRoute from './team.route';
import employeeRoute from './employee.route';
import analyticsRoute from './analytics.route';
import roleRoute from './role.route';
import locationRoute from './location.route';
import skillRoute from './skill.route';
import pipelineRoute from './pipeline.route';

const router = Router();

// Mount Routes
router.use('/', healthRoute);
router.use('/auth', authRoute);
router.use('/auth/passkey', passkeyRoute);
router.use('/departments', departmentRoute);
router.use('/teams', teamRoute);
router.use('/employees', employeeRoute);
router.use('/analytics', analyticsRoute);
router.use('/roles', roleRoute);
router.use('/locations', locationRoute);
router.use('/skills', skillRoute);
router.use('/pipeline', pipelineRoute);

export default router;