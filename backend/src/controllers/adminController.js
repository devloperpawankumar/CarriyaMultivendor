/**
 * Admin Controller
 * Professional admin panel APIs with proper error handling
 * Follows existing codebase patterns (response.js, errors.js, auth.js)
 */

import { User } from '../models/User.js';
import { SellerOnboarding } from '../models/SellerOnboarding.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { successResponse } from '../utils/response.js';
import { httpError, asyncHandler } from '../middleware/errors.js';
import { getPlatformSettings, upsertPlatformSettings } from '../services/platformSettings.js';

// ============================================
// ADMIN DASHBOARD OVERVIEW
// ============================================

/**
 * Get admin dashboard overview stats
 * GET /api/admin/dashboard
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  // Get counts in parallel for better performance
  const [totalUsers, totalSellers, totalBuyers, totalOrders, totalProducts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'buyer' }),
    Order.countDocuments(),
    Product.countDocuments({ status: 'active' }),
  ]);

  // Calculate platform earnings (sum of all completed orders)
  const earningsResult = await Order.aggregate([
    { $match: { status: 'delivered' } },
    // Order model uses `total` as the final charged amount
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const platformEarnings = earningsResult[0]?.total || 0;

  // Get recent orders (last 10)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('buyerId', 'firstName lastName email')
    .populate('sellerId', 'firstName lastName email')
    .lean();

  // Get new sellers (pending approval)
  const newSellers = await User.find({ role: 'seller', isActive: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email createdAt')
    .lean();

  const stats = {
    totalUsers,
    totalSellers,
    totalBuyers,
    totalOrders,
    totalProducts,
    platformEarnings,
    lastUpdated: new Date().toISOString(),
  };

  return successResponse(res, {
    stats,
    recentOrders: recentOrders.map(order => ({
      orderId: order.orderNumber || order._id,
      buyer: order.buyerId ? `${order.buyerId.firstName} ${order.buyerId.lastName}` : 'N/A',
      seller: order.sellerId ? `${order.sellerId.firstName} ${order.sellerId.lastName}` : 'N/A',
      // console.log(order.total);
      amount: `RS ${order.total}`,
      status: order.status,
      createdAt: order.createdAt,
    })),
    newSellers: newSellers.map(seller => ({
      id: seller._id,
      name: `${seller.firstName} ${seller.lastName}`,
      email: seller.email,
      joinedDate: seller.createdAt.toISOString().split('T')[0],
      status: seller.isActive ? 'Active' : 'Pending',
    })),
  });
});

// ============================================
// BUYERS MANAGEMENT
// ============================================

/**
 * Get paginated list of buyers with filters
 * GET /api/admin/buyers?page=1&pageSize=10&status=active&search=john
 */
