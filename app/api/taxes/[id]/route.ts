import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Tax from '@/lib/models/Tax';
import { updateTaxSchema } from '@/lib/validations/tax';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const tax = await Tax.findById((await context.params).id);
    if (!tax) return errorResponse('Tax record not found', 404);
    return successResponse(tax);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await request.json();
    const validatedData = updateTaxSchema.parse(body);

    const tax = await Tax.findByIdAndUpdate((await context.params).id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!tax) return errorResponse('Tax record not found', 404);
    return successResponse(tax);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const tax = await Tax.findByIdAndDelete((await context.params).id);
    if (!tax) return errorResponse('Tax record not found', 404);
    return successResponse({ message: 'Tax record deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
