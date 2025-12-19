import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'POS' | 'Mobile Money';
export type PaymentStatusType = 'Pending' | 'Confirmed' | 'Failed' | 'Refunded';

export interface IPayment extends Document {
  paymentNumber: string;
  customer: Types.ObjectId;
  order?: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  referenceNumber?: string;
  bankName?: string;
  notes?: string;
  status: PaymentStatusType;
  receivedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'POS', 'Mobile Money'],
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Failed', 'Refunded'],
      default: 'Confirmed',
    },
    receivedBy: {
      type: String,
      required: true,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches (paymentNumber is already indexed via unique: true)
PaymentSchema.index({ customer: 1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ status: 1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
