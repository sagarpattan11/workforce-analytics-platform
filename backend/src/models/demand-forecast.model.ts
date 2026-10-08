import mongoose, { Document, Schema, Model } from 'mongoose';

// Quarterly demand breakdown item
export interface IQuarterlyDemand {
  quarter: string; // e.g. "Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"
  requiredHires: number;
  estimatedBudgetINR: number; // Budget requirement in ₹ INR
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Location-wise regional demand item
export interface ILocationDemand {
  location: string; // e.g. "Bangalore", "San Francisco", "London"
  currentCount: number;
  projectedDemand: number;
  shortage: number;
}

// Main Demand Forecast Document Interface
export interface IDemandForecast extends Document {
  departmentId: mongoose.Types.ObjectId;
  departmentName: string;
  roleName: string;
  roleCode: string;
  currentHeadcount: number;
  projectedDemand: number;
  headcountShortage: number;
  shortageSeverity: 'Optimal' | 'Moderate' | 'Severe' | 'Critical';
  forecastHorizon: string; // e.g. "12 Months"
  confidenceScore: number; // e.g. 89.5%
  requiredSkills: string[];
  quarterlyDemand: IQuarterlyDemand[];
  locationDemand: ILocationDemand[];
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const quarterlyDemandSchema = new Schema<IQuarterlyDemand>(
  {
    quarter: { type: String, required: true },
    requiredHires: { type: Number, required: true, default: 0 },
    estimatedBudgetINR: { type: Number, required: true, default: 0 },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  },
  { _id: false }
);

const locationDemandSchema = new Schema<ILocationDemand>(
  {
    location: { type: String, required: true },
    currentCount: { type: Number, required: true, default: 0 },
    projectedDemand: { type: Number, required: true, default: 0 },
    shortage: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const demandForecastSchema = new Schema<IDemandForecast>(
  {
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID is required for demand forecasting'],
      index: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    roleName: {
      type: String,
      required: true,
      index: true,
    },
    roleCode: {
      type: String,
      required: true,
    },
    currentHeadcount: {
      type: Number,
      required: true,
      min: 0,
    },
    projectedDemand: {
      type: Number,
      required: true,
      min: 0,
    },
    headcountShortage: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    shortageSeverity: {
      type: String,
      enum: ['Optimal', 'Moderate', 'Severe', 'Critical'],
      required: true,
      default: 'Moderate',
    },
    forecastHorizon: {
      type: String,
      default: '12 Months',
    },
    confidenceScore: {
      type: Number,
      default: 89.5,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    quarterlyDemand: {
      type: [quarterlyDemandSchema],
      default: [],
    },
    locationDemand: {
      type: [locationDemandSchema],
      default: [],
    },
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for high-speed queries by department and shortage severity
demandForecastSchema.index({ departmentId: 1, headcountShortage: -1 });

export const DemandForecast: Model<IDemandForecast> =
  mongoose.models.DemandForecast ||
  mongoose.model<IDemandForecast>('DemandForecast', demandForecastSchema);
