import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Expense from '@/lib/models/Expense';
import { updateExpenseSchema } from '@/lib/validations/expense';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const expense = await Expense.findById((await context.params).id);
    if (!expense) return errorResponse('Expense not found', 404);
    return successResponse(expense);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await request.json();
    const validatedData = updateExpenseSchema.parse(body);

    const expense = await Expense.findByIdAndUpdate((await context.params).id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!expense) return errorResponse('Expense not found', 404);
    return successResponse(expense);
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
    const expense = await Expense.findByIdAndDelete((await context.params).id);
    if (!expense) return errorResponse('Expense not found', 404);
    return successResponse({ message: 'Expense deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
