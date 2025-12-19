import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import Expense from '@/lib/models/Expense';
import Tax from '@/lib/models/Tax';

/**
 * Generate order number in format: ORD-YYMM-00001
 */
export const generateOrderNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `ORD-${year}${month}`;

  // Find the latest order with this prefix
  const latestOrder = await Order.findOne({
    orderNumber: new RegExp(`^${prefix}`),
  })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();

  if (!latestOrder) {
    return `${prefix}-00001`;
  }

  // Extract the sequence number and increment
  const sequence = parseInt(latestOrder.orderNumber.split('-')[2]) + 1;
  return `${prefix}-${sequence.toString().padStart(5, '0')}`;
};

/**
 * Generate payment number in format: PAY-YYMM-00001
 */
export const generatePaymentNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `PAY-${year}${month}`;

  // Find the latest payment with this prefix
  const latestPayment = await Payment.findOne({
    paymentNumber: new RegExp(`^${prefix}`),
  })
    .sort({ paymentNumber: -1 })
    .select('paymentNumber')
    .lean();

  if (!latestPayment) {
    return `${prefix}-00001`;
  }

  // Extract the sequence number and increment
  const sequence = parseInt(latestPayment.paymentNumber.split('-')[2]) + 1;
  return `${prefix}-${sequence.toString().padStart(5, '0')}`;
};

/**
 * Generate expense number in format: EXP-YYMM-00001
 */
export const generateExpenseNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `EXP-${year}${month}`;

  // Find the latest expense with this prefix
  const latestExpense = await Expense.findOne({
    expenseNumber: new RegExp(`^${prefix}`),
  })
    .sort({ expenseNumber: -1 })
    .select('expenseNumber')
    .lean();

  if (!latestExpense) {
    return `${prefix}-00001`;
  }

  // Extract the sequence number and increment
  const sequence = parseInt(latestExpense.expenseNumber.split('-')[2]) + 1;
  return `${prefix}-${sequence.toString().padStart(5, '0')}`;
};

/**
 * Generate tax number in format: TAX-YYMM-00001
 */
export const generateTaxNumber = async (): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `TAX-${year}${month}`;

  // Find the latest tax with this prefix
  const latestTax = await Tax.findOne({
    taxNumber: new RegExp(`^${prefix}`),
  })
    .sort({ taxNumber: -1 })
    .select('taxNumber')
    .lean();

  if (!latestTax) {
    return `${prefix}-00001`;
  }

  // Extract the sequence number and increment
  const sequence = parseInt(latestTax.taxNumber.split('-')[2]) + 1;
  return `${prefix}-${sequence.toString().padStart(5, '0')}`;
};
