import mongoose, { Schema, Model, Document } from 'mongoose';

export type ExpenseCategory =
  | 'Transportation'
  | 'Utilities'
  | 'Salaries'
  | 'Rent'
  | 'Maintenance'
  | 'Marketing'
  | 'Office Supplies'
  | 'Insurance'
  | 'Professional Services'
  | 'Fuel'
  | 'Loading/Offloading'
  | 'Security'
  | 'Other';

export type ExpensePaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'POS' | 'Mobile Money';
export type ExpenseStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected';

export interface IExpense extends Document {
  expenseNumber: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor: {
    name: string;
    contact: string;
  };
  paymentMethod: ExpensePaymentMethod;
  expenseDate: Date;
  referenceNumber?: string;
  invoiceNumber?: string;
  status: ExpenseStatus;
  taxDeductible: boolean;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Transportation',
        'Utilities',
        'Salaries',
        'Rent',
        'Maintenance',
        'Marketing',
        'Office Supplies',
        'Insurance',
        'Professional Services',
        'Fuel',
        'Loading/Offloading',
        'Security',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    vendor: {
      name: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true,
      },
      contact: {
        type: String,
        required: [true, 'Vendor contact is required'],
        trim: true,
      },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'POS', 'Mobile Money'],
    },
    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid', 'Rejected'],
      default: 'Paid',
    },
    taxDeductible: {
      type: Boolean,
      default: false,
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

// Indexes for faster searches (expenseNumber is already indexed via unique: true)
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ expenseDate: -1 });
ExpenseSchema.index({ status: 1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
