/**
 * Migration Script: Set oldBalanceRemaining for All Customers
 *
 * This script sets oldBalanceRemaining = oldBalance for all existing customers.
 * oldBalance is static (display only), oldBalanceRemaining is dynamic (can be paid down).
 */

// Load environment variables FIRST before any other imports
require('dotenv').config({ path: '.env.local' });

async function migrateOldBalanceRemaining() {
  try {
    // Dynamic imports after env is loaded
    const { default: connectDB } = await import('../lib/db/mongodb');
    const { default: Customer } = await import('../lib/models/Customer');

    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🔄 Setting oldBalanceRemaining = oldBalance for all customers...');

    // Get all customers
    const customers = await Customer.find({});

    let updated = 0;
    for (const customer of customers) {
      // Set oldBalanceRemaining to match oldBalance
      customer.oldBalanceRemaining = customer.oldBalance || 0;
      await customer.save();
      updated++;
    }

    console.log(`✅ Successfully updated ${updated} customers`);
    console.log(`   oldBalanceRemaining set to match oldBalance`);

    // Verify the update
    const customersWithMismatch = await Customer.countDocuments({
      $expr: { $ne: ['$oldBalance', '$oldBalanceRemaining'] }
    });

    if (customersWithMismatch === 0) {
      console.log('✅ Verification passed: All customers have matching oldBalanceRemaining');
    } else {
      console.warn(`⚠️  Warning: ${customersWithMismatch} customers have mismatched values`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateOldBalanceRemaining();
