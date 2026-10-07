import { Router } from 'express';
import { syncPipelineData, getPipelineValidationReport } from '../controllers/pipeline.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/v1/pipeline/sync -> Collect, validate, deduplicate, and ingest pipeline data
router.post('/sync', requireAuth, syncPipelineData);

// GET /api/v1/pipeline/validation-report -> Audit database for orphan mappings and duplicates
router.get('/validation-report', requireAuth, getPipelineValidationReport);

export default router;
