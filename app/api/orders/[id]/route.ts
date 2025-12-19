import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import Inventory from '@/lib/models/Inventory';
import { updateOrderSchema } from '@/lib/validations/order';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/orders/[id]
 * Get single order
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const order = await Order.findById((await context.params).id)
      .populate('customer', 'name phone email businessName address')
      .populate('items.inventory', 'itemName brand category unit');

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/orders/[id]
 * Update order status
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    const order = await Order.findByIdAndUpdate(
      (await context.params).id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('customer', 'name phone businessName');

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(order);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/orders/[id]
 * Delete order completely - restore inventory, delete associated payments, update customer balance
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const orderId = (await context.params).id;
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      return errorResponse('Order not found', 404);
    }

    // Import Payment model
    const Payment = (await import('@/lib/models/Payment')).default;

    // Restore inventory quantities
    await Promise.all(
      order.items.map((item) =>
        Inventory.findByIdAndUpdate(
          item.inventory,
          { $inc: { quantity: item.quantity } },
          { session }
        )
      )
    );

    // Find all payments associated with this order
    const orderPayments = await Payment.find({ order: orderId }).session(session);
    const totalOrderPayments = orderPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Delete all payments associated with this order
    await Payment.deleteMany({ order: orderId }, { session });

    // Update customer balance and stats
    // - Remove the order balance from customer's balance
    // - Add back any payments made specifically for this order to the balance
    // - Decrement total orders and total purchases
    await Customer.findByIdAndUpdate(
      order.customer,
      {
        $inc: {
          balance: -order.balance + totalOrderPayments,
          totalOrders: -1,
          totalPurchases: -order.total,
        },
      },
      { session }
    );

    // Delete the order completely
    await Order.findByIdAndDelete(orderId, { session });

    await session.commitTransaction();

    return successResponse({
      message: 'Order deleted successfully',
      deletedPayments: orderPayments.length,
      restoredItems: order.items.length
    });
  } catch (error) {
    await session.abortTransaction();
    return handleApiError(error);
  } finally {
    session.endSession();
  }
}
