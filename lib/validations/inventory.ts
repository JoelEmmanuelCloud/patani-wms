import { z } from 'zod';

export const inventorySchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  brand: z.string().min(1, 'Brand is required'),
  category: z.enum(['Rice', 'Spaghetti', 'Oil', 'Beans', 'Indomie', 'Other']),
  unit: z.enum(['Bag', 'Carton', 'Gallon', 'Kg', 'Pieces']),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  location: z.string().min(1, 'Location is required'),
  supplier: z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contact: z.string().min(1, 'Supplier contact is required'),
  }),
});

export const updateInventorySchema = inventorySchema.partial();

export type InventoryInput = z.infer<typeof inventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
