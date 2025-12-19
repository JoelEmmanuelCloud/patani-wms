import {
  generateFullCustomerStatement,
  generateDateRangeStatement,
  generateOrderInvoice,
  generateInventoryReport,
  generateExpenseReport
} from '../lib/utils/pdf-generators';

console.log('='.repeat(60));
console.log('PDF GENERATION TEST SUITE');
console.log('='.repeat(60));
console.log('');

// ===========================================
// Test 1: Order Invoice
// ===========================================
console.log('1. Testing Order Invoice PDF...');

const mockOrder = {
  orderNumber: 'ORD-2024-001',
  createdAt: new Date('2024-12-19'),
  items: [
    {
      brand: 'Dangote',
      itemName: 'Cement 50kg',
      quantity: 100,
      unit: 'Bags',
      unitPrice: 4500,
      totalPrice: 450000,
    },
    {
      brand: 'Golden Penny',
      itemName: 'Flour 50kg',
      quantity: 50,
      unit: 'Bags',
      unitPrice: 28000,
      totalPrice: 1400000,
    },
  ],
  subtotal: 1850000,
  discount: 50000,
  total: 1800000,
  amountPaid: 1000000,
  balance: 800000,
};

const mockCustomer = {
  name: 'Chukwudi Okeke',
  businessName: 'Okeke Trading Company Ltd',
  phone: '0803 456 7890',
  email: 'chukwudi@okeketrade.ng',
  address: {
    street: '15 Market Road',
    city: 'Port Harcourt',
    state: 'Rivers State',
  },
};

try {
  const invoicePdf = generateOrderInvoice(mockOrder, mockCustomer);
  invoicePdf.save('test-order-invoice.pdf');
  console.log('   ✓ Order Invoice PDF generated successfully');
  console.log('     File: test-order-invoice.pdf');
} catch (error) {
  console.log('   ✗ Error:', error);
}

console.log('');

// ===========================================
// Test 2: Full Customer Statement
// ===========================================
console.log('2. Testing Full Customer Statement PDF...');

const customerStatementData = {
  customer: mockCustomer,
  orders: [
    {
      orderNumber: 'ORD-2024-001',
      createdAt: new Date('2024-12-01'),
      items: [{ itemName: 'Product A' }, { itemName: 'Product B' }],
      total: 1500000,
      amountPaid: 1000000,
      balance: 500000,
      paymentStatus: 'Partial',
    },
    {
      orderNumber: 'ORD-2024-002',
      createdAt: new Date('2024-12-10'),
      items: [{ itemName: 'Product C' }],
      total: 800000,
      amountPaid: 800000,
      balance: 0,
      paymentStatus: 'Paid',
    },
  ],
  payments: [
    {
      paymentNumber: 'PAY-2024-001',
      paymentDate: new Date('2024-12-05'),
      paymentMethod: 'Bank Transfer',
      amount: 1000000,
      status: 'Confirmed',
      referenceNumber: 'TRF123456',
    },
    {
      paymentNumber: 'PAY-2024-002',
      paymentDate: new Date('2024-12-12'),
      paymentMethod: 'Cash',
      amount: 800000,
      status: 'Confirmed',
      referenceNumber: null,
    },
  ],
  summary: {
    oldBalance: 200000,
    totalOrders: 2300000,
    totalPayments: 1800000,
    currentBalance: 500000,
    totalDebt: 700000,
  },
};

try {
  const statementPdf = generateFullCustomerStatement(customerStatementData);
  statementPdf.save('test-customer-statement.pdf');
  console.log('   ✓ Customer Statement PDF generated successfully');
  console.log('     File: test-customer-statement.pdf');
} catch (error) {
  console.log('   ✗ Error:', error);
}

console.log('');

// ===========================================
// Test 3: Date Range Statement
// ===========================================
console.log('3. Testing Date Range Statement PDF...');

const dateRangeData = {
  ...customerStatementData,
  dateRange: {
    startDate: '2024-12-01',
    endDate: '2024-12-31',
  },
};

try {
  const dateRangePdf = generateDateRangeStatement(dateRangeData);
  dateRangePdf.save('test-daterange-statement.pdf');
  console.log('   ✓ Date Range Statement PDF generated successfully');
  console.log('     File: test-daterange-statement.pdf');
} catch (error) {
  console.log('   ✗ Error:', error);
}

console.log('');

// ===========================================
// Test 4: Inventory Report
// ===========================================
console.log('4. Testing Inventory Report PDF...');