export const getBuyers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100); // Max 100
  const status = req.query.status; // active, pending, suspended
  const search = req.query.search;

  // Build query
  const query = { role: 'buyer' };

  // Status filter
  if (status) {
    switch (status.toLowerCase()) {
      case 'active':
        query.isActive = true;
        query.isEmailVerified = true;
        break;
      case 'pending':
        query.isActive = true;
        query.isEmailVerified = false;
        break;
      case 'suspended':
        query.isActive = false;
        break;
    }
  }

  // Search filter (name or email)
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  // Execute query with pagination
  const [buyers, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName email phone isActive isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    User.countDocuments(query),
  ]);

  // Format response
  const items = buyers.map(buyer => ({
    id: buyer._id,
    name: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'N/A',
    email: buyer.email || buyer.phone || 'N/A',
    phone: buyer.phone,
    status: getBuyerStatus(buyer),
    joinedDate: buyer.createdAt.toISOString().split('T')[0],
    totalOrders: 0, // TODO: Calculate if needed
    totalSpent: 0, // TODO: Calculate if needed
  }));

  return successResponse(res, {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

/**
 * Get single buyer details
 * GET /api/admin/buyers/:id
 */
export const getBuyerDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const buyer = await User.findOne({ _id: id, role: 'buyer' })
    .select('-passwordHash')
    .lean();

  if (!buyer) {
    throw httpError(404, 'Buyer not found');
  }

  // Get buyer's orders
  const orders = await Order.find({ buyerId: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderNumber total status createdAt')
    .lean();

  // Calculate stats
  const totalOrders = await Order.countDocuments({ buyerId: id });
  const totalSpentResult = await Order.aggregate([
    { $match: { buyerId: buyer._id, status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  return successResponse(res, {
    ...buyer,
    id: buyer._id,
    name: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim(),
    status: getBuyerStatus(buyer),
    totalOrders,
    totalSpent: totalSpentResult[0]?.total || 0,
    recentOrders: orders,
  });
});

/**
 * Block a buyer
 * POST /api/admin/buyers/:id/block
 */
export const blockBuyer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const buyer = await User.findOne({ _id: id, role: 'buyer' });

  if (!buyer) {
    throw httpError(404, 'Buyer not found');
  }

  if (!buyer.isActive) {
    throw httpError(400, 'Buyer is already blocked');
  }

  buyer.isActive = false;
  await buyer.save();

  // TODO: Send notification to buyer
  // await sendEmail(buyer.email, 'Account Suspended', ...);

  return successResponse(res, {
    message: 'Buyer blocked successfully',
    buyer: {
      id: buyer._id,
      name: `${buyer.firstName} ${buyer.lastName}`,
      status: 'Suspended',
    },
  });
});

/**
 * Unblock a buyer
 * POST /api/admin/buyers/:id/unblock
 */
export const unblockBuyer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const buyer = await User.findOne({ _id: id, role: 'buyer' });

  if (!buyer) {
    throw httpError(404, 'Buyer not found');
  }

  if (buyer.isActive) {
    throw httpError(400, 'Buyer is already active');
  }

  buyer.isActive = true;
  await buyer.save();

  return successResponse(res, {
    message: 'Buyer unblocked successfully',
    buyer: {
      id: buyer._id,
      name: `${buyer.firstName} ${buyer.lastName}`,
      status: 'Active',
    },
  });
});

/**
 * Approve a pending buyer
 * POST /api/admin/buyers/:id/approve
 */
export const approveBuyer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const buyer = await User.findOne({ _id: id, role: 'buyer' });

  if (!buyer) {
    throw httpError(404, 'Buyer not found');
  }

  if (buyer.isEmailVerified) {
    throw httpError(400, 'Buyer is already approved');
  }

  buyer.isEmailVerified = true;
  buyer.isActive = true;
  await buyer.save();

  // TODO: Send welcome email
  // await sendEmail(buyer.email, 'Account Approved', ...);

  return successResponse(res, {
    message: 'Buyer approved successfully',
    buyer: {
      id: buyer._id,
      name: `${buyer.firstName} ${buyer.lastName}`,
      status: 'Active',
    },
  });
});

// ============================================
// SELLERS MANAGEMENT
// ============================================

/**
 * Get paginated list of sellers with filters
 * GET /api/admin/sellers?page=1&pageSize=10&status=active&search=store
 */
