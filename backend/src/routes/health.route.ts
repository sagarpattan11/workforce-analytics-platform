import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/v1/health
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'WFA API',
  });
});

export default router;