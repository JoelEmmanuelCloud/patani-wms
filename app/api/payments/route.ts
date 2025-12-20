import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Payment from '@/lib/models/Payment';
import Customer from '@/lib/models/Customer';
import Order from '@/lib/models/Order';
import { paymentSchema } from '@/lib/validations/payment';
import { generatePaymentNumber } from '@/lib/utils/generators';
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  buildPaginationMeta,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/payments
 * Get all payments with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(searchParams);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (search) {
      query.paymentNumber = { $regex: search, $options: 'i' };
    }

    if (customerId) {
      query.customer = customerId;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('customer', 'name phone businessName')
        .populate('order', 'orderNumber total')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    // Calculate statistics
    const stats = {
      totalPayments: total,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
      confirmedAmount: payments
        .filter((p) => p.status === 'Confirmed')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return successResponse({
      payments,
      stats,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/payments
 * Record new payment with transaction handling
 * - Creates payment
 * - Updates customer balance
 * - Updates order if linked
 */
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Generate payment number
    const paymentNumber = await generatePaymentNumber();

    // Get customer and their orders to calculate debt
    const customer = await Customer.findById(validatedData.customer).session(session);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Create payment
    const [payment] = await Payment.create(
      [
        {
          paymentNumber,
          ...validatedData,
          paymentDate: validatedData.paymentDate || new Date(),
        },
      ],
      { session }
    );

    // Apply payment: Reduce debt first, then excess to wallet
    let remainingPayment = validatedData.amount;

    if (validatedData.order) {
      // Payment linked to specific order - apply to that order
      const order = await Order.findById(validatedData.order).session(session);

      if (order) {
        const orderDebt = order.balance; // What's owed on this order
        const paymentToOrder = Math.min(remainingPayment, orderDebt);

        // Apply payment to order
        order.amountPaid += paymentToOrder;
        await order.save({ session });

        remainingPayment -= paymentToOrder;
      }
    } else {
      // General payment - apply to all unpaid orders (oldest first), then old balance
      const Order = (await import('@/lib/models/Order')).default;
      const orders = await Order.find({
        customer: validatedData.customer,
        balance: { $gt: 0 }
      })
        .sort({ createdAt: 1 }) // Oldest first
        .session(session);

      // Apply to orders only (Old Balance is STATIC and never changes)
      for (const order of orders) {
        if (remainingPayment <= 0) break;

        const orderDebt = order.balance;
        const paymentToOrder = Math.min(remainingPayment, orderDebt);

        order.amountPaid += paymentToOrder;
        await order.save({ session });

        remainingPayment -= paymentToOrder;
      }

      // NOTE: Old Balance is STATIC and is never modified by payments
      // It represents historical debt before the system was created
    }

    // Recalculate wallet: Wallet = Max(0, Total Payments - Total Debt)
    // Get all payments for this customer
    const Payment = (await import('@/lib/models/Payment')).default;
    const Order = (await import('@/lib/models/Order')).default;

    const allPayments = await Payment.find({ customer: validatedData.customer }).session(session);
    const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const allOrders = await Order.find({ customer: validatedData.customer }).session(session);
    const totalOrderDebt = allOrders.reduce((sum, o) => sum + o.balance, 0);

    const totalDebt = customer.oldBalance + totalOrderDebt;
    const walletBalance = Math.max(0, totalPayments - totalDebt);

    // Set wallet to calculated value
    customer.balance = walletBalance;

    // Save customer updates
    await customer.save({ session });

    await session.commitTransaction();

    // Populate customer and order details for response
    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer', 'name phone businessName')
      .populate('order', 'orderNumber total');

    return successResponse(populatedPayment, 201);
  } catch (error: any) {
    await session.abortTransaction();

    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  } finally {
    session.endSession();
  }
}