export const getSellers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 100);
  const status = req.query.status;
  const search = req.query.search;

  // Build query
  const query = { role: 'seller' };

  // Status filter
  if (status) {
    switch (status.toLowerCase()) {
      case 'active':
        query.isActive = true;
        break;
      case 'pending':
        query.isActive = false;
        break;
      case 'suspended':
        query.isActive = false;
        query.isEmailVerified = false;
        break;
    }
  }

  // Search filter
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  // Execute query
  const [sellers, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName email phone isActive isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    User.countDocuments(query),
  ]);

  // Get seller onboarding info for each seller
  const sellerIds = sellers.map(s => s._id);
  const onboardingData = await SellerOnboarding.find({ userId: { $in: sellerIds } })
    .select('userId business bank')
    .lean();

  const onboardingMap = {};
  onboardingData.forEach(ob => {
    onboardingMap[ob.userId.toString()] = ob;
  });

  const platformSettings = await getPlatformSettings();
  const commissionPercent = platformSettings.platformCommissionPercent;

  // Format response
  const items = sellers.map(seller => {
    const onboarding = onboardingMap[seller._id.toString()];
    return {
      id: seller._id,
      storeName: onboarding?.business?.storeName || `${seller.firstName}'s Store`,
      ownerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'N/A',
      email: seller.email || 'N/A',
      phone: seller.phone,
      status: getSellerStatus(seller),
      commission: commissionPercent,
      createdAt: seller.createdAt,
    };
  });

  return successResponse(res, {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

/**
 * Get single seller details
 * GET /api/admin/sellers/:id
 */
export const getSellerDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const seller = await User.findOne({ _id: id, role: 'seller' })
    .select('-passwordHash')
    .lean();

  if (!seller) {
    throw httpError(404, 'Seller not found');
  }

  // Get seller onboarding data
  const onboarding = await SellerOnboarding.findOne({ userId: id }).lean();

  if (!onboarding) {
    throw httpError(404, 'Seller onboarding data not found');
  }

  // Get seller's products and orders
  const [products, orders] = await Promise.all([
    Product.find({ sellerId: id }).countDocuments(),
    Order.find({ sellerId: id }).countDocuments(),
  ]);

  const platformSettings = await getPlatformSettings();
  const commissionPercent = platformSettings.platformCommissionPercent;

  // Format response
  return successResponse(res, {
    id: seller._id,
    storeName: onboarding.business?.storeName || `${seller.firstName}'s Store`,
    ownerName: `${seller.firstName || ''} ${seller.lastName || ''}`.trim(),
    email: seller.email || 'N/A',
    contactNumber: seller.phone || onboarding.phone || 'N/A',
    status: getSellerStatus(seller),
    commission: commissionPercent,
    
    // Address info
    pickupAddress: onboarding.address?.pickupAddress || 'N/A',
    returnAddress: onboarding.address?.returnAddress || 'N/A',
    
    // Business/KYC info
    nameOnIdCard: onboarding.business?.idCardName || 'N/A',
    idCardNumber: onboarding.business?.idCardNumber || 'N/A',
    idCardFrontUrl: onboarding.business?.idCardFrontUrl,
    idCardBackUrl: onboarding.business?.idCardBackUrl,
    
    // Bank info
    accountHolderName: onboarding.bank?.accountHolderName || 'N/A',
    ibanNumber: onboarding.bank?.ibanNumber || 'N/A',
    accountNumber: onboarding.bank?.accountNumber || 'N/A',
    bankName: onboarding.bank?.bankName || 'N/A',
    branchCode: onboarding.bank?.branchCode || 'N/A',
    bankDocumentUrl: onboarding.bank?.bankDocumentUrl,
    
    // Stats
    totalProducts: products,
    totalOrders: orders,
    createdAt: seller.createdAt,
  });
});

/**
 * Get platform settings
 * GET /api/admin/settings
 */
export const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getPlatformSettings();
  return successResponse(res, settings);
});

/**
 * Update platform settings (partial patch)
 * PATCH /api/admin/settings
 */
export const updateAdminSettings = asyncHandler(async (req, res) => {
  const patch = req.body || {};
  const updated = await upsertPlatformSettings(patch, { updatedBy: req.user?.id });
  return successResponse(res, updated);
});

/**
 * Approve a pending seller
 * POST /api/admin/sellers/:id/approve
 */
export const approveSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const seller = await User.findOne({ _id: id, role: 'seller' });

  if (!seller) {
    throw httpError(404, 'Seller not found');
  }

  if (seller.isActive) {
    throw httpError(400, 'Seller is already approved');
  }

  // Verify seller has completed onboarding
  const onboarding = await SellerOnboarding.findOne({ userId: id });
  
  if (!onboarding || onboarding.status !== 'completed') {
    throw httpError(400, 'Seller has not completed onboarding');
  }

  seller.isActive = true;
  seller.isEmailVerified = true;
  await seller.save();

  // TODO: Send approval email/SMS
  // await sendEmail(seller.email, 'Seller Account Approved', ...);

  return successResponse(res, {
    message: 'Seller approved successfully',
    seller: {
      id: seller._id,
      name: `${seller.firstName} ${seller.lastName}`,
      status: 'Active',
    },
  });
});

