import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import Customer from '@/lib/models/Customer';
import Expense from '@/lib/models/Expense';
import Inventory from '@/lib/models/Inventory';
import Tax from '@/lib/models/Tax';
import { successResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/reports/dashboard
 * Get dashboard summary statistics
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get current month date range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Sales statistics
    const [allOrders, monthOrders] = await Promise.all([
      Order.find({ status: { $ne: 'Cancelled' } }).lean(),
      Order.find({
        status: { $ne: 'Cancelled' },
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }).lean(),
    ]);

    const sales = {
      totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
      monthRevenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      totalOrders: allOrders.length,
      monthOrders: monthOrders.length,
    };

    // Payment statistics
    const monthPayments = await Payment.find({
      status: 'Confirmed',
      paymentDate: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    const payments = {
      monthTotal: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      monthCount: monthPayments.length,
    };

    // Outstanding balances
    const customers = await Customer.find({ balance: { $gt: 0 } }).lean();

    const outstanding = {
      total: customers.reduce((sum, c) => sum + c.balance, 0),
      customerCount: customers.length,
    };

    // Expense statistics
    const monthExpenses = await Expense.find({
      status: 'Paid',
      expenseDate: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    const expenses = {
      monthTotal: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      monthCount: monthExpenses.length,
    };

    // Inventory statistics
    const inventoryItems = await Inventory.find().lean();

    const inventory = {
      totalValue: inventoryItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
      lowStockCount: inventoryItems.filter((i) => i.status === 'Low Stock').length,
      outOfStockCount: inventoryItems.filter((i) => i.status === 'Out of Stock').length,
    };

    // Tax statistics
    const upcomingTaxes = await Tax.find({
      status: { $in: ['Pending', 'Overdue', 'Partially Paid'] },
    }).lean();

    const taxes = {
      unpaidCount: upcomingTaxes.length,
      totalDue: upcomingTaxes.reduce((sum, t) => sum + t.taxAmount, 0),
    };

    // Profitability
    const profitability = {
      monthGrossProfit: sales.monthRevenue,
      monthNetProfit: sales.monthRevenue - expenses.monthTotal,
      profitMargin:
        sales.monthRevenue > 0
          ? ((sales.monthRevenue - expenses.monthTotal) / sales.monthRevenue) * 100
          : 0,
    };

    return successResponse({
      sales,
      payments,
      outstanding,
      expenses,
      inventory,
      taxes,
      profitability,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
