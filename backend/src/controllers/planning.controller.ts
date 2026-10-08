import { Request, Response } from 'express';
import DemandService from '../services/demand.service';
import ScenarioService from '../services/scenario.service';
import { logAuditEvent } from '../models/audit-log.model';

/**
 * GET /api/v1/analytics/demand-forecasting
 * Retrieves Demand Forecasting Projections & Shortage Metrics
 */
export const getDemandForecasting = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await DemandService.getDemandForecastingOverview();

    // Audit Logging
    await logAuditEvent({
      action: 'DEMAND_FORECAST_VIEW',
      userId: (req as any).user?._id || (req as any).user?.id,
      username: (req as any).user?.username || 'system_admin',
      email: (req as any).user?.email,
      role: (req as any).user?.role || 'HR_Admin',
      success: true,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: 'Viewed Demand Forecasting Projections & Shortage Analytics',
    });

    res.status(200).json({
      success: true,
      message: 'Demand forecasting analytics retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error in getDemandForecasting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve demand forecasting analytics',
      error: error.message,
    });
  }
};

/**
 * POST /api/v1/analytics/workforce-planning/simulate
 * Runs Strategic Workforce Scenario Planning Simulation
 */
export const simulateScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scenarioName, title, description, parameters } = req.body;

    if (!scenarioName) {
      res.status(400).json({
        success: false,
        message: 'Scenario name is required for simulation',
      });
      return;
    }

    const userId = (req as any).user?._id || (req as any).user?.id || '60d0fe4f5311236168a109ca';

    const simulatedPlan = await ScenarioService.simulateWorkforceScenario(
      {
        scenarioName,
        title: title || `${scenarioName} Simulation`,
        description: description || `Simulating scenario: ${scenarioName}`,
        parameters: parameters || {},
      },
      userId.toString()
    );

    // Audit Logging
    await logAuditEvent({
      action: 'WORKFORCE_SCENARIO_SIMULATE',
      userId,
      username: (req as any).user?.username || 'system_admin',
      email: (req as any).user?.email,
      role: (req as any).user?.role || 'HR_Admin',
      success: true,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      details: `Ran simulation for scenario '${scenarioName}' with total budget impact ₹${simulatedPlan.simulatedImpact.financialImpact.totalBudgetImpactINR}`,
    });

    res.status(200).json({
      success: true,
      message: `Successfully ran scenario simulation for '${scenarioName}'`,
      data: simulatedPlan,
    });
  } catch (error: any) {
    console.error('Error in simulateScenario:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute workforce scenario simulation',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/analytics/workforce-planning/scenarios
 * Retrieves Saved Workforce Scenario Simulation Plans
 */
export const getSavedScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const scenarios = await ScenarioService.getSavedScenarios();

    res.status(200).json({
      success: true,
      message: 'Saved workforce scenarios retrieved successfully',
      data: scenarios,
    });
  } catch (error: any) {
    console.error('Error in getSavedScenarios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved workforce scenarios',
      error: error.message,
    });
  }
};

/**
 * GET /api/v1/analytics/workforce-planning/catalog
 * Retrieves Catalog of 7 Supported Business Scenarios
 */
export const getScenarioCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const catalog = ScenarioService.getAvailableScenarioTypes();

    res.status(200).json({
      success: true,
      message: 'Scenario catalog retrieved successfully',
      data: catalog,
    });
  } catch (error: any) {
    console.error('Error in getScenarioCatalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scenario catalog',
      error: error.message,
    });
  }
};
