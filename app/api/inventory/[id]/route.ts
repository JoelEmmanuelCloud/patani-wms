import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Inventory from '@/lib/models/Inventory';
import { updateInventorySchema } from '@/lib/validations/inventory';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

/**
 * GET /api/inventory/[id]
 * Get single inventory item
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const item = await Inventory.findById((await context.params).id);

    if (!item) {
      return errorResponse('Inventory item not found', 404);
    }

    return successResponse(item);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/inventory/[id]
 * Update inventory item
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    const item = await Inventory.findByIdAndUpdate(
      (await context.params).id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return errorResponse('Inventory item not found', 404);
    }

    return successResponse(item);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}

/**
 * DELETE /api/inventory/[id]
 * Delete inventory item
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const item = await Inventory.findByIdAndDelete((await context.params).id);

    if (!item) {
      return errorResponse('Inventory item not found', 404);
    }

    return successResponse({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
