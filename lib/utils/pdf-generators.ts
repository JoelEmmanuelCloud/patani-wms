import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatAmountForPDF, formatDate, formatDateTime } from './formatters';
import { COMPANY_CONFIG } from '../config/company';

// ============================================
// COMMON PDF UTILITIES
// ============================================

/**
 * Add company header to PDF
 */
function addPDFHeader(doc: jsPDF, title: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Company name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_CONFIG.name, pageWidth / 2, 15, { align: 'center' });

  // Company details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${COMPANY_CONFIG.address}, ${COMPANY_CONFIG.city}, ${COMPANY_CONFIG.state}`, pageWidth / 2, 22, { align: 'center' });
  doc.text(`${COMPANY_CONFIG.phone} | ${COMPANY_CONFIG.email}`, pageWidth / 2, 27, { align: 'center' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 38, { align: 'center' });

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  return 48; // Return Y position after header
}

/**
 * Add footer with page numbers
 */
function addPDFFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${formatDateTime(new Date())}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }
}

// ============================================
// CUSTOMER STATEMENT PDFs
// ============================================

interface CustomerStatementData {
  customer: any;
  orders: any[];
  payments: any[];
  dateRange?: { startDate?: string; endDate?: string };
  summary: {
    oldBalance: number;
    totalOrders: number;
    totalPayments: number;
    currentBalance: number;
    totalDebt: number;
  };
}

/**
 * Generate Full Customer Statement PDF
 */
