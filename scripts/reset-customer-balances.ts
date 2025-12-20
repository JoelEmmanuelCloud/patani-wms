/**
 * Migration Script: Reset Customer Balances to Zero
 *
 * This script resets all customer balances to 0 as part of the migration
 * from the debt-based system to the wallet-based system.
 *
 * Run this script BEFORE deploying the new wallet system changes.
 */

// Load environment variables FIRST before any other imports
require('dotenv').config({ path: '.env.local' });

async function resetCustomerBalances() {
  try {
    // Dynamic imports after env is loaded
    const { default: connectDB } = await import('../lib/db/mongodb');
    const { default: Customer } = await import('../lib/models/Customer');

    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🔄 Resetting all customer balances to 0...');
    const result = await Customer.updateMany({}, { balance: 0 });

    console.log(`✅ Successfully reset ${result.modifiedCount} customer balances to 0`);
    console.log(`   Total customers matched: ${result.matchedCount}`);

    // Verify the update
    const customersWithBalance = await Customer.countDocuments({ balance: { $ne: 0 } });

    if (customersWithBalance === 0) {
      console.log('✅ Verification passed: All customer balances are now 0');
    } else {
      console.warn(`⚠️  Warning: ${customersWithBalance} customers still have non-zero balances`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

resetCustomerBalances();
