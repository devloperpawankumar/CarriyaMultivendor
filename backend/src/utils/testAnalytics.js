import mongoose from 'mongoose';
import { SellerDailyStats } from '../models/SellerDailyStats.js';
import { SellerProductStats } from '../models/SellerProductStats.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

/**
 * Test utility to view and understand analytics data
 * Usage: node -e "import('./src/utils/testAnalytics.js').then(m => m.viewAnalytics('SELLER_ID'))"
 */

/**
 * View all analytics data for a seller
 */
export async function viewAnalytics(sellerId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      console.error('Invalid sellerId:', sellerId);
      return;
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    console.log('\n=== SELLER ANALYTICS DATA ===\n');
    console.log('Seller ID:', sellerId);
    console.log('='.repeat(50));

    // 1. View Daily Stats
    console.log('\n📊 DAILY STATS (SellerDailyStats)');
    console.log('-'.repeat(50));
    
    const dailyStats = await SellerDailyStats.find({ sellerId: sellerObjectId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    if (dailyStats.length === 0) {
      console.log('❌ No daily stats found. Analytics will be calculated from orders.');
      console.log('💡 Tip: Create an order and mark it as "delivered" to populate analytics.');
    } else {
      console.log(`✅ Found ${dailyStats.length} daily stat records (showing last 10):\n`);
      dailyStats.forEach((stat, index) => {
        console.log(`${index + 1}. Date: ${stat.date.toISOString().split('T')[0]}`);
        console.log(`   - Total Sales: PKR ${stat.totalSales || 0}`);
        console.log(`   - Order Count: ${stat.orderCount || 0}`);
        console.log(`   - Refund Count: ${stat.refundCount || 0}`);
        console.log(`   - New Customers: ${stat.newCustomers || 0}`);
        console.log('');
      });
    }

    // 2. View Product Stats
    console.log('\n📦 PRODUCT STATS (SellerProductStats)');
    console.log('-'.repeat(50));
    
    const productStats = await SellerProductStats.find({ sellerId: sellerObjectId })
      .sort({ quantitySold: -1 })
      .limit(10)
      .populate('productId', 'title')
      .lean();

    if (productStats.length === 0) {
      console.log('❌ No product stats found. Analytics will be calculated from orders.');
    } else {
      console.log(`✅ Found ${productStats.length} product stat records (showing top 10):\n`);
      productStats.forEach((stat, index) => {
        const productName = stat.productId?.title || 'Unknown Product';
        console.log(`${index + 1}. Product: ${productName}`);
        console.log(`   - Quantity Sold: ${stat.quantitySold || 0}`);
        console.log(`   - Total Sales: PKR ${stat.totalSales || 0}`);
        console.log(`   - Order Count: ${stat.orderCount || 0}`);
        console.log(`   - Refund Count: ${stat.refundCount || 0}`);
        console.log('');
      });
    }

    // 3. View Related Orders
    console.log('\n📋 RELATED ORDERS');
    console.log('-'.repeat(50));
    
    const orders = await Order.find({ sellerId: sellerObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status total createdAt deliveredAt')
      .lean();

    console.log(`Found ${orders.length} recent orders:\n`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order: ${order.orderNumber}`);
      console.log(`   - Status: ${order.status}`);
      console.log(`   - Total: PKR ${order.total || 0}`);
      console.log(`   - Created: ${order.createdAt?.toISOString().split('T')[0] || 'N/A'}`);
      console.log(`   - Delivered: ${order.deliveredAt?.toISOString().split('T')[0] || 'Not delivered'}`);
      console.log(`   ${order.status === 'delivered' ? '✅ Will update analytics' : '⏳ Waiting for delivery'}`);
      console.log('');
    });

    // 4. Summary
    console.log('\n📈 SUMMARY');
    console.log('-'.repeat(50));
    
    const totalDailyStats = await SellerDailyStats.countDocuments({ sellerId: sellerObjectId });
    const totalProductStats = await SellerProductStats.countDocuments({ sellerId: sellerObjectId });
    const deliveredOrders = await Order.countDocuments({ 
      sellerId: sellerObjectId, 
      status: 'delivered' 
    });

    console.log(`Total Daily Stats Records: ${totalDailyStats}`);
    console.log(`Total Product Stats Records: ${totalProductStats}`);
    console.log(`Total Delivered Orders: ${deliveredOrders}`);
    
    if (deliveredOrders > 0 && totalDailyStats === 0) {
      console.log('\n⚠️  WARNING: You have delivered orders but no analytics data!');
      console.log('💡 Run the backfill utility to populate analytics from existing orders.');
    }

    console.log('\n' + '='.repeat(50));
  } catch (error) {
    console.error('Error viewing analytics:', error);
  }
}

/**
 * View analytics for all sellers (admin function)
 */
export async function viewAllAnalytics() {
  try {
    const sellers = await Order.distinct('sellerId');
    
    console.log('\n=== ALL SELLERS ANALYTICS ===\n');
    console.log(`Found ${sellers.length} sellers with orders\n`);

    for (const sellerId of sellers) {
      await viewAnalytics(sellerId.toString());
      console.log('\n');
    }
  } catch (error) {
    console.error('Error viewing all analytics:', error);
  }
}

/**
 * Check if analytics are in sync with orders
 */
export async function checkAnalyticsSync(sellerId) {
  try {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    // Get total from analytics
    const dailyStats = await SellerDailyStats.find({ sellerId: sellerObjectId }).lean();
    const analyticsTotal = dailyStats.reduce((sum, stat) => sum + (stat.totalSales || 0), 0);
    const analyticsOrderCount = dailyStats.reduce((sum, stat) => sum + (stat.orderCount || 0), 0);

    // Get total from orders
    const orders = await Order.find({ 
      sellerId: sellerObjectId, 
      status: 'delivered' 
    }).lean();
    const ordersTotal = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const ordersCount = orders.length;

    console.log('\n=== ANALYTICS SYNC CHECK ===\n');
    console.log('From Analytics Tables:');
    console.log(`  - Total Sales: PKR ${analyticsTotal}`);
    console.log(`  - Order Count: ${analyticsOrderCount}`);
    console.log('\nFrom Orders Table:');
    console.log(`  - Total Sales: PKR ${ordersTotal}`);
    console.log(`  - Order Count: ${ordersCount}`);
    console.log('\nStatus:');
    
    const salesMatch = Math.abs(analyticsTotal - ordersTotal) < 1; // Allow 1 PKR difference
    const countMatch = analyticsOrderCount === ordersCount;
    
    if (salesMatch && countMatch) {
      console.log('✅ Analytics are in sync!');
    } else {
      console.log('⚠️  Analytics are OUT OF SYNC!');
      if (!salesMatch) console.log(`   - Sales difference: PKR ${Math.abs(analyticsTotal - ordersTotal)}`);
      if (!countMatch) console.log(`   - Order count difference: ${Math.abs(analyticsOrderCount - ordersCount)}`);
      console.log('\n💡 Run backfill utility to sync analytics.');
    }
  } catch (error) {
    console.error('Error checking sync:', error);
  }
}

