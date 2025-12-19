import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.enum([
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
  ]),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    contact: z.string().min(1, 'Vendor contact is required'),
  }),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Cheque', 'POS', 'Mobile Money']),
  expenseDate: z.string().or(z.date()).optional(),
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  status: z.enum(['Pending', 'Approved', 'Paid', 'Rejected']).default('Paid'),
  taxDeductible: z.boolean().default(false),
  notes: z.string().optional(),
  recordedBy: z.string().default('System'),
});

export const updateExpenseSchema = expenseSchema.partial();

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
