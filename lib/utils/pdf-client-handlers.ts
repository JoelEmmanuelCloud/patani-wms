import { generateFullCustomerStatement, generateInventoryReport, generateExpenseReport, generateOrderInvoice } from './pdf-generators';

/**
 * Download customer statement PDF
 * Fetches comprehensive customer data and generates a full account statement PDF
 */
export async function downloadCustomerStatement(customerId: string): Promise<void> {
  try {
    // Fetch comprehensive statement data from existing API
    const response = await fetch(`/api/customers/${customerId}/statement`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch statement data');
    }

    // Generate PDF using existing generator
    const pdf = generateFullCustomerStatement(result.data);

    // Download PDF with customer name in filename
    const customerName = result.data.customer.name.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const filename = `Customer_Statement_${customerName}_${date}.pdf`;
    pdf.save(filename);

    return;
  } catch (error) {
    console.error('Error generating customer statement:', error);
    throw error;
  }
}

/**
 * Download inventory report PDF
 * Fetches all inventory items and generates a comprehensive inventory report
 */
export async function downloadInventoryReport(): Promise<void> {
  try {
    // Fetch all inventory items (no pagination limit for export)
    const response = await fetch('/api/inventory?limit=1000&sortBy=category&sortOrder=asc');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch inventory data');
    }

    const items = result.data.items;

    // Calculate statistics
    const stats = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      totalValue: items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      inStock: items.filter((item: any) => item.status === 'In Stock').length,
      lowStock: items.filter((item: any) => item.status === 'Low Stock').length,
      outOfStock: items.filter((item: any) => item.status === 'Out of Stock').length,
    };

    // Group items by category
    const byCategory: Record<string, any[]> = {};
    items.forEach((item: any) => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });

    const data = { items, stats, byCategory };

    // Generate PDF
    const pdf = generateInventoryReport(data);

    // Download with date in filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `Inventory_Report_${date}.pdf`;
    pdf.save(filename);

    return;
  } catch (error) {
    console.error('Error generating inventory report:', error);
    throw error;
  }
}

/**
 * Download expense report PDF
 * Fetches expenses (optionally filtered by date range) and generates a comprehensive expense report
 */
export async function downloadExpenseReport(startDate?: string, endDate?: string): Promise<void> {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append('limit', '1000'); // Get all expenses for export
    params.append('sortBy', 'expenseDate');
    params.append('sortOrder', 'desc');

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    // Fetch expenses
    const response = await fetch(`/api/expenses?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch expense data');
    }

    const expenses = result.data.expenses;

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const paidExpenses = expenses
      .filter((e: any) => e.status === 'Paid')
      .reduce((sum: number, e: any) => sum + e.amount, 0);
    const pendingExpenses = expenses
      .filter((e: any) => e.status === 'Pending')
      .reduce((sum: number, e: any) => sum + e.amount, 0);
    const taxDeductible = expenses
      .filter((e: any) => e.taxDeductible)
      .reduce((sum: number, e: any) => sum + e.amount, 0);

    const stats = {
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      count: expenses.length,
      taxDeductible,
    };

    // Group by category
    const byCategory: Record<string, { count: number; total: number }> = {};
    expenses.forEach((expense: any) => {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = { count: 0, total: 0 };
      }
      byCategory[expense.category].count++;
      byCategory[expense.category].total += expense.amount;
    });

    const data = {
      expenses,
      stats,
      byCategory,
      dateRange: { startDate, endDate }
    };

    // Generate PDF
    const pdf = generateExpenseReport(data);

    // Download with date range in filename
    const date = new Date().toISOString().split('T')[0];
    let filename = `Expense_Report_${date}.pdf`;

    if (startDate && endDate) {
      filename = `Expense_Report_${startDate}_to_${endDate}.pdf`;
    } else if (startDate) {
      filename = `Expense_Report_from_${startDate}.pdf`;
    } else if (endDate) {
      filename = `Expense_Report_until_${endDate}.pdf`;
    }

    pdf.save(filename);

    return;
  } catch (error) {
    console.error('Error generating expense report:', error);
    throw error;
  }
}

/**
 * Download individual order invoice PDF
 * Fetches order data and customer data and generates an invoice PDF
 */
export async function downloadOrderInvoice(orderId: string): Promise<void> {
  try {
    // Fetch order data
    const response = await fetch(`/api/orders/${orderId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch order data');
    }

    const order = result.data;
    const customer = order.customer;

    // Generate PDF using existing generator
    const pdf = generateOrderInvoice(order, customer);

    // Download PDF with order number in filename
    const filename = `Invoice_${order.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return;
  } catch (error) {
    console.error('Error generating order invoice:', error);
    throw error;
  }
}
