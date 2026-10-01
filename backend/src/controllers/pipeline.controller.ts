import { Request, Response } from 'express';
import { PipelineService } from '../services/pipeline.service';
import { bulkSyncPayloadSchema } from '../validations/pipeline.validation';

/**
 * 1. POST /api/v1/pipeline/sync
 * Ingests, validates, deduplicates, and maps placement, recruitment, and learning data.
 */
export const syncPipelineData = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = bulkSyncPayloadSchema.parse(req.body);

    const placementResult = validated.placements?.length
      ? await PipelineService.processPlacements(validated.placements)
      : { inserted: 0, updated: 0, duplicatesSkipped: 0, invalidMappings: 0, issues: [] };

    const recruitmentResult = validated.recruitments?.length
      ? await PipelineService.processRecruitments(validated.recruitments)
      : { inserted: 0, updated: 0, duplicatesSkipped: 0, invalidMappings: 0, issues: [] };

    const learningResult = validated.learningRecords?.length
      ? await PipelineService.processLearningRecords(validated.learningRecords)
      : { inserted: 0, updated: 0, duplicatesSkipped: 0, invalidMappings: 0, issues: [] };

    const allIssues = [
      ...placementResult.issues,
      ...recruitmentResult.issues,
      ...learningResult.issues,
    ];

    res.status(200).json({
      success: true,
      message: 'Data pipeline synchronization completed',
      data: {
        summary: {
          placements: {
            processed: (validated.placements?.length || 0),
            ...placementResult,
          },
          recruitments: {
            processed: (validated.recruitments?.length || 0),
            ...recruitmentResult,
          },
          learningRecords: {
            processed: (validated.learningRecords?.length || 0),
            ...learningResult,
          },
          totalIssues: allIssues.length,
          issues: allIssues,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in syncPipelineData:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Pipeline payload validation failed',
        errors: error.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to process pipeline synchronization',
      error: error.message,
    });
  }
};

/**
 * 2. GET /api/v1/pipeline/validation-report
 * Scans current database collections to identify orphaned mappings and deduplication health.
 */
export const getPipelineValidationReport = async (_req: Request, res: Response): Promise<void> => {
  try {
    const report = await PipelineService.auditDatabase();

    res.status(200).json({
      success: true,
      message: 'Pipeline database validation report generated',
      data: report,
    });
  } catch (error: any) {
    console.error('Error in getPipelineValidationReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate pipeline audit report',
      error: error.message,
    });
  }
};