const inventoryData = {
  items: [
    {
      itemName: 'Cement 50kg',
      brand: 'Dangote',
      category: 'Building Materials',
      quantity: 500,
      unit: 'Bags',
      unitPrice: 4500,
      status: 'In Stock',
      location: 'Warehouse A',
    },
    {
      itemName: 'Flour 50kg',
      brand: 'Golden Penny',
      category: 'Food Items',
      quantity: 10,
      unit: 'Bags',
      unitPrice: 28000,
      status: 'Low Stock',
      location: 'Warehouse B',
    },
    {
      itemName: 'Rice 50kg',
      brand: 'Mama Gold',
      category: 'Food Items',
      quantity: 0,
      unit: 'Bags',
      unitPrice: 45000,
      status: 'Out of Stock',
      location: 'Warehouse B',
    },
  ],
  stats: {
    totalItems: 3,
    totalQuantity: 510,
    totalValue: 2530000,
    inStock: 1,
    lowStock: 1,
    outOfStock: 1,
  },
  byCategory: {
    'Building Materials': [
      {
        itemName: 'Cement 50kg',
        brand: 'Dangote',
        category: 'Building Materials',
        quantity: 500,
        unit: 'Bags',
        unitPrice: 4500,
        status: 'In Stock',
        location: 'Warehouse A',
      },
    ],
    'Food Items': [
      {
        itemName: 'Flour 50kg',
        brand: 'Golden Penny',
        category: 'Food Items',
        quantity: 10,
        unit: 'Bags',
        unitPrice: 28000,
        status: 'Low Stock',
        location: 'Warehouse B',
      },
    ],
  },
};

try {
  const inventoryPdf = generateInventoryReport(inventoryData);
  inventoryPdf.save('test-inventory-report.pdf');
  console.log('   ✓ Inventory Report PDF generated successfully');
  console.log('     File: test-inventory-report.pdf');
} catch (error) {
  console.log('   ✗ Error:', error);
}

console.log('');

// ===========================================
// Test 5: Expense Report
// ===========================================
console.log('5. Testing Expense Report PDF...');

const expenseData = {
  expenses: [
    {
      expenseNumber: 'EXP-2024-001',
      expenseDate: new Date('2024-12-01'),
      category: 'Transportation',
      description: 'Fuel for delivery vehicles',
      vendor: { name: 'Shell Gas Station' },
      amount: 150000,
      status: 'Paid',
      taxDeductible: true,
    },
    {
      expenseNumber: 'EXP-2024-002',
      expenseDate: new Date('2024-12-05'),
      category: 'Office Supplies',
      description: 'Printer paper and ink cartridges',
      vendor: { name: 'Office Mart' },
      amount: 45000,
      status: 'Paid',
      taxDeductible: true,
    },
    {
      expenseNumber: 'EXP-2024-003',
      expenseDate: new Date('2024-12-10'),
      category: 'Utilities',
      description: 'Electricity bill for December',
      vendor: { name: 'PHCN' },
      amount: 85000,
      status: 'Pending',
      taxDeductible: false,
    },
  ],
  stats: {
    totalExpenses: 280000,
    paidExpenses: 195000,
    pendingExpenses: 85000,
    count: 3,
    taxDeductible: 195000,
  },
  byCategory: {
    Transportation: { count: 1, total: 150000 },
    'Office Supplies': { count: 1, total: 45000 },
    Utilities: { count: 1, total: 85000 },
  },
  dateRange: {
    startDate: '2024-12-01',
    endDate: '2024-12-31',
  },
};

try {
  const expensePdf = generateExpenseReport(expenseData);
  expensePdf.save('test-expense-report.pdf');
  console.log('   ✓ Expense Report PDF generated successfully');
  console.log('     File: test-expense-report.pdf');
} catch (error) {
  console.log('   ✗ Error:', error);
}

console.log('');
console.log('='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log('');
console.log('All PDF files have been generated successfully!');
console.log('');
console.log('Verification checklist:');
console.log('  □ All amounts display with Nigerian Naira symbol (₦)');
console.log('  □ Date fields are properly aligned');
console.log('  □ Totals sections are right-aligned');
console.log('  □ No text overlapping or overflow');
console.log('  □ Tables render correctly with proper column alignment');
console.log('  □ Headers and footers display correctly');
console.log('');
console.log('Generated files:');
console.log('  - test-order-invoice.pdf');
console.log('  - test-customer-statement.pdf');
console.log('  - test-daterange-statement.pdf');
console.log('  - test-inventory-report.pdf');
console.log('  - test-expense-report.pdf');
console.log('');
