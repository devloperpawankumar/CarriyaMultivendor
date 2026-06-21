/**
 * Simple script to test and view analytics data
 * 
 * Usage:
 *   node scripts/test-analytics.mjs <sellerId> [command]
 * 
 * Commands:
 *   view      - View analytics data (default)
 *   sync      - Check if analytics are in sync with orders
 *   backfill  - Backfill analytics from existing orders
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models and utilities
const { SellerDailyStats } = await import('../src/models/SellerDailyStats.js');
const { SellerProductStats } = await import('../src/models/SellerProductStats.js');
const { Order } = await import('../src/models/Order.js');
const { Product } = await import('../src/models/Product.js');
const { backfillSellerAnalytics } = await import('../src/utils/backfillAnalytics.js');
const { connectMongo } = await import('../src/db/mongoose.js');

// Connect to MongoDB
await connectMongo(process.env.MONGODB_URI);

// Get command line arguments
const sellerId = process.argv[2];
const command = process.argv[3] || 'view';

if (!sellerId) {
  console.error('❌ Please provide a seller ID');
  console.log('\nUsage: node scripts/test-analytics.mjs <sellerId> [command]');
  console.log('\nCommands:');
  console.log('  view      - View analytics data (default)');
  console.log('  sync      - Check if analytics are in sync');
  console.log('  backfill  - Backfill analytics from orders');
  process.exit(1);
}

if (!mongoose.Types.ObjectId.isValid(sellerId)) {
  console.error('❌ Invalid seller ID format');
  process.exit(1);
}

const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

// Execute command
switch (command) {
  case 'view':
    await viewAnalytics();
    break;
  case 'sync':
    await checkSync();
    break;
  case 'backfill':
    await runBackfill();
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    process.exit(1);
}

async function viewAnalytics() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SELLER ANALYTICS DATA');
  console.log('='.repeat(60));
  console.log(`Seller ID: ${sellerId}\n`);

  // Daily Stats
  console.log('📅 DAILY STATS (Last 10 days)');
  console.log('-'.repeat(60));
  const dailyStats = await SellerDailyStats.find({ sellerId: sellerObjectId })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  if (dailyStats.length === 0) {
    console.log('❌ No daily stats found');
    console.log('💡 Tip: Mark an order as "delivered" to create analytics data\n');
  } else {
    dailyStats.forEach((stat, i) => {
      const date = new Date(stat.date).toLocaleDateString();
      console.log(`${i + 1}. ${date}`);
      console.log(`   Sales: PKR ${(stat.totalSales || 0).toLocaleString()}`);
      console.log(`   Orders: ${stat.orderCount || 0}`);
      console.log(`   Refunds: ${stat.refundCount || 0}`);
      console.log(`   New Customers: ${stat.newCustomers || 0}`);
      console.log('');
    });
  }

  // Product Stats
  console.log('📦 PRODUCT STATS (Top 10 products)');
  console.log('-'.repeat(60));
  const productStats = await SellerProductStats.find({ sellerId: sellerObjectId })
    .sort({ quantitySold: -1 })
    .limit(10)
    .populate('productId', 'title')
    .lean();

  if (productStats.length === 0) {
    console.log('❌ No product stats found\n');
  } else {
    productStats.forEach((stat, i) => {
      const productName = stat.productId?.title || 'Unknown Product';
      console.log(`${i + 1}. ${productName}`);
      console.log(`   Quantity Sold: ${stat.quantitySold || 0}`);
      console.log(`   Total Sales: PKR ${(stat.totalSales || 0).toLocaleString()}`);
      console.log(`   Orders: ${stat.orderCount || 0}`);
      console.log('');
    });
  }

  // Recent Orders
  console.log('📋 RECENT ORDERS (Last 5)');
  console.log('-'.repeat(60));
  const orders = await Order.find({ sellerId: sellerObjectId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber status total createdAt deliveredAt')
    .lean();

  if (orders.length === 0) {
    console.log('❌ No orders found\n');
  } else {
    orders.forEach((order, i) => {
      const created = new Date(order.createdAt).toLocaleDateString();
      const delivered = order.deliveredAt 
        ? new Date(order.deliveredAt).toLocaleDateString()
        : 'Not delivered';
      const status = order.status === 'delivered' ? '✅' : '⏳';
      
      console.log(`${i + 1}. ${status} Order #${order.orderNumber}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: PKR ${(order.total || 0).toLocaleString()}`);
      console.log(`   Created: ${created}`);
      console.log(`   Delivered: ${delivered}`);
      console.log('');
    });
  }

  // Summary
  const totalDaily = await SellerDailyStats.countDocuments({ sellerId: sellerObjectId });
  const totalProduct = await SellerProductStats.countDocuments({ sellerId: sellerObjectId });
  const deliveredCount = await Order.countDocuments({ 
    sellerId: sellerObjectId, 
    status: 'delivered' 
  });

  console.log('📈 SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Daily Stats Records: ${totalDaily}`);
  console.log(`Product Stats Records: ${totalProduct}`);
  console.log(`Delivered Orders: ${deliveredCount}`);

  if (deliveredCount > 0 && totalDaily === 0) {
    console.log('\n⚠️  WARNING: You have delivered orders but no analytics!');
    console.log('💡 Run: node scripts/test-analytics.mjs ' + sellerId + ' backfill');
  }
}

async function checkSync() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 ANALYTICS SYNC CHECK');
  console.log('='.repeat(60));

  // From Analytics
  const dailyStats = await SellerDailyStats.find({ sellerId: sellerObjectId }).lean();
  const analyticsTotal = dailyStats.reduce((sum, stat) => sum + (stat.totalSales || 0), 0);
  const analyticsCount = dailyStats.reduce((sum, stat) => sum + (stat.orderCount || 0), 0);

  // From Orders
  const orders = await Order.find({ 
    sellerId: sellerObjectId, 
    status: 'delivered' 
  }).lean();
  const ordersTotal = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const ordersCount = orders.length;

  console.log('\nFrom Analytics Tables:');
  console.log(`  Total Sales: PKR ${analyticsTotal.toLocaleString()}`);
  console.log(`  Order Count: ${analyticsCount}`);

  console.log('\nFrom Orders Table:');
  console.log(`  Total Sales: PKR ${ordersTotal.toLocaleString()}`);
  console.log(`  Order Count: ${ordersCount}`);

  const salesDiff = Math.abs(analyticsTotal - ordersTotal);
  const countDiff = Math.abs(analyticsCount - ordersCount);

  console.log('\n' + '='.repeat(60));
  if (salesDiff < 1 && countDiff === 0) {
    console.log('✅ Analytics are IN SYNC!');
  } else {
    console.log('⚠️  Analytics are OUT OF SYNC!');
    if (salesDiff >= 1) {
      console.log(`   Sales Difference: PKR ${salesDiff.toLocaleString()}`);
    }
    if (countDiff > 0) {
      console.log(`   Order Count Difference: ${countDiff}`);
    }
    console.log('\n💡 Run backfill to sync:');
    console.log(`   node scripts/test-analytics.mjs ${sellerId} backfill`);
  }
}

async function runBackfill() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 BACKFILLING ANALYTICS');
  console.log('='.repeat(60));
  console.log(`Seller ID: ${sellerId}\n`);

  try {
    const result = await backfillSellerAnalytics(sellerId);
    console.log('\n✅ Backfill completed!');
    console.log(`   Daily Stats: ${result.dailyStats}`);
    console.log(`   Product Stats: ${result.productStats}`);
    console.log('\n💡 View results:');
    console.log(`   node scripts/test-analytics.mjs ${sellerId} view`);
  } catch (error) {
    console.error('\n❌ Backfill failed:', error.message);
    process.exit(1);
  }
}

// Close connection
await mongoose.connection.close();
console.log('\n✅ Done!\n');

