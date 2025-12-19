import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().default('Nigeria'),
  }),
  businessName: z.string().optional(),
  customerType: z.enum(['Retail', 'Wholesale', 'Distributor', 'Individual']),
  creditLimit: z.number().min(0, 'Credit limit cannot be negative').default(0),
  oldBalance: z.number().default(0),
  status: z.enum(['Active', 'Inactive', 'Suspended']).default('Active'),
  notes: z.string().optional(),
});

export const updateCustomerSchema = customerSchema.partial();

export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
