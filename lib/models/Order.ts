import mongoose, { Schema, Model, Document, Types } from 'mongoose';

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';
export type DeliveryStatus = 'Not Dispatched' | 'In Transit' | 'Delivered';

export interface IOrderItem {
  inventory: Types.ObjectId;
  itemName: string;
  brand: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryAddress?: string;
  deliveryDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  inventory: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative'],
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'],
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid'],
      default: 'Unpaid',
    },
    deliveryStatus: {
      type: String,
      enum: ['Not Dispatched', 'In Transit', 'Delivered'],
      default: 'Not Dispatched',
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    deliveryDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate payment status
OrderSchema.pre('save', function (next) {
  this.balance = this.total - this.amountPaid;

  if (this.amountPaid === 0) {
    this.paymentStatus = 'Unpaid';
  } else if (this.amountPaid >= this.total) {
    this.paymentStatus = 'Paid';
  } else {
    this.paymentStatus = 'Partial';
  }

  next();
});

// Indexes for faster searches (orderNumber is already indexed via unique: true)
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
