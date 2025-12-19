import { z } from 'zod';

export const paymentSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  order: z.string().optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Cheque', 'POS', 'Mobile Money']),
  paymentDate: z.string().or(z.date()).optional(),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Pending', 'Confirmed', 'Failed', 'Refunded']).default('Confirmed'),
  receivedBy: z.string().default('System'),
});

export const updatePaymentSchema = paymentSchema.partial();

export type PaymentInput = z.infer<typeof paymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
