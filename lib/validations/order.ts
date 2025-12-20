import { z } from 'zod';

export const orderItemSchema = z.object({
  inventory: z.string().min(1, 'Inventory ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
});

export const orderSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  createdBy: z.string().default('System'),
});

export const updateOrderSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Completed', 'Cancelled']).optional(),
  deliveryStatus: z.enum(['Not Dispatched', 'In Transit', 'Delivered']).optional(),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
