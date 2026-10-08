import { Request, Response } from 'express';
import AttritionService from '../services/attrition.service';
import { logAuditEvent } from '../models/audit-log.model';

/**
 * GET /api/v1/analytics/attrition
 * Retrieves Attrition Prediction Dashboard Overview Analytics
 */
export const getAttritionAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await AttritionService.getAttritionOverviewAnalytics();

    // Audit Logging
    await logAuditEvent({
      action: 'ATTRITION_ANALYTICS_VIEW',
      userId: (req as any).user?._id || (req as any).user?.id,
      username: (req as any).user?.username || 'system_admin',
      email: (req as any).user?.email,
      role: (req as any).user?.role || 'HR_Admin',
      success: true,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: 'Viewed Attrition Risk Overview Analytics Dashboard',
    });

    res.status(200).json({
      success: true,
      message: 'Attrition analytics retrieved successfully',
      data: analytics,
    });
  } catch (error: any) {
    console.error('Error in getAttritionAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attrition analytics',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/analytics/attrition/explainability
 * Retrieves Model Explainability Metrics, SHAP Feature Importance, and Model Accuracy
 */
export const getAttritionExplainability = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await AttritionService.getModelExplainabilityMetrics();

    // Audit Logging
    await logAuditEvent({
      action: 'ATTRITION_EXPLAINABILITY_VIEW',
      userId: (req as any).user?._id || (req as any).user?.id,
      username: (req as any).user?.username || 'system_admin',
      email: (req as any).user?.email,
      role: (req as any).user?.role || 'HR_Admin',
      success: true,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: 'Viewed Attrition Model Explainability & Quality Metrics',
    });

    res.status(200).json({
      success: true,
      message: 'Attrition model explainability metrics retrieved successfully',
      data: metrics,
    });
  } catch (error: any) {
    console.error('Error in getAttritionExplainability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attrition explainability metrics',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/analytics/attrition/recalculate
 * Triggers batch recalculation of Attrition Predictions for all active employees
 */
export const recalculateAttritionPredictions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await AttritionService.batchCalculateAttritionPredictions();

    // Audit Logging
    await logAuditEvent({
      action: 'ATTRITION_BATCH_RECALCULATE',
      userId: (req as any).user?._id || (req as any).user?.id,
      username: (req as any).user?.username || 'system_admin',
      email: (req as any).user?.email,
      role: (req as any).user?.role || 'HR_Admin',
      success: true,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: `Recalculated attrition risk scores for ${result.processedCount} employees`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully recalculated attrition risk for ${result.processedCount} employees`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in recalculateAttritionPredictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate attrition predictions',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/analytics/attrition/employee/:employeeId
 * Calculates or retrieves Attrition Prediction for a specific employee
 */
export const getEmployeeAttritionPrediction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      res.status(400).json({
        success: false,
        message: 'Employee ID parameter is required',
      });
      return;
    }

    const prediction = await AttritionService.computeEmployeeAttritionRisk(employeeId);

    res.status(200).json({
      success: true,
      message: 'Employee attrition prediction retrieved successfully',
      data: prediction,
    });
  } catch (error: any) {
    console.error(`Error in getEmployeeAttritionPrediction for ${req.params.employeeId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee attrition prediction',
      error: error.message,
    });
  }
};
