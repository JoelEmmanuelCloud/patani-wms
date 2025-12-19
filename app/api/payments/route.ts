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

    // Update customer balance (reduce what they owe)
    await Customer.findByIdAndUpdate(
      validatedData.customer,
      { $inc: { balance: -validatedData.amount } },
      { session }
    );

    // If payment is linked to an order, update order
    if (validatedData.order) {
      const order = await Order.findById(validatedData.order).session(session);

      if (order) {
        order.amountPaid += validatedData.amount;
        await order.save({ session });
      }
    }

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
