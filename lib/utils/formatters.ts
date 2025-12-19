/**
 * Format number to Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₦1,000,000.00")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1,000,000")
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-NG').format(num);
};

/**
 * Format amount for PDF reports (without currency symbol)
 * @param amount - The amount to format
 * @returns Formatted amount string (e.g., "1,000,000.00")
 */
export const formatAmountForPDF = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to Nigerian format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "13 Dec 2025")
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

/**
 * Format date and time to Nigerian format
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Format phone number to Nigerian format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as 0801 234 5678
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
};

/**
 * Truncate text to specified length
 * @param text - The text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis
 */
export const truncateText = (text: string, length: number = 50): string => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Calculate percentage
 * @param value - The value
 * @param total - The total
 * @returns Percentage (0-100)
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Get status color class for Tailwind CSS
 * @param status - The status to get color for
 * @returns Tailwind CSS color classes
 */
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Success statuses
    'Paid': 'bg-green-100 text-green-800 border-green-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'In Stock': 'bg-green-100 text-green-800 border-green-200',
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Confirmed': 'bg-green-100 text-green-800 border-green-200',
    'Delivered': 'bg-green-100 text-green-800 border-green-200',
    'Approved': 'bg-green-100 text-green-800 border-green-200',

    // Warning statuses
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Partial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low Stock': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Partially Paid': 'bg-yellow-100 text-yellow-800 border-yellow-200',

    // Danger statuses
    'Unpaid': 'bg-red-100 text-red-800 border-red-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Out of Stock': 'bg-red-100 text-red-800 border-red-200',
    'Overdue': 'bg-red-100 text-red-800 border-red-200',
    'Failed': 'bg-red-100 text-red-800 border-red-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Suspended': 'bg-red-100 text-red-800 border-red-200',

    // Info statuses
    'In Transit': 'bg-blue-100 text-blue-800 border-blue-200',
    'Not Dispatched': 'bg-gray-100 text-gray-800 border-gray-200',
    'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};