export function generateFullCustomerStatement(data: CustomerStatementData): jsPDF {
  const doc = new jsPDF();
  let yPos = addPDFHeader(doc, 'CUSTOMER STATEMENT - FULL ACCOUNT');

  yPos += 5;

  // Customer Details Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information:', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.customer.name}`, 14, yPos);
  yPos += 5;
  if (data.customer.businessName) {
    doc.text(`Business: ${data.customer.businessName}`, 14, yPos);
    yPos += 5;
  }
  doc.text(`Phone: ${data.customer.phone}`, 14, yPos);
  yPos += 5;
  if (data.customer.email) {
    doc.text(`Email: ${data.customer.email}`, 14, yPos);
    yPos += 5;
  }
  doc.text(`Address: ${data.customer.address.street}, ${data.customer.address.city}, ${data.customer.address.state}`, 14, yPos);
  yPos += 10;

  // Account Summary Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Account Summary:', 14, yPos);
  yPos += 6;

  const summaryData = [
    ['Old Balance (Pre-System)', formatAmountForPDF(data.summary.oldBalance)],
    ['Total Orders', formatAmountForPDF(data.summary.totalOrders)],
    ['Total Payments', formatAmountForPDF(data.summary.totalPayments)],
    ['Current Balance', formatAmountForPDF(data.summary.currentBalance)],
    ['TOTAL DEBT', formatAmountForPDF(data.summary.totalDebt)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100, valign: 'middle' },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 'auto', cellPadding: { right: 5 }, valign: 'middle' },
    },
    didParseCell: function(data: any) {
      if (data.row.index === summaryData.length - 1) {
        data.cell.styles.fillColor = [231, 76, 60];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontSize = 11;
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Orders Section
  if (data.orders.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order History:', 14, yPos);
    yPos += 5;

    const orderRows = data.orders.map(order => [
      order.orderNumber,
      formatDate(order.createdAt),
      order.items.length,
      formatAmountForPDF(order.total),
      formatAmountForPDF(order.amountPaid),
      formatAmountForPDF(order.balance),
      order.paymentStatus,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Order #', 'Date', 'Items', 'Total', 'Paid', 'Balance', 'Status']],
      body: orderRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        0: { valign: 'middle' },
        1: { valign: 'middle' },
        2: { halign: 'center', valign: 'middle' },
        3: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        4: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        5: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        6: { valign: 'middle' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Payments Section
  if (data.payments.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment History:', 14, yPos);
    yPos += 5;

    const paymentRows = data.payments.map(payment => [
      payment.paymentNumber,
      formatDate(payment.paymentDate),
      payment.paymentMethod,
      formatAmountForPDF(payment.amount),
      payment.status,
      payment.referenceNumber || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Payment #', 'Date', 'Method', 'Amount', 'Status', 'Reference']],
      body: paymentRows,
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        0: { valign: 'middle' },
        1: { valign: 'middle' },
        2: { valign: 'middle' },
        3: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        4: { valign: 'middle' },
        5: { valign: 'middle' },
      },
    });
  }

  addPDFFooter(doc);
  return doc;
}

/**
 * Generate Date Range Filtered Statement PDF
 */
export function generateDateRangeStatement(data: CustomerStatementData): jsPDF {
  const doc = new jsPDF();
  const dateRangeText = `${data.dateRange?.startDate ? formatDate(new Date(data.dateRange.startDate)) : 'Beginning'} to ${data.dateRange?.endDate ? formatDate(new Date(data.dateRange.endDate)) : 'Present'}`;

  let yPos = addPDFHeader(doc, 'CUSTOMER STATEMENT - DATE RANGE');

  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Period: ${dateRangeText}`, 14, yPos);
  yPos += 10;

  // Customer Details Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information:', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.customer.name}`, 14, yPos);
  yPos += 5;
  if (data.customer.businessName) {
    doc.text(`Business: ${data.customer.businessName}`, 14, yPos);
    yPos += 5;
  }
  doc.text(`Phone: ${data.customer.phone}`, 14, yPos);
  yPos += 10;

  // Account Summary Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Account Summary (Period):', 14, yPos);
  yPos += 6;

  const summaryData = [
    ['Old Balance (Pre-System)', formatAmountForPDF(data.summary.oldBalance)],
    ['Total Orders (Period)', formatAmountForPDF(data.summary.totalOrders)],
    ['Total Payments (Period)', formatAmountForPDF(data.summary.totalPayments)],
    ['Current Balance', formatAmountForPDF(data.summary.currentBalance)],
    ['TOTAL DEBT', formatAmountForPDF(data.summary.totalDebt)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'striped',
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120, valign: 'middle' },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 'auto', cellPadding: { right: 5 }, valign: 'middle' },
    },
    didParseCell: function(data: any) {
      if (data.row.index === summaryData.length - 1) {
        data.cell.styles.fillColor = [231, 76, 60];
        data.cell.styles.textColor = [255, 255, 255];
        data.cell.styles.fontSize = 11;
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Orders Section
  if (data.orders.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Orders (Period):', 14, yPos);
    yPos += 5;

    const orderRows = data.orders.map(order => [
      order.orderNumber,
      formatDate(order.createdAt),
      order.items.length,
      formatAmountForPDF(order.total),
      formatAmountForPDF(order.amountPaid),
      formatAmountForPDF(order.balance),
      order.paymentStatus,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Order #', 'Date', 'Items', 'Total', 'Paid', 'Balance', 'Status']],
      body: orderRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        0: { valign: 'middle' },
        1: { valign: 'middle' },
        2: { halign: 'center', valign: 'middle' },
        3: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        4: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        5: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        6: { valign: 'middle' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No orders in this period', 14, yPos);
    yPos += 10;
  }

  // Payments Section
  if (data.payments.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payments (Period):', 14, yPos);
    yPos += 5;

    const paymentRows = data.payments.map(payment => [
      payment.paymentNumber,
      formatDate(payment.paymentDate),
      payment.paymentMethod,
      formatAmountForPDF(payment.amount),
      payment.status,
      payment.referenceNumber || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Payment #', 'Date', 'Method', 'Amount', 'Status', 'Reference']],
      body: paymentRows,
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        0: { valign: 'middle' },
        1: { valign: 'middle' },
        2: { valign: 'middle' },
        3: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
        4: { valign: 'middle' },
        5: { valign: 'middle' },
      },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('No payments in this period', 14, yPos);
  }

  addPDFFooter(doc);
  return doc;
}

/**
 * Generate Individual Order Invoice PDF
 */
export function generateOrderInvoice(order: any, customer: any): jsPDF {
  const doc = new jsPDF();
  let yPos = addPDFHeader(doc, 'INVOICE');

  yPos += 5;

  // Invoice details
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice #: ${order.orderNumber}`, 14, yPos);
  doc.text(`Date: ${formatDate(order.createdAt)}`, pageWidth - 14, yPos, { align: 'right' });
  yPos += 10;

  // Customer details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name, 14, yPos);
  yPos += 5;
  if (customer.businessName) {
    doc.text(customer.businessName, 14, yPos);
    yPos += 5;
  }
  doc.text(customer.phone, 14, yPos);
  yPos += 5;
  doc.text(`${customer.address.street}, ${customer.address.city}`, 14, yPos);
  yPos += 10;

  // Order items table
  const itemRows = order.items.map((item: any) => [
    `${item.brand} ${item.itemName}`,
    item.quantity,
    item.unit,
    formatAmountForPDF(item.unitPrice),
    formatAmountForPDF(item.totalPrice),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Qty', 'Unit', 'Unit Price', 'Total']],
    body: itemRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { valign: 'middle' },
      1: { halign: 'center', valign: 'middle' },
      2: { valign: 'middle' },
      3: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
      4: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Totals section
  const totalsX = pageWidth - 70;

  doc.setFontSize(10);
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(formatAmountForPDF(order.subtotal), pageWidth - 14, yPos, { align: 'right' });
  yPos += 6;

  if (order.discount > 0) {
    doc.text('Discount:', totalsX, yPos);
    doc.text(`-${formatAmountForPDF(order.discount)}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(formatAmountForPDF(order.total), pageWidth - 14, yPos, { align: 'right' });
  yPos += 8;

  doc.setFontSize(10);
  doc.text('Amount Paid:', totalsX, yPos);
  doc.text(formatAmountForPDF(order.amountPaid), pageWidth - 14, yPos, { align: 'right' });
  yPos += 6;

  if (order.balance > 0) {
    doc.setTextColor(231, 76, 60);
    doc.text('Balance Due:', totalsX, yPos);
    doc.text(formatAmountForPDF(order.balance), pageWidth - 14, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  addPDFFooter(doc);
  return doc;
}

// ============================================
// INVENTORY REPORT PDF
// ============================================

interface InventoryReportData {
  items: any[];
  stats: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  byCategory: Record<string, any[]>;
}

export function generateInventoryReport(data: InventoryReportData): jsPDF {
  const doc = new jsPDF('landscape');
  let yPos = addPDFHeader(doc, 'INVENTORY REPORT');

  yPos += 5;

  // Summary statistics
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Summary:', 14, yPos);
  yPos += 6;

  const statsData = [
    ['Total Items', data.stats.totalItems.toString()],
    ['Total Quantity', data.stats.totalQuantity.toString()],
    ['Total Value', formatAmountForPDF(data.stats.totalValue)],
    ['In Stock', data.stats.inStock.toString()],
    ['Low Stock', data.stats.lowStock.toString()],
    ['Out of Stock', data.stats.outOfStock.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: statsData,
    theme: 'striped',
    tableWidth: 100,
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', valign: 'middle' },
      1: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Inventory items table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory Items:', 14, yPos);
  yPos += 5;

  const itemRows = data.items.map(item => [
    item.itemName,
    item.brand,
    item.category,
    item.quantity,
    item.unit,
    formatAmountForPDF(item.unitPrice),
    formatAmountForPDF(item.quantity * item.unitPrice),
    item.status,
    item.location,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Brand', 'Category', 'Qty', 'Unit', 'Unit Price', 'Total Value', 'Status', 'Location']],
    body: itemRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { valign: 'middle' },
      1: { valign: 'middle' },
      2: { valign: 'middle' },
      3: { halign: 'center', valign: 'middle' },
      4: { valign: 'middle' },
      5: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
      6: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
      7: { valign: 'middle' },
      8: { valign: 'middle' },
    },
  });

  addPDFFooter(doc);
  return doc;
}

// ============================================
// EXPENSE REPORT PDF
// ============================================

interface ExpenseReportData {
  expenses: any[];
  dateRange?: { startDate?: string; endDate?: string };
  stats: {
    totalExpenses: number;
    paidExpenses: number;
    pendingExpenses: number;
    count: number;
    taxDeductible: number;
  };
  byCategory: Record<string, { count: number; total: number }>;
}

export function generateExpenseReport(data: ExpenseReportData): jsPDF {
  const doc = new jsPDF();
  const dateRangeText = data.dateRange?.startDate
    ? `${formatDate(new Date(data.dateRange.startDate))} to ${formatDate(new Date(data.dateRange.endDate || new Date()))}`
    : 'All Time';

  let yPos = addPDFHeader(doc, 'EXPENSE REPORT');

  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Period: ${dateRangeText}`, 14, yPos);
  yPos += 10;

  // Summary statistics
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Summary:', 14, yPos);
  yPos += 6;

  const statsData = [
    ['Total Expenses', formatAmountForPDF(data.stats.totalExpenses)],
    ['Paid Expenses', formatAmountForPDF(data.stats.paidExpenses)],
    ['Pending Expenses', formatAmountForPDF(data.stats.pendingExpenses)],
    ['Tax Deductible', formatAmountForPDF(data.stats.taxDeductible)],
    ['Number of Expenses', data.stats.count.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: statsData,
    theme: 'striped',
    styles: {
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100, valign: 'middle' },
      1: { halign: 'right', cellWidth: 'auto', cellPadding: { right: 5 }, valign: 'middle' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Category breakdown
  if (Object.keys(data.byCategory).length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('By Category:', 14, yPos);
    yPos += 5;

    const categoryRows = Object.entries(data.byCategory).map(([category, { count, total }]) => [
      category,
      count,
      formatAmountForPDF(total),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Count', 'Total Amount']],
      body: categoryRows,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      styles: {
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'middle'
      },
      columnStyles: {
        0: { valign: 'middle' },
        1: { halign: 'center', valign: 'middle' },
        2: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page for expense details
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  // Expense details table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Details:', 14, yPos);
  yPos += 5;

  const expenseRows = data.expenses.map(expense => [
    expense.expenseNumber,
    formatDate(expense.expenseDate),
    expense.category,
    expense.description.substring(0, 30) + (expense.description.length > 30 ? '...' : ''),
    expense.vendor.name,
    formatAmountForPDF(expense.amount),
    expense.status,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Expense #', 'Date', 'Category', 'Description', 'Vendor', 'Amount', 'Status']],
    body: expenseRows,
    theme: 'striped',
    headStyles: { fillColor: [155, 89, 182] },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle'
    },
    columnStyles: {
      0: { valign: 'middle' },
      1: { valign: 'middle' },
      2: { valign: 'middle' },
      3: { valign: 'middle' },
      4: { valign: 'middle' },
      5: { halign: 'right', cellPadding: { right: 5 }, valign: 'middle' },
      6: { valign: 'middle' },
    },
  });

  addPDFFooter(doc);
  return doc;
}
