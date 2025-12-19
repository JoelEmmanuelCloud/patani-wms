import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import { updateCustomerSchema } from '@/lib/validations/customer';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/customers/[id]
 * Get single customer with order and payment history
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const customer = await Customer.findById((await context.params).id);

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    // Get customer's orders and payments (ALL, no limit)
    const [orders, payments] = await Promise.all([
      Order.find({ customer: (await context.params).id })
        .sort({ createdAt: -1 })
        .lean(),
      Payment.find({ customer: (await context.params).id })
        .sort({ paymentDate: -1 })
        .lean(),
    ]);

    // Calculate statistics
    const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDebt = customer.oldBalance + customer.balance;

    return successResponse({
      customer,
      orders,
      payments,
      stats: {
        totalOrders: orders.length,
        totalOrderValue,
        totalPayments,
        currentBalance: customer.balance,
        oldBalance: customer.oldBalance,
        totalDebt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/customers/[id]
 * Update customer
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = updateCustomerSchema.parse(body);

    const customer = await Customer.findByIdAndUpdate(
      (await context.params).id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    return successResponse(customer);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete customer
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check if customer has orders
    const orderCount = await Order.countDocuments({ customer: (await context.params).id });
    if (orderCount > 0) {
      return errorResponse(
        'Cannot delete customer with existing orders. Please archive instead.',
        400
      );
    }

    const customer = await Customer.findByIdAndDelete((await context.params).id);

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    return successResponse({ message: 'Customer deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
