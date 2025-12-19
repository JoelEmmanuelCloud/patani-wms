import { NextResponse } from 'next/server';

/**
 * Standard API success response
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard API error response
 */
export function errorResponse(message: string, status: number = 500, error?: any) {
  const response: any = {
    success: false,
    message,
  };

  // Include detailed error in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any) {
  console.error('API Error:', error);

  if (error.name === 'ValidationError') {
    return errorResponse('Validation error: ' + error.message, 400, error);
  }

  if (error.name === 'CastError') {
    return errorResponse('Invalid ID format', 400, error);
  }

  if (error.code === 11000) {
    return errorResponse('Duplicate entry. Record already exists.', 409, error);
  }

  return errorResponse('Internal server error', 500, error);
}

/**
 * Parse query parameters with defaults
 */
export function parseQueryParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
    search,
    sortBy,
    sortOrder: (sortOrder === 'asc' ? 1 : -1) as 1 | -1,
  };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
}
