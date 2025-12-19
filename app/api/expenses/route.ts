import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Expense from '@/lib/models/Expense';
import { expenseSchema } from '@/lib/validations/expense';
import { generateExpenseNumber } from '@/lib/utils/generators';
import {
  successResponse,
  errorResponse,
  handleApiError,
  parseQueryParams,
  buildPaginationMeta,
} from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search, sortBy, sortOrder } = parseQueryParams(searchParams);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const query: any = {};

    if (search) {
      query.$or = [
        { expenseNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      Expense.countDocuments(query),
    ]);

    const stats = {
      totalExpenses: total,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    };

    return successResponse({
      expenses,
      stats,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    const expenseNumber = await generateExpenseNumber();

    const expense = await Expense.create({
      expenseNumber,
      ...validatedData,
      expenseDate: validatedData.expenseDate || new Date(),
    });

    return successResponse(expense, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}
