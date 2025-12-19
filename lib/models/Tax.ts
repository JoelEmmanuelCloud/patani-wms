import mongoose, { Schema, Model, Document } from 'mongoose';

export type TaxType =
  | 'VAT'
  | 'Company Income Tax'
  | 'WHT'
  | 'Personal Income Tax'
  | 'Import Duty'
  | 'Export Levy'
  | 'Business Premises Tax'
  | 'Education Tax'
  | 'Other';

export type TaxPaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online Payment';
export type TaxStatus = 'Pending' | 'Paid' | 'Overdue' | 'Partially Paid';

export interface ITax extends Document {
  taxNumber: string;
  taxType: TaxType;
  taxPeriod: {
    month?: number;
    quarter?: number;
    year: number;
  };
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  dueDate: Date;
  paymentDate?: Date;
  status: TaxStatus;
  paymentReference?: string;
  paymentMethod?: TaxPaymentMethod;
  receiptNumber?: string;
  filingReference?: string;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaxSchema = new Schema<ITax>(
  {
    taxNumber: {
      type: String,
      required: true,
      unique: true,
    },
    taxType: {
      type: String,
      required: [true, 'Tax type is required'],
      enum: [
        'VAT',
        'Company Income Tax',
        'WHT',
        'Personal Income Tax',
        'Import Duty',
        'Export Levy',
        'Business Premises Tax',
        'Education Tax',
        'Other',
      ],
    },
    taxPeriod: {
      month: {
        type: Number,
        min: 1,
        max: 12,
      },
      quarter: {
        type: Number,
        min: 1,
        max: 4,
      },
      year: {
        type: Number,
        required: true,
      },
    },
    taxableAmount: {
      type: Number,
      required: [true, 'Taxable amount is required'],
      min: [0, 'Taxable amount cannot be negative'],
    },
    taxRate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    taxAmount: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Tax amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paymentDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', 'Partially Paid'],
      default: 'Pending',
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online Payment'],
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    filingReference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: String,
      required: true,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update status based on due date
TaxSchema.pre('save', function (next) {
  if (!this.paymentDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

// Indexes for faster searches (taxNumber is already indexed via unique: true)
TaxSchema.index({ taxType: 1 });
TaxSchema.index({ dueDate: 1 });
TaxSchema.index({ status: 1 });
TaxSchema.index({ 'taxPeriod.year': 1 });

const Tax: Model<ITax> =
  mongoose.models.Tax || mongoose.model<ITax>('Tax', TaxSchema);

export default Tax;
