/**
 * Migration Script: Fix Wallet Calculation
 *
 * Wallet should ONLY have money when ALL debt is paid.
 * If there's any debt, wallet = 0.
 */

// Load environment variables FIRST before any other imports
require('dotenv').config({ path: '.env.local' });

async function fixWalletCalculation() {
  try {
    // Dynamic imports after env is loaded
    const { default: connectDB } = await import('../lib/db/mongodb');
    const { default: Customer } = await import('../lib/models/Customer');
    const { default: Order } = await import('../lib/models/Order');
    const { default: Payment } = await import('../lib/models/Payment');

    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🔄 Fixing wallet calculations for all customers...');

    // Get all customers
    const customers = await Customer.find({});

    let fixed = 0;
    for (const customer of customers) {
      // Get all payments for this customer
      const allPayments = await Payment.find({ customer: customer._id });
      const totalPayments = allPayments.reduce((sum, p) => sum + p.amount, 0);

      // Get all orders for this customer
      const allOrders = await Order.find({ customer: customer._id });
      const totalOrderDebt = allOrders.reduce((sum, o) => sum + o.balance, 0);

      // Calculate total debt
      const totalDebt = customer.oldBalanceRemaining + totalOrderDebt;

      // Wallet ONLY has money when ALL debt is paid
      let walletBalance = 0;
      if (totalDebt === 0) {
        // All debt paid, excess goes to wallet
        walletBalance = totalPayments - customer.oldBalance;
      }

      // Update customer wallet
      customer.balance = Math.max(0, walletBalance);
      await customer.save();

      fixed++;
    }

    console.log(`✅ Successfully fixed ${fixed} customer wallets`);
    console.log(`   Wallet now correctly shows 0 when there's any debt`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixWalletCalculation();
