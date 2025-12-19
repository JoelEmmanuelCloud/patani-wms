import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/customers/[id]/statement
 * Get comprehensive customer statement data for PDF generation
 * Supports date range filtering via query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch customer
    const customer = await Customer.findById((await context.params).id);

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    // Build date filter for orders and payments
    const orderDateFilter: any = {};
    const paymentDateFilter: any = {};

    if (startDate || endDate) {
      if (startDate) {
        orderDateFilter.$gte = new Date(startDate);
        paymentDateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        orderDateFilter.$lte = new Date(endDate);
        paymentDateFilter.$lte = new Date(endDate);
      }
    }

    // Fetch orders and payments with optional date filtering
    const [orders, payments] = await Promise.all([
      Order.find({
        customer: (await context.params).id,
        ...(startDate || endDate ? { createdAt: orderDateFilter } : {}),
      })
        .sort({ createdAt: 1 })
        .lean(),
      Payment.find({
        customer: (await context.params).id,
        ...(startDate || endDate ? { paymentDate: paymentDateFilter } : {}),
      })
        .sort({ paymentDate: 1 })
        .lean(),
    ]);

    // Calculate summary statistics
    const totalOrders = orders.reduce((sum, order) => sum + order.total, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return successResponse({
      customer,
      orders,
      payments,
      dateRange: { startDate, endDate },
      summary: {
        oldBalance: customer.oldBalance,
        totalOrders,
        totalPayments,
        currentBalance: customer.balance,
        totalDebt: customer.oldBalance + customer.balance,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
