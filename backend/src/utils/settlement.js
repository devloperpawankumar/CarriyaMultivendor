/**
 * Settlement and Commission Calculation Utilities
 * 
 * Handles commission calculation, escrow period, and settlement logic
 * Similar to how Daraz/Amazon handle vendor payments
 */

/**
 * Default commission configuration
 * Can be moved to database/config file later
 */
const DEFAULT_COMMISSION_RATE = 0.15; // 15%
const DEFAULT_PAYMENT_GATEWAY_FEE = 0.02; // 2% for non-COD payments
const DEFAULT_COD_FEE = 0; // No additional COD fee by default
const ESCROW_PERIOD_DAYS = 7; // default holding period after delivery

const MINIMUM_WITHDRAWAL_AMOUNT = 5000; // PKR 5,000 minimum withdrawal

/**
 * Calculate commission and settlement for an order
 * 
 * @param {Object} order - Order object with total, subtotal, paymentMethod
 * @param {Object} options - Optional commission rates (overrides defaults)
 * @returns {Object} Settlement details
 */
export function calculateSettlement(order, options = {}) {
  const {
    commissionRate = DEFAULT_COMMISSION_RATE,
    paymentGatewayFee = DEFAULT_PAYMENT_GATEWAY_FEE,
    codFee = DEFAULT_COD_FEE,
    escrowDays = ESCROW_PERIOD_DAYS,
  } = options;

  const subtotal = Number(order.subtotal) || 0;
  const total = Number(order.total) || 0;
  const paymentMethod = order.paymentMethod || 'cod';

  // Calculate commission (based on subtotal, not total)
  const commissionAmount = Math.round(subtotal * commissionRate);

  // Calculate payment gateway fee (only for non-COD payments)
  const gatewayFee = paymentMethod !== 'cod' 
    ? Math.round(total * paymentGatewayFee)
    : 0;

  // Calculate COD fee (only for COD payments)
  const codFeeAmount = paymentMethod === 'cod' 
    ? Math.round(total * codFee)
    : 0;

  // Calculate seller payout (what seller actually receives)
  const sellerPayout = total - commissionAmount - gatewayFee - codFeeAmount;

  // Calculate settlement date (escrow period starts after delivery)
  // If order is already delivered, calculate from deliveredAt
  // Otherwise, it will be set when order is delivered
  let settlementDate = null;
  if (order.deliveredAt) {
    const deliveredAt = new Date(order.deliveredAt);
    const escrowMs = Math.max(0, escrowDays) * 24 * 60 * 60 * 1000;
    settlementDate = new Date(deliveredAt.getTime() + escrowMs);
    if (escrowDays >= 1) {
      settlementDate.setHours(0, 0, 0, 0); // align to midnight for multi-day holds
    }
  }

  // Determine settlement status
  let settlementStatus = 'pending';
  if (order.status === 'delivered' && settlementDate) {
    const comparisonDate = new Date();
    if (escrowDays >= 1) {
      comparisonDate.setHours(0, 0, 0, 0);
    }
    if (settlementDate <= comparisonDate) {
      settlementStatus = 'available';
    }
  } else if (order.status !== 'delivered') {
    settlementStatus = 'pending';
  }

  return {
    commissionAmount: Math.max(0, commissionAmount),
    paymentGatewayFee: Math.max(0, gatewayFee),
    codFee: Math.max(0, codFeeAmount),
    sellerPayout: Math.max(0, sellerPayout),
    settlementDate,
    settlementStatus,
    settledAt: settlementStatus === 'available' ? new Date() : null,
  };
}

/**
 * Calculate seller balance from orders
 * 
 * @param {string} sellerId - Seller user ID
 * @param {Array} orders - Array of order documents (optional, will query if not provided)
 * @returns {Object} Balance overview
 */
export async function calculateSellerBalance(sellerId, orders = null) {
  const { Order } = await import('../models/Order.js');
  const mongoose = (await import('mongoose')).default;

  // If orders not provided, fetch them
  if (!orders) {
    orders = await Order.find({
      sellerId: new mongoose.Types.ObjectId(sellerId),
      status: 'delivered',
      paymentStatus: 'paid',
    }).lean();
  }

  let currentWalletBalance = 0;
  let availableToWithdraw = 0;
  let pendingEarnings = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const order of orders) {
    // If order has settlement data, use it
    if (order.settlement && order.settlement.sellerPayout) {
      const payout = order.settlement.sellerPayout;
      currentWalletBalance += payout;

      // Check if settlement is available
      if (order.settlement.settlementStatus === 'available') {
        availableToWithdraw += payout;
      } else if (order.settlement.settlementStatus === 'pending') {
        pendingEarnings += payout;
      }
    } else {
      // Fallback: calculate settlement on the fly (for old orders)
      const settlement = calculateSettlement(order);
      currentWalletBalance += settlement.sellerPayout;
      
      if (settlement.settlementStatus === 'available') {
        availableToWithdraw += settlement.sellerPayout;
      } else {
        pendingEarnings += settlement.sellerPayout;
      }
    }
  }

  return {
    currentWalletBalance: Math.round(currentWalletBalance),
    availableToWithdraw: Math.round(availableToWithdraw),
    pendingEarnings: Math.round(pendingEarnings),
  };
}

/**
 * Process settlements - move pending to available
 * This should be run daily via a cron job
 * 
 * @returns {Object} Processing results
 */