/**
 * Suspend a seller
 * POST /api/admin/sellers/:id/suspend
 */
export const suspendSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional suspension reason

  const seller = await User.findOne({ _id: id, role: 'seller' });

  if (!seller) {
    throw httpError(404, 'Seller not found');
  }

  if (!seller.isActive) {
    throw httpError(400, 'Seller is already suspended');
  }

  seller.isActive = false;
  await seller.save();

  // TODO: Deactivate all seller's products
  await Product.updateMany(
    { sellerId: id, status: 'active' },
    { status: 'inactive' }
  );

  // TODO: Send suspension notification
  // await sendEmail(seller.email, 'Account Suspended', reason);

  return successResponse(res, {
    message: 'Seller suspended successfully',
    seller: {
      id: seller._id,
      name: `${seller.firstName} ${seller.lastName}`,
      status: 'Suspended',
    },
  });
});

/**
 * Reactivate a suspended seller
 * POST /api/admin/sellers/:id/reactivate
 */
export const reactivateSeller = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const seller = await User.findOne({ _id: id, role: 'seller' });

  if (!seller) {
    throw httpError(404, 'Seller not found');
  }

  if (seller.isActive) {
    throw httpError(400, 'Seller is already active');
  }

  seller.isActive = true;
  await seller.save();

  // TODO: Reactivate seller's products (optionally)
  // await Product.updateMany({ sellerId: id }, { status: 'active' });

  return successResponse(res, {
    message: 'Seller reactivated successfully',
    seller: {
      id: seller._id,
      name: `${seller.firstName} ${seller.lastName}`,
      status: 'Active',
    },
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine buyer status for display
 */
function getBuyerStatus(buyer) {
  if (!buyer.isActive) return 'Suspended';
  if (!buyer.isEmailVerified && !buyer.isPhoneVerified) return 'Pending';
  return 'Active';
}

/**
 * Determine seller status for display
 */
function getSellerStatus(seller) {
  if (!seller.isActive) return seller.isEmailVerified ? 'Suspended' : 'Pending';
  return 'Active';
}

// ============================================
// ADMIN: ORDERS & PAYMENTS (Daraz/Amazon-style)
// ============================================

function clampInt(value, fallback, { min = 1, max = 50 } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const intVal = Math.floor(parsed);
  return Math.min(max, Math.max(min, intVal));
}

function mapOrderStatusForAdmin(status) {
  switch (status) {
    case 'delivered':
      return 'Completed';
    case 'confirmed':
    case 'processing':
    case 'shipped':
      return 'Paid';
    case 'cancelled':
    case 'refunded':
      return 'Cancelled';
    case 'pending':
    default:
      return 'Pending';
  }
}

function mapEscrowStatusForAdmin(settlementStatus) {
  switch (settlementStatus) {
    case 'settled':
      return 'Released';
    case 'pending':
    case 'available':
    default:
      return 'In Escrow';
  }
}

function startOfDayMs(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime();
}

function computeEscrowInfo(order) {
  // Default, overwritten by settings in computeEscrowInfoWithSettings
  const ESCROW_HOLD_DAYS = 7;
  const nowStart = startOfDayMs(Date.now());
  const paidAt = order.paidAt || order.createdAt;
  const daysHeld = paidAt
    ? Math.max(0, Math.floor((nowStart - startOfDayMs(paidAt)) / (24 * 60 * 60 * 1000)))
    : 0;

  const isRefunded = order.paymentStatus === 'refunded' || order.status === 'refunded';
  const isReleased = order.settlement?.settlementStatus === 'settled';

  const availableInDays = Math.max(0, ESCROW_HOLD_DAYS - daysHeld);
  const canRelease = !isRefunded && !isReleased && availableInDays === 0;

  let escrowStatus = 'In Escrow';
  if (isRefunded) escrowStatus = 'Refunded';
  else if (isReleased) escrowStatus = 'Released';
  else if (canRelease) escrowStatus = 'Release Available';

  return {
    escrowStatus,
    daysHeld,
    holdDays: ESCROW_HOLD_DAYS,
    availableInDays,
    canRelease,
    releaseAvailableAt: paidAt ? new Date(startOfDayMs(paidAt) + ESCROW_HOLD_DAYS * 24 * 60 * 60 * 1000).toISOString() : null,
  };
}

async function computeEscrowInfoWithSettings(order) {
  const settings = await getPlatformSettings();
  const nowStart = startOfDayMs(Date.now());
  const paidAt = order.paidAt || order.createdAt;
  const daysHeld = paidAt
    ? Math.max(0, Math.floor((nowStart - startOfDayMs(paidAt)) / (24 * 60 * 60 * 1000)))
    : 0;

  const holdDays = Math.min(60, Math.max(0, Math.floor(Number(settings.escrowHoldDays) || 0)));
  const isRefunded = order.paymentStatus === 'refunded' || order.status === 'refunded';
  const settlementStatus = order.settlement?.settlementStatus || 'pending';
  const isReleased = settlementStatus === 'available' || settlementStatus === 'settled';

  const availableInDays = Math.max(0, holdDays - daysHeld);
  const canRelease = !isRefunded && !isReleased && availableInDays === 0;

  let escrowStatus = 'In Escrow';
  if (isRefunded) escrowStatus = 'Refunded';
  else if (isReleased) escrowStatus = 'Released';
  else if (canRelease) escrowStatus = 'Release Available';

  return {
    escrowStatus,
    daysHeld,
    holdDays,
    availableInDays,
    canRelease,
    releaseAvailableAt: paidAt
      ? new Date(startOfDayMs(paidAt) + holdDays * 24 * 60 * 60 * 1000).toISOString()
      : null,
  };
}

/**
 * Admin orders list (supports sellerId filter)
 * GET /api/admin/orders?page=1&pageSize=10&search=...&status=...&escrowStatus=...&sellerId=...
 */
export const getAdminOrders = asyncHandler(async (req, res) => {
  const page = clampInt(req.query.page, 1, { min: 1, max: 100000 });
  const pageSize = clampInt(req.query.pageSize, 10, { min: 1, max: 50 });
  const skip = (page - 1) * pageSize;

  const { status, escrowStatus, search, sellerId } = req.query;

  const query = {};
  if (sellerId) query.sellerId = sellerId;

  if (status) {
    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (allowed.includes(String(status))) query.status = String(status);
  }

  if (escrowStatus) {
    const normalized = String(escrowStatus).toLowerCase();
    if (normalized.includes('released')) query['settlement.settlementStatus'] = 'available';
    if (normalized.includes('escrow')) query['settlement.settlementStatus'] = { $in: ['pending', 'available'] };
  }

  if (search) {
    const s = String(search).trim();
    if (s) {
      query.$or = [
        { orderNumber: { $regex: s, $options: 'i' } },
        { buyerName: { $regex: s, $options: 'i' } },
        { buyerEmail: { $regex: s, $options: 'i' } },
      ];
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Order.countDocuments(query),
  ]);

  const escrowInfos = await Promise.all(orders.map((o) => computeEscrowInfoWithSettings(o)));

  return res.json({
    items: orders.map((o, idx) => ({
      id: o._id.toString(),
      orderId: o.orderNumber ? `#${o.orderNumber}` : `#${o._id.toString().slice(-6).toUpperCase()}`,
      buyer: o.buyerName || o.buyerEmail || 'N/A',
      seller: o.sellerId ? `${o.sellerId.firstName || ''} ${o.sellerId.lastName || ''}`.trim() || o.sellerId.email : 'N/A',
      amount: Number(o.total || 0),
      currency: 'PKR',
      status: mapOrderStatusForAdmin(o.status),
      escrowStatus: escrowInfos[idx]?.escrowStatus || 'In Escrow',
      createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
    })),
    total,
    page,
    pageSize,
  });
});

/**
 * Admin payments list (derived from orders/settlement)
 * GET /api/admin/payments?page=1&pageSize=10&search=...&escrowStatus=...&sellerId=...
 */
export const getAdminPayments = asyncHandler(async (req, res) => {
  const page = clampInt(req.query.page, 1, { min: 1, max: 100000 });
  const pageSize = clampInt(req.query.pageSize, 10, { min: 1, max: 50 });
  const skip = (page - 1) * pageSize;

  const { escrowStatus, search, sellerId } = req.query;

  const query = {
    paymentStatus: { $in: ['paid', 'refunded'] },
  };
  if (sellerId) query.sellerId = sellerId;

  if (escrowStatus) {
    const normalized = String(escrowStatus).toLowerCase();
    if (normalized.includes('released')) query['settlement.settlementStatus'] = 'available';
    if (normalized.includes('escrow')) query['settlement.settlementStatus'] = { $in: ['pending', 'available'] };
    if (normalized.includes('refunded')) query.paymentStatus = 'refunded';
  }

  if (search) {
    const s = String(search).trim();
    if (s) {
      query.$or = [
        { orderNumber: { $regex: s, $options: 'i' } },
        { buyerName: { $regex: s, $options: 'i' } },
        { buyerEmail: { $regex: s, $options: 'i' } },
      ];
    }
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('sellerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Order.countDocuments(query),
  ]);

  const escrowInfos = await Promise.all(orders.map((o) => computeEscrowInfoWithSettings(o)));

  return res.json({
    items: orders.map((o, idx) => {
      const createdAtIso = o.createdAt ? new Date(o.createdAt).toISOString() : undefined;
      const escrow = escrowInfos[idx] || {};

      return {
        id: o._id.toString(),
        orderId: o.orderNumber ? `#${o.orderNumber}` : `#${o._id.toString().slice(-6).toUpperCase()}`,
        seller: o.sellerId ? `${o.sellerId.firstName || ''} ${o.sellerId.lastName || ''}`.trim() || o.sellerId.email : 'N/A',
        amount: Number(o.settlement?.sellerPayout ?? o.total ?? 0),
        currency: 'PKR',
        escrowStatus: escrow.escrowStatus || 'In Escrow',
        daysHeld: escrow.daysHeld || 0,
        holdDays: escrow.holdDays,
        availableInDays: escrow.availableInDays,
        canRelease: escrow.canRelease,
        releaseAvailableAt: escrow.releaseAvailableAt ?? null,
        createdAt: createdAtIso,
        releasedAt: o.settlement?.settledAt ? new Date(o.settlement.settledAt).toISOString() : undefined,
      };
    }),
    total,
    page,
    pageSize,
  });
});

/**
 * Admin: release seller payout (escrow -> released)
 * POST /api/admin/payments/:paymentId/release
 */
export const releaseAdminPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const order = await Order.findById(paymentId);
  if (!order) throw httpError(404, 'Payment not found');

  if (order.paymentStatus !== 'paid') {
    throw httpError(409, 'Order is not paid');
  }

  const escrow = await computeEscrowInfoWithSettings(order);
  if (escrow.escrowStatus === 'Refunded') {
    throw httpError(409, 'Payment was refunded');
  }

  if (order.settlement?.settlementStatus === 'available' || order.settlement?.settlementStatus === 'settled') {
    return res.status(200).json({ success: true, message: 'Already released' });
  }

  if (!escrow.canRelease) {
    throw httpError(409, `Payment is in escrow. Available in ${escrow.availableInDays} day(s).`);
  }

  order.settlement = order.settlement || {};
  order.settlement.settlementStatus = 'available';
  order.settlement.settledAt = new Date();
  order.settlement.settlementDate = new Date();
  await order.save();

  return res.status(200).json({ success: true, message: 'Payment released' });
});
