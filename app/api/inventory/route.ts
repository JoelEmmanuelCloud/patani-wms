import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Inventory from '@/lib/models/Inventory';
import { inventorySchema } from '@/lib/validations/inventory';
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  buildPaginationMeta,
} from '@/lib/utils/api-helpers';

/**
 * GET /api/inventory
 * Get all inventory items with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(searchParams);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const [items, total] = await Promise.all([
      Inventory.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(query),
    ]);

    // Calculate statistics
    const stats = {
      totalItems: total,
      totalValue: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      lowStockCount: await Inventory.countDocuments({ status: 'Low Stock' }),
      outOfStockCount: await Inventory.countDocuments({ status: 'Out of Stock' }),
    };

    return successResponse({
      items,
      stats,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/inventory
 * Create new inventory item
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    const item = await Inventory.create(validatedData);

    return successResponse(item, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}
