import mongoose, { Schema, Model, Document } from 'mongoose';

export type CustomerType = 'Retail' | 'Wholesale' | 'Distributor' | 'Individual';
export type CustomerStatus = 'Active' | 'Inactive' | 'Suspended';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };
  businessName?: string;
  customerType: CustomerType;
  balance: number;
  oldBalance: number;
  oldBalanceRemaining: number;
  creditLimit: number;
  status: CustomerStatus;
  totalOrders: number;
  totalPurchases: number;
  lastOrderDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      country: {
        type: String,
        default: 'Nigeria',
        trim: true,
      },
    },
    businessName: {
      type: String,
      trim: true,
    },
    customerType: {
      type: String,
      required: [true, 'Customer type is required'],
      enum: ['Retail', 'Wholesale', 'Distributor', 'Individual'],
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance (wallet) cannot be negative'],
      // WALLET: Positive = customer prepayments/credits (can only be >= 0)
    },
    oldBalance: {
      type: Number,
      default: 0,
      // STATIC: Represents pre-system debt (for display only, never changes)
    },
    oldBalanceRemaining: {
      type: Number,
      default: 0,
      min: [0, 'Old balance remaining cannot be negative'],
      // DYNAMIC: Tracks remaining old balance debt (can be paid down)
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: [0, 'Credit limit cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches (email is already indexed via sparse: true)
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ customerType: 1 });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ balance: 1 });

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
