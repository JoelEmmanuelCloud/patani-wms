import { z } from 'zod';

export const taxSchema = z.object({
  taxType: z.enum([
    'VAT',
    'Company Income Tax',
    'WHT',
    'Personal Income Tax',
    'Import Duty',
    'Export Levy',
    'Business Premises Tax',
    'Education Tax',
    'Other',
  ]),
  taxPeriod: z.object({
    month: z.number().min(1).max(12).optional(),
    quarter: z.number().min(1).max(4).optional(),
    year: z.number().min(2000).max(2100),
  }),
  taxableAmount: z.number().min(0, 'Taxable amount cannot be negative'),
  taxRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
  dueDate: z.string().or(z.date()),
  paymentDate: z.string().or(z.date()).optional(),
  status: z.enum(['Pending', 'Paid', 'Overdue', 'Partially Paid']).default('Pending'),
  paymentReference: z.string().optional(),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Cheque', 'Online Payment']).optional(),
  receiptNumber: z.string().optional(),
  filingReference: z.string().optional(),
  notes: z.string().optional(),
  recordedBy: z.string().default('System'),
});

export const updateTaxSchema = taxSchema.partial();

export type TaxInput = z.infer<typeof taxSchema>;
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;
