import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Customer from '@/lib/models/Customer';
import { customerSchema } from '@/lib/validations/customer';
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  buildPaginationMeta,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/customers
 * Get all customers with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(searchParams);
    const customerType = searchParams.get('customerType');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    if (customerType) {
      query.customerType = customerType;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    // Calculate statistics
    const stats = {
      totalCustomers: total,
      activeCustomers: await Customer.countDocuments({ status: 'Active' }),
      totalOutstanding: customers.reduce((sum, customer) => sum + (customer.balance > 0 ? customer.balance : 0), 0),
      debtorCount: customers.filter((c) => c.balance > 0).length,
    };

    return successResponse({
      customers,
      stats,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/customers
 * Create new customer
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    // Set oldBalanceRemaining to match oldBalance at creation
    const customerData = {
      ...validatedData,
      oldBalanceRemaining: validatedData.oldBalance || 0,
    };

    const customer = await Customer.create(customerData);

    return successResponse(customer, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}
