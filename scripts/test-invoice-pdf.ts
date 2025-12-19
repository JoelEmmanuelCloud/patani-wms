import { generateOrderInvoice } from '../lib/utils/pdf-generators';

// Mock order data for testing
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
    {
      brand: 'Honeywell',
      itemName: 'Semovita 10kg',
      quantity: 200,
      unit: 'Packs',
      unitPrice: 6500,
      totalPrice: 1300000,
    },
  ],
  subtotal: 3150000,
  discount: 150000,
  total: 3000000,
  amountPaid: 2000000,
  balance: 1000000,
};

// Mock customer data for testing
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

// Generate and save the test invoice
console.log('Generating test invoice PDF...');
const pdf = generateOrderInvoice(mockOrder, mockCustomer);

// Save the PDF
pdf.save('test-invoice.pdf');

console.log('✓ Test invoice PDF generated successfully!');
console.log('  File: test-invoice.pdf');
console.log('');
console.log('Expected results:');
console.log('  1. Invoice date should be right-aligned on the same line as Invoice #');
console.log('  2. All amounts should display with Nigerian Naira symbol (₦)');
console.log('  3. Totals section should be right-aligned');
console.log('  4. Layout should not overlay or overlap');
