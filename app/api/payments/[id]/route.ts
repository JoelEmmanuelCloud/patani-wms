import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Payment from '@/lib/models/Payment';
import { updatePaymentSchema } from '@/lib/validations/payment';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/payments/[id]
 * Get single payment
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const payment = await Payment.findById((await context.params).id)
      .populate('customer', 'name phone businessName')
      .populate('order', 'orderNumber total balance');

    if (!payment) {
      return errorResponse('Payment not found', 404);
    }

    return successResponse(payment);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/payments/[id]
 * Update payment
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    const payment = await Payment.findByIdAndUpdate(
      (await context.params).id,
      validatedData,
      { new: true, runValidators: true }
    )
      .populate('customer', 'name phone businessName')
      .populate('order', 'orderNumber total');

    if (!payment) {
      return errorResponse('Payment not found', 404);
    }

    return successResponse(payment);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/payments/[id]
 * Delete payment
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const payment = await Payment.findByIdAndDelete((await context.params).id);

    if (!payment) {
      return errorResponse('Payment not found', 404);
    }

    return successResponse({ message: 'Payment deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
