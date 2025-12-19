import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import Customer from '../lib/models/Customer';
import Inventory from '../lib/models/Inventory';
import Order from '../lib/models/Order';
import Payment from '../lib/models/Payment';
import Expense from '../lib/models/Expense';
import Tax from '../lib/models/Tax';

// Helper function to get random element from array
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date in past days
const getRandomDate = (daysBack: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomNumber(0, daysBack));
  return date;
};

// Mock data generators
const nigerianFirstNames = [
  'Chioma', 'Adebayo', 'Ngozi', 'Emeka', 'Fatima', 'Ibrahim', 'Amina', 'Chukwudi',
  'Blessing', 'Oluwaseun', 'Musa', 'Aisha', 'Tunde', 'Chinwe', 'Yusuf', 'Zainab',
  'Babatunde', 'Chiamaka', 'Abdullahi', 'Nneka', 'Aliyu', 'Ifeoma', 'Bello', 'Ogechi'
];

const nigerianLastNames = [
  'Okonkwo', 'Adeyemi', 'Muhammad', 'Okoro', 'Bello', 'Eze', 'Sani', 'Nwosu',
  'Ibrahim', 'Okafor', 'Hassan', 'Onyema', 'Abubakar', 'Chukwu', 'Yusuf', 'Nnadi',
  'Aliyu', 'Obiora', 'Usman', 'Ikenna', 'Musa', 'Chikezie', 'Garba', 'Obi'
];

const nigerianCities = [
  'Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Kaduna',
  'Enugu', 'Onitsha', 'Warri', 'Aba', 'Jos', 'Ilorin', 'Calabar', 'Akure'
];

const nigerianStates = [
  'Lagos', 'Kano', 'Oyo', 'FCT', 'Rivers', 'Edo', 'Kaduna', 'Enugu', 'Anambra',
  'Delta', 'Abia', 'Plateau', 'Kwara', 'Cross River', 'Ondo'
];

const businessNames = [
  'Golden Harvest Ventures', 'Metro Trading Company', 'Sunrise Commodities',
  'Eagle Eye Distributors', 'Prime Goods Limited', 'Royal Merchants',
  'City Center Mart', 'Diamond Trading Co.', 'Unity Foodstuff',
  'Crown Distributors', 'Pacific Trade Links', 'Atlas Commodities',
  'Zenith Supplies', 'Premier Wholesale', 'Victory Trading'
];

const riceProducts = [
  { name: 'Long Grain Parboiled Rice', brand: 'Royal Stallion', price: 42000 },
  { name: 'Basmati Rice', brand: 'India Gate', price: 38000 },
  { name: 'Thai Jasmine Rice', brand: 'Golden Phoenix', price: 45000 },
  { name: 'White Rice', brand: 'Mama Gold', price: 35000 },
  { name: 'Brown Rice', brand: 'Uncle Bens', price: 40000 },
];

const spaghettiProducts = [
  { name: 'Spaghetti', brand: 'Golden Penny', price: 8500 },
  { name: 'Spaghetti', brand: 'Dangote', price: 8200 },
  { name: 'Spaghetti', brand: 'Honeywell', price: 8800 },
  { name: 'Macaroni', brand: 'Golden Penny', price: 9000 },
];

const oilProducts = [
  { name: 'Vegetable Oil', brand: 'Kings Oil', price: 52000 },
  { name: 'Groundnut Oil', brand: 'Grand Pure', price: 58000 },
  { name: 'Palm Oil', brand: 'Devon Kings', price: 48000 },
  { name: 'Sunflower Oil', brand: 'Mamador', price: 55000 },
];

const beansProducts = [
  { name: 'Brown Beans', brand: 'Best Quality', price: 42000 },
  { name: 'White Beans', brand: 'Premium Grade', price: 45000 },
  { name: 'Black Beans', brand: 'Top Choice', price: 40000 },
];

const indomieProducts = [
  { name: 'Indomie Chicken Flavor', brand: 'Indomie', price: 6500 },
  { name: 'Indomie Onion Chicken', brand: 'Indomie', price: 6500 },
  { name: 'Indomie Jollof', brand: 'Indomie', price: 7000 },
  { name: 'Indomie Relish', brand: 'Indomie', price: 7200 },
];

