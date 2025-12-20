import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import Customer from '@/lib/models/Customer';
import Inventory from '@/lib/models/Inventory';
import { orderSchema } from '@/lib/validations/order';
import { generateOrderNumber } from '@/lib/utils/generators';
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  buildPaginationMeta,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/orders
 * Get all orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(searchParams);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const customerId = searchParams.get('customerId');

    // Build query
    const query: any = {};

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (customerId) {
      query.customer = customerId;
    }

    // Execute query with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name phone businessName')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Calculate statistics
    const stats = {
      totalOrders: total,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalOutstanding: orders.reduce((sum, order) => sum + order.balance, 0),
      pendingCount: await Order.countDocuments({ status: 'Pending' }),
    };

    return successResponse({
      orders,
      stats,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/orders
 * Create new order with transaction handling
 * - Creates order
 * - Deducts inventory
 * - Updates customer balance
 */
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Fetch inventory items and calculate totals
    const itemsWithDetails = await Promise.all(
      validatedData.items.map(async (item) => {
        const inventory = await Inventory.findById(item.inventory).session(session);

        if (!inventory) {
          throw new Error(`Inventory item not found: ${item.inventory}`);
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${inventory.brand} ${inventory.itemName}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
          );
        }

        return {
          inventory: inventory._id,
          itemName: inventory.itemName,
          brand: inventory.brand,
          unit: inventory.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        };
      })
    );

    // Calculate order totals
    const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal - validatedData.discount;

    // Fetch customer to check wallet balance
    const customer = await Customer.findById(validatedData.customer).session(session);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Calculate wallet application (wallet system)
    const walletBalance = customer.balance; // Current wallet
    const walletToApply = Math.min(walletBalance, total); // Use wallet up to order total
    const balance = total - walletToApply;

    // Create order
    const [order] = await Order.create(
      [
        {
          orderNumber,
          customer: validatedData.customer,
          items: itemsWithDetails,
          subtotal,
          discount: validatedData.discount,
          tax: 0,
          total,
          amountPaid: walletToApply, // Wallet funds automatically applied
          balance,
          deliveryAddress: validatedData.deliveryAddress,
          deliveryDate: validatedData.deliveryDate,
          notes: validatedData.notes,
          createdBy: validatedData.createdBy,
        },
      ],
      { session }
    );

    // Deduct inventory quantities
    await Promise.all(
      validatedData.items.map((item) =>
        Inventory.findByIdAndUpdate(
          item.inventory,
          { $inc: { quantity: -item.quantity } },
          { session }
        )
      )
    );

    // Recalculate wallet after order is created
    // Wallet = Max(0, Total Payments - Total Debt)
    const Payment = (await import('@/lib/models/Payment')).default;

    const allPayments = await Payment.find({ customer: validatedData.customer }).session(session);
    const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);

    const allOrders = await Order.find({ customer: validatedData.customer }).session(session);
    const totalOrderDebt = allOrders.reduce((sum, o) => sum + o.balance, 0);

    const totalDebt = customer.oldBalance + totalOrderDebt;
    const walletBalance = Math.max(0, totalPayments - totalDebt);

    // Update customer stats and recalculated wallet
    await Customer.findByIdAndUpdate(
      validatedData.customer,
      {
        $inc: {
          totalOrders: 1,
          totalPurchases: total,
        },
        $set: {
          balance: walletBalance, // Set recalculated wallet
        },
        lastOrderDate: new Date(),
      },
      { session }
    );

    await session.commitTransaction();

    // Populate customer details for response
    const populatedOrder = await Order.findById(order._id).populate('customer', 'name phone businessName');

    return successResponse(populatedOrder, 201);
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
