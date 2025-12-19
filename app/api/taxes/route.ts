import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Tax from '@/lib/models/Tax';
import { taxSchema } from '@/lib/validations/tax';
import { generateTaxNumber } from '@/lib/utils/generators';
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
    const taxType = searchParams.get('taxType');
    const status = searchParams.get('status');

    const query: any = {};

    if (search) {
      query.taxNumber = { $regex: search, $options: 'i' };
    }

    if (taxType) query.taxType = taxType;
    if (status) query.status = status;

    const [taxes, total] = await Promise.all([
      Tax.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).lean(),
      Tax.countDocuments(query),
    ]);

    const stats = {
      totalTaxes: total,
      totalDue: taxes.filter((t) => t.status !== 'Paid').reduce((sum, t) => sum + t.taxAmount, 0),
      unpaidCount: taxes.filter((t) => t.status === 'Pending' || t.status === 'Overdue').length,
    };

    return successResponse({
      taxes,
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
    const validatedData = taxSchema.parse(body);

    const taxNumber = await generateTaxNumber();

    const tax = await Tax.create({
      taxNumber,
      ...validatedData,
    });

    return successResponse(tax, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed: ' + error.errors[0].message, 400, error);
    }
    return handleApiError(error);
  }
}