const otherProducts = [
  { name: 'Tomato Paste', brand: 'Gino', price: 4500 },
  { name: 'Semovita', brand: 'Golden Penny', price: 3800 },
  { name: 'Cornflakes', brand: 'Kellogs', price: 5200 },
  { name: 'Milk Powder', brand: 'Peak', price: 8500 },
  { name: 'Sugar', brand: 'Dangote', price: 35000 },
];

// Seed functions
async function seedCustomers() {
  console.log('Seeding customers...');
  const customers = [];

  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(nigerianFirstNames);
    const lastName = getRandomElement(nigerianLastNames);
    const customerType = getRandomElement(['Retail', 'Wholesale', 'Distributor', 'Individual']);
    const isBusinessCustomer = customerType !== 'Individual';

    const balance = getRandomNumber(0, 500000);
    const creditLimit = customerType === 'Wholesale' || customerType === 'Distributor'
      ? getRandomNumber(100000, 2000000)
      : getRandomNumber(0, 500000);

    customers.push({
      name: `${firstName} ${lastName}`,
      phone: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`,
      email: Math.random() > 0.3 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com` : undefined,
      address: {
        street: `${getRandomNumber(1, 200)} ${getRandomElement(['Main', 'Market', 'Trade', 'Commerce', 'Station'])} Road`,
        city: getRandomElement(nigerianCities),
        state: getRandomElement(nigerianStates),
        country: 'Nigeria'
      },
      businessName: isBusinessCustomer ? getRandomElement(businessNames) : undefined,
      customerType,
      balance,
      creditLimit,
      status: getRandomElement(['Active', 'Active', 'Active', 'Active', 'Inactive', 'Suspended']),
      totalOrders: getRandomNumber(0, 50),
      totalPurchases: getRandomNumber(100000, 10000000),
      lastOrderDate: Math.random() > 0.2 ? getRandomDate(90) : undefined,
      notes: Math.random() > 0.7 ? 'Reliable customer with good payment history' : undefined
    });
  }

  await Customer.insertMany(customers);
  console.log(`✓ Created ${customers.length} customers`);
}

