import mongoose, { Document, Schema, Model } from 'mongoose';

// Risk category tiers
export type RiskCategory = 'Low' | 'Medium' | 'High';

// Feature impact direction
export type ImpactDirection = 'Increases Risk' | 'Decreases Risk' | 'Neutral';

// SHAP-style feature importance breakdown
export interface IContributingFactor {
  featureName: string;
  featureKey: string;
  weight: number; // e.g. -0.42 or +0.35
  impactLevel: 'High' | 'Medium' | 'Low';
  direction: ImpactDirection;
  description: string;
}

// Model snapshot features at prediction time
export interface IFeatureSnapshot {
  attendanceRate: number; // 0 - 100%
  performanceRating: number; // 1.0 - 5.0
  tenureMonths: number; // Months at company
  promotionCount: number; // Total promotions
  monthsSinceLastPromotion: number;
  salaryProgressionPct: number; // Salary growth %
  trainingHours: number; // Training participation
  engagementScore: number; // 1.0 - 5.0 survey score
}

// Model quality and drift evaluation metrics
export interface IModelEvaluationMetrics {
  accuracy: number; // 0 - 100%
  precision: number; // 0 - 100%
  recall: number; // 0 - 100%
  f1Score: number; // 0 - 100%
  falsePositives: number;
  falseNegatives: number;
  modelDriftPct: number; // Drift tracking metric
  lastEvaluatedAt: Date;
}

// Main Attrition Prediction Document Interface
export interface IAttritionPrediction extends Document {
  employeeId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  riskScore: number; // 0.0 to 100.0%
  riskCategory: RiskCategory;
  confidenceLevel: number; // e.g. 88.5%
  modelVersion: string; // e.g. "v1.2.0"
  contributingFactors: IContributingFactor[];
  recommendedAction: string;
  featureValues: IFeatureSnapshot;
  evaluationMetrics: IModelEvaluationMetrics;
  predictionDate: Date;
  isFlaggedForReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contributingFactorSchema = new Schema<IContributingFactor>(
  {
    featureName: { type: String, required: true },
    featureKey: { type: String, required: true },
    weight: { type: Number, required: true },
    impactLevel: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
    direction: { type: String, enum: ['Increases Risk', 'Decreases Risk', 'Neutral'], required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const featureSnapshotSchema = new Schema<IFeatureSnapshot>(
  {
    attendanceRate: { type: Number, default: 95.0 },
    performanceRating: { type: Number, default: 3.5 },
    tenureMonths: { type: Number, default: 24 },
    promotionCount: { type: Number, default: 1 },
    monthsSinceLastPromotion: { type: Number, default: 18 },
    salaryProgressionPct: { type: Number, default: 12.5 },
    trainingHours: { type: Number, default: 25 },
    engagementScore: { type: Number, default: 4.0 },
  },
  { _id: false }
);

const modelEvaluationMetricsSchema = new Schema<IModelEvaluationMetrics>(
  {
    accuracy: { type: Number, default: 91.5 },
    precision: { type: Number, default: 88.2 },
    recall: { type: Number, default: 86.4 },
    f1Score: { type: Number, default: 87.3 },
    falsePositives: { type: Number, default: 4 },
    falseNegatives: { type: Number, default: 3 },
    modelDriftPct: { type: Number, default: 1.8 },
    lastEvaluatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attritionPredictionSchema = new Schema<IAttritionPrediction>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required for attrition prediction'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID is required'],
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    riskCategory: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
      index: true,
    },
    confidenceLevel: {
      type: Number,
      required: true,
      default: 85.0,
    },
    modelVersion: {
      type: String,
      required: true,
      default: 'v1.2.0',
    },
    contributingFactors: {
      type: [contributingFactorSchema],
      default: [],
    },
    recommendedAction: {
      type: String,
      required: true,
    },
    featureValues: {
      type: featureSnapshotSchema,
      required: true,
    },
    evaluationMetrics: {
      type: modelEvaluationMetricsSchema,
      required: true,
    },
    predictionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isFlaggedForReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid analytics aggregations
attritionPredictionSchema.index({ departmentId: 1, riskCategory: 1 });
attritionPredictionSchema.index({ riskScore: -1, predictionDate: -1 });

export const AttritionPrediction: Model<IAttritionPrediction> =
  mongoose.models.AttritionPrediction ||
  mongoose.model<IAttritionPrediction>('AttritionPrediction', attritionPredictionSchema);
