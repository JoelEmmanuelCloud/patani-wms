import mongoose, { Schema, Model, Document } from 'mongoose';

export type CategoryType = 'Rice' | 'Spaghetti' | 'Oil' | 'Beans' | 'Indomie' | 'Other';
export type UnitType = 'Bag' | 'Carton' | 'Gallon' | 'Kg' | 'Pieces' | 'Pack' | 'Crate' | 'Other';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface IInventory extends Document {
  itemName: string;
  brand: string;
  category: CategoryType;
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  location: string;
  supplier: {
    name: string;
    contact: string;
  };
  status: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Rice', 'Spaghetti', 'Oil', 'Beans', 'Indomie', 'Other'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['Bag', 'Carton', 'Gallon', 'Kg', 'Pieces', 'Pack', 'Crate', 'Other'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    supplier: {
      name: {
        type: String,
        required: [true, 'Supplier name is required'],
        trim: true,
      },
      contact: {
        type: String,
        required: [true, 'Supplier contact is required'],
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-calculate status based on quantity
InventorySchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

// Index for faster searches
InventorySchema.index({ itemName: 1, brand: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ status: 1 });

const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