export async function processSettlements() {
  const { Order } = await import('../models/Order.js');
  const { getPlatformSettings } = await import('../services/platformSettings.js');
  const platformSettings = await getPlatformSettings();

  // Auto-release toggle (Daraz/Amazon-style): when disabled, admin must manually release.
  if (platformSettings?.autoReleasePayouts === false) {
    return {
      settledCount: 0,
      totalSettled: 0,
      date: new Date(),
      settledOrders: [],
    };
  }

  // const today = new Date();
  // today.setHours(0, 0, 0, 0);
  const now = new Date();

  // Find orders ready for settlement
  const ordersToSettle = await Order.find({
    'settlement.settlementStatus': 'pending',
    // make it itle today in production 
    // 'settlement.settlementDate': { $lte: today },
    'settlement.settlementDate': { $lte: now },
    status: 'delivered',
    paymentStatus: 'paid',
  });

  let settledCount = 0;
  let totalSettled = 0;
  const settledOrders = [];

  for (const order of ordersToSettle) {
    order.settlement.settlementStatus = 'available';
    order.settlement.settledAt = new Date();
    await order.save();

    settledCount++;
    totalSettled += order.settlement.sellerPayout || 0;

    settledOrders.push({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      sellerId: order.sellerId?.toString(),
      deliveredAt: order.deliveredAt,
      sellerPayout: order.settlement?.sellerPayout || 0,
    });
  }

  return {
    settledCount,
    totalSettled: Math.round(totalSettled),
    date: now,
    settledOrders,
  };
}

/**
 * Get earnings summary for a seller
 * 
 * @param {string} sellerId - Seller user ID
 * @param {number} limit - Number of recent orders to return
 * @returns {Array} Earnings entries
 */
/**
 * Get minimum withdrawal amount
 */
export function getMinimumWithdrawalAmount() {
  return MINIMUM_WITHDRAWAL_AMOUNT;
}

/**
 * Validate withdrawal amount
 * 
 * @param {number} amount - Withdrawal amount
 * @param {number} availableBalance - Available balance
 * @returns {Object} Validation result
 */
export function validateWithdrawalAmount(amount, availableBalance, options = {}) {
  const minAmount =
    Number.isFinite(Number(options.minimumWithdrawalAmount)) && Number(options.minimumWithdrawalAmount) >= 0
      ? Math.floor(Number(options.minimumWithdrawalAmount))
      : MINIMUM_WITHDRAWAL_AMOUNT;
  
  if (!amount || amount <= 0) {
    return {
      valid: false,
      error: 'Invalid withdrawal amount',
    };
  }

  if (amount < minAmount) {
    return {
      valid: false,
      error: `Minimum withdrawal amount is PKR ${minAmount.toLocaleString()}`,
      minimumAmount: minAmount,
    };
  }

  if (amount > availableBalance) {
    return {
      valid: false,
      error: 'Insufficient balance',
      availableBalance,
    };
  }

  return {
    valid: true,
  };
}

function mapOrderToEarningEntry(order) {
  const settlement = order.settlement || calculateSettlement(order);
  const payout = settlement.sellerPayout || 0;
  const friendlyOrderNumber = order.orderNumber || `ORDER-${order._id.toString().slice(-6).toUpperCase()}`;
  const firstItem = order.items?.[0];
  const productName = firstItem?.title || (order.items?.length ? `${order.items.length} item(s)` : 'Order earnings');
  const settlementStatus = settlement.settlementStatus || 'pending';
  const status =
    settlementStatus === 'pending'
      ? 'Pending'
      : settlementStatus === 'available' || settlementStatus === 'settled'
      ? 'Paid'
      : 'Pending';

  return {
    // Note: Removed raw database ID (id) and redundant orderId - use orderNumber as public identifier (Daraz/Amazon style)
    orderNumber: friendlyOrderNumber,
    label: productName,
    productName,
    amount: Math.round(payout),
    date: order.deliveredAt
      ? new Date(order.deliveredAt).toISOString().split('T')[0]
      : new Date(order.createdAt).toISOString().split('T')[0],
    status,
  };
}

function parsePageSize(value, fallback = 10, max = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

function parsePageNumber(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.floor(parsed));
}

export async function getEarningsSummary(sellerId, options = 10) {
  const { Order } = await import('../models/Order.js');
  const mongoose = (await import('mongoose')).default;

  if (typeof options === 'number') {
    const limit = Math.max(1, options);
    const orders = await Order.find({
      sellerId: new mongoose.Types.ObjectId(sellerId),
      status: 'delivered',
      paymentStatus: 'paid',
    })
      .sort({ deliveredAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return orders.map(mapOrderToEarningEntry);
  }

  const pageSize = parsePageSize(options.pageSize ?? options.limit ?? 10);
  const page = parsePageNumber(options.page ?? 1);
  const skip = (page - 1) * pageSize;

  const orders = await Order.find({
    sellerId: new mongoose.Types.ObjectId(sellerId),
    status: 'delivered',
    paymentStatus: 'paid',
  })
    .sort({ deliveredAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const total = await Order.countDocuments({
    sellerId: new mongoose.Types.ObjectId(sellerId),
    status: 'delivered',
    paymentStatus: 'paid',
  });

  const items = orders.map(mapOrderToEarningEntry);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