async function seedInventory() {
  console.log('Seeding inventory...');
  const inventory = [];
  const locations = ['Warehouse A-01', 'Warehouse A-02', 'Warehouse B-01', 'Warehouse B-02', 'Storage C-01'];

  // Add rice products
  riceProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Rice',
      unit: 'Bag',
      quantity: getRandomNumber(50, 500),
      unitPrice: product.price,
      reorderLevel: 20,
      location: getRandomElement(locations),
      supplier: {
        name: getRandomElement(['Global Imports Ltd', 'Prime Suppliers', 'International Trade Co.']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  // Add spaghetti products
  spaghettiProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Spaghetti',
      unit: 'Carton',
      quantity: getRandomNumber(100, 800),
      unitPrice: product.price,
      reorderLevel: 50,
      location: getRandomElement(locations),
      supplier: {
        name: getRandomElement(['Pasta Distributors', 'Food Suppliers Ltd', 'Metro Wholesale']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  // Add oil products
  oilProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Oil',
      unit: 'Gallon',
      quantity: getRandomNumber(30, 300),
      unitPrice: product.price,
      reorderLevel: 15,
      location: getRandomElement(locations),
      supplier: {
        name: getRandomElement(['Oil Mills Nigeria', 'Refined Products Ltd', 'Edible Oils Co.']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  // Add beans products
  beansProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Beans',
      unit: 'Bag',
      quantity: getRandomNumber(40, 400),
      unitPrice: product.price,
      reorderLevel: 20,
      location: getRandomElement(locations),
      supplier: {
        name: getRandomElement(['Farm Produce Ltd', 'Grains & Legumes Co.', 'Agricultural Traders']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  // Add Indomie products
  indomieProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Indomie',
      unit: 'Carton',
      quantity: getRandomNumber(200, 1000),
      unitPrice: product.price,
      reorderLevel: 100,
      location: getRandomElement(locations),
      supplier: {
        name: 'Indomie Distributors Ltd',
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  // Add other products
  otherProducts.forEach(product => {
    inventory.push({
      itemName: product.name,
      brand: product.brand,
      category: 'Other',
      unit: getRandomElement(['Carton', 'Bag', 'Pieces']),
      quantity: getRandomNumber(50, 500),
      unitPrice: product.price,
      reorderLevel: 25,
      location: getRandomElement(locations),
      supplier: {
        name: getRandomElement(['General Suppliers', 'Food Products Ltd', 'Wholesale Merchants']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      }
    });
  });

  await Inventory.insertMany(inventory);
  console.log(`✓ Created ${inventory.length} inventory items`);
}

async function seedOrders() {
  console.log('Seeding orders...');

  const customers = await Customer.find({ status: 'Active' });
  const inventoryItems = await Inventory.find();

  if (customers.length === 0 || inventoryItems.length === 0) {
    console.log('⚠ Skipping orders - no customers or inventory found');
    return;
  }

  const orders = [];

  for (let i = 0; i < 100; i++) {
    const customer = getRandomElement(customers);
    const itemCount = getRandomNumber(1, 5);
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const item = getRandomElement(inventoryItems);
      const quantity = getRandomNumber(1, 20);
      const unitPrice = item.unitPrice;
      const totalPrice = quantity * unitPrice;

      orderItems.push({
        inventory: item._id,
        itemName: item.itemName,
        brand: item.brand,
        unit: item.unit,
        quantity,
        unitPrice,
        totalPrice
      });

      subtotal += totalPrice;
    }

    const discount = Math.random() > 0.7 ? getRandomNumber(0, subtotal * 0.1) : 0;
    const tax = subtotal * 0.075; // 7.5% VAT
    const total = subtotal - discount + tax;
    const amountPaid = Math.random() > 0.3 ? getRandomNumber(0, total) : 0;

    const status = getRandomElement(['Pending', 'Processing', 'Completed', 'Completed', 'Completed']);
    const deliveryStatus = status === 'Completed'
      ? 'Delivered'
      : getRandomElement(['Not Dispatched', 'In Transit']);

    orders.push({
      orderNumber: `ORD-${Date.now()}-${i.toString().padStart(4, '0')}`,
      customer: customer._id,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      amountPaid,
      status,
      deliveryStatus,
      deliveryAddress: `${customer.address.street}, ${customer.address.city}, ${customer.address.state}`,
      deliveryDate: status === 'Completed' ? getRandomDate(60) : undefined,
      notes: Math.random() > 0.7 ? 'Customer requested urgent delivery' : undefined,
      createdBy: getRandomElement(['Admin', 'Sales Rep 1', 'Sales Rep 2', 'Manager']),
      createdAt: getRandomDate(90)
    });
  }

  await Order.insertMany(orders);
  console.log(`✓ Created ${orders.length} orders`);
}

async function seedPayments() {
  console.log('Seeding payments...');

  const customers = await Customer.find();
  const orders = await Order.find({ paymentStatus: { $in: ['Unpaid', 'Partial'] } });

  if (customers.length === 0) {
    console.log('⚠ Skipping payments - no customers found');
    return;
  }

  const payments = [];

  // Create payments for some orders
  for (let i = 0; i < Math.min(50, orders.length); i++) {
    const order = orders[i];
    const amount = getRandomNumber(order.balance * 0.3, order.balance);

    payments.push({
      paymentNumber: `PAY-${Date.now()}-${i.toString().padStart(4, '0')}`,
      customer: order.customer,
      order: order._id,
      amount,
      paymentMethod: getRandomElement(['Cash', 'Bank Transfer', 'POS', 'Mobile Money', 'Cheque']),
      paymentDate: getRandomDate(30),
      referenceNumber: Math.random() > 0.5 ? `REF${getRandomNumber(100000, 999999)}` : undefined,
      bankName: Math.random() > 0.5 ? getRandomElement(['GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Access Bank']) : undefined,
      status: getRandomElement(['Confirmed', 'Confirmed', 'Confirmed', 'Pending']),
      receivedBy: getRandomElement(['Cashier 1', 'Cashier 2', 'Accountant', 'Manager']),
      createdAt: getRandomDate(30)
    });
  }

  // Create standalone payments (debt repayment)
  for (let i = 0; i < 30; i++) {
    const customer = getRandomElement(customers);

    payments.push({
      paymentNumber: `PAY-${Date.now()}-${(i + 50).toString().padStart(4, '0')}`,
      customer: customer._id,
      amount: getRandomNumber(10000, 500000),
      paymentMethod: getRandomElement(['Cash', 'Bank Transfer', 'POS', 'Mobile Money']),
      paymentDate: getRandomDate(60),
      referenceNumber: Math.random() > 0.5 ? `REF${getRandomNumber(100000, 999999)}` : undefined,
      bankName: Math.random() > 0.5 ? getRandomElement(['GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Access Bank']) : undefined,
      notes: 'Account balance payment',
      status: 'Confirmed',
      receivedBy: getRandomElement(['Cashier 1', 'Cashier 2', 'Accountant']),
      createdAt: getRandomDate(60)
    });
  }

  await Payment.insertMany(payments);
  console.log(`✓ Created ${payments.length} payments`);
}

async function seedExpenses() {
  console.log('Seeding expenses...');

  const expenseCategories = [
    { category: 'Transportation', desc: 'Delivery truck fuel and maintenance', amount: [15000, 80000] },
    { category: 'Utilities', desc: 'Electricity and water bills', amount: [50000, 150000] },
    { category: 'Salaries', desc: 'Monthly staff salaries', amount: [500000, 2000000] },
    { category: 'Rent', desc: 'Warehouse rent', amount: [300000, 800000] },
    { category: 'Maintenance', desc: 'Equipment and facility maintenance', amount: [20000, 100000] },
    { category: 'Loading/Offloading', desc: 'Loading and offloading charges', amount: [5000, 30000] },
    { category: 'Security', desc: 'Security services', amount: [40000, 120000] },
    { category: 'Fuel', desc: 'Generator and vehicle fuel', amount: [30000, 150000] },
    { category: 'Office Supplies', desc: 'Stationery and office materials', amount: [10000, 50000] },
  ];

  const expenses = [];

  for (let i = 0; i < 80; i++) {
    const expenseType = getRandomElement(expenseCategories);
    const amount = getRandomNumber(expenseType.amount[0], expenseType.amount[1]);

    expenses.push({
      expenseNumber: `EXP-${Date.now()}-${i.toString().padStart(4, '0')}`,
      category: expenseType.category,
      description: expenseType.desc,
      amount,
      vendor: {
        name: getRandomElement(['Vendor A', 'Vendor B', 'Service Provider Ltd', 'Utility Company', 'Transport Services']),
        contact: `0${getRandomNumber(700, 909)}${getRandomNumber(1000000, 9999999)}`
      },
      paymentMethod: getRandomElement(['Cash', 'Bank Transfer', 'Cheque', 'POS']),
      expenseDate: getRandomDate(90),
      referenceNumber: Math.random() > 0.5 ? `REF${getRandomNumber(100000, 999999)}` : undefined,
      invoiceNumber: Math.random() > 0.5 ? `INV${getRandomNumber(1000, 9999)}` : undefined,
      status: getRandomElement(['Paid', 'Paid', 'Paid', 'Approved', 'Pending']),
      taxDeductible: Math.random() > 0.5,
      recordedBy: getRandomElement(['Accountant', 'Manager', 'Finance Officer']),
      createdAt: getRandomDate(90)
    });
  }

  await Expense.insertMany(expenses);
  console.log(`✓ Created ${expenses.length} expenses`);
}

async function seedTaxes() {
  console.log('Seeding taxes...');

  const currentYear = new Date().getFullYear();
  const taxes = [];

  // VAT records (monthly)
  for (let month = 1; month <= 12; month++) {
    const taxableAmount = getRandomNumber(5000000, 20000000);
    const taxRate = 7.5;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const dueDate = new Date(currentYear, month, 21);
    const isPaid = month < new Date().getMonth();

    taxes.push({
      taxNumber: `TAX-VAT-${currentYear}-${month.toString().padStart(2, '0')}`,
      taxType: 'VAT',
      taxPeriod: { month, year: currentYear },
      taxableAmount,
      taxRate,
      taxAmount,
      dueDate,
      paymentDate: isPaid ? new Date(currentYear, month, getRandomNumber(15, 20)) : undefined,
      status: isPaid ? 'Paid' : 'Pending',
      paymentReference: isPaid ? `VAT${getRandomNumber(100000, 999999)}` : undefined,
      paymentMethod: isPaid ? getRandomElement(['Bank Transfer', 'Online Payment']) : undefined,
      receiptNumber: isPaid ? `RCT${getRandomNumber(10000, 99999)}` : undefined,
      recordedBy: 'Accountant',
      createdAt: new Date(currentYear, month - 1, 1)
    });
  }

  // Company Income Tax (quarterly)
  for (let quarter = 1; quarter <= 4; quarter++) {
    const taxableAmount = getRandomNumber(10000000, 50000000);
    const taxRate = 30;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const dueMonth = quarter * 3;
    const dueDate = new Date(currentYear, dueMonth, 1);
    const isPaid = quarter < Math.ceil(new Date().getMonth() / 3);

    taxes.push({
      taxNumber: `TAX-CIT-${currentYear}-Q${quarter}`,
      taxType: 'Company Income Tax',
      taxPeriod: { quarter, year: currentYear },
      taxableAmount,
      taxRate,
      taxAmount,
      dueDate,
      paymentDate: isPaid ? new Date(currentYear, dueMonth - 1, getRandomNumber(20, 28)) : undefined,
      status: isPaid ? 'Paid' : 'Pending',
      paymentReference: isPaid ? `CIT${getRandomNumber(100000, 999999)}` : undefined,
      paymentMethod: isPaid ? 'Bank Transfer' : undefined,
      filingReference: isPaid ? `FIL${getRandomNumber(100000, 999999)}` : undefined,
      recordedBy: 'Finance Manager',
      createdAt: new Date(currentYear, (quarter - 1) * 3, 1)
    });
  }

  // Withholding Tax
  for (let i = 0; i < 6; i++) {
    const taxableAmount = getRandomNumber(1000000, 10000000);
    const taxRate = 10;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const month = getRandomNumber(1, 12);

    taxes.push({
      taxNumber: `TAX-WHT-${currentYear}-${i.toString().padStart(3, '0')}`,
      taxType: 'WHT',
      taxPeriod: { month, year: currentYear },
      taxableAmount,
      taxRate,
      taxAmount,
      dueDate: new Date(currentYear, month, 21),
      paymentDate: new Date(currentYear, month, getRandomNumber(10, 20)),
      status: 'Paid',
      paymentReference: `WHT${getRandomNumber(100000, 999999)}`,
      paymentMethod: 'Bank Transfer',
      recordedBy: 'Accountant',
      createdAt: new Date(currentYear, month - 1, 5)
    });
  }

  await Tax.insertMany(taxes);
  console.log(`✓ Created ${taxes.length} tax records`);
}

// Main seed function
async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Customer.deleteMany({});
    await Inventory.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Expense.deleteMany({});
    await Tax.deleteMany({});
    console.log('✓ Cleared all collections\n');

    // Seed all collections
    await seedCustomers();
    await seedInventory();
    await seedOrders();
    await seedPayments();
    await seedExpenses();
    await seedTaxes();

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Customers: ${await Customer.countDocuments()}`);
    console.log(`- Inventory: ${await Inventory.countDocuments()}`);
    console.log(`- Orders: ${await Order.countDocuments()}`);
    console.log(`- Payments: ${await Payment.countDocuments()}`);
    console.log(`- Expenses: ${await Expense.countDocuments()}`);
    console.log(`- Taxes: ${await Tax.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seed
seed();
