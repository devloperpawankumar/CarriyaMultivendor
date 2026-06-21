import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { SellerDailyStats } from '../models/SellerDailyStats.js';
import { SellerProductStats } from '../models/SellerProductStats.js';
import { SellerSettings } from '../models/SellerSettings.js';
import { User } from '../models/User.js';
import { httpError } from '../middleware/errors.js';
import mongoose from 'mongoose';
import { sendOrderCancellationEmail, sendNewOrderNotificationToSeller } from '../services/email.js';
import { createSellerNotification } from '../services/sellerNotifications.js';

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

const buildStatusLockMeta = (order) => {
  if (!order) {
    return { locked: false, reason: null };
  }

  const payoutReleased =
    order.paymentStatus === 'paid' ||
    ['available', 'settled'].includes(order.settlement?.settlementStatus);

  if (order.status === 'delivered' && payoutReleased) {
    return {
      locked: true,
      reason: 'Order is locked after delivery and payout release. Contact support for adjustments.',
    };
  }

  return { locked: false, reason: null };
};

const clampPercentage = (value) => {
  const pct = Number(value) || 0;
  return Math.min(Math.max(pct, 0), 100);
};

const calculateItemPrice = (product) => {
  const basePrice = Number(product.price) || 0;
  const discountPct = clampPercentage(product.discount);
  if (discountPct > 0) {
    return Math.max(0, Math.round(basePrice * (1 - discountPct / 100)));
  }
  return basePrice;
};

function buildShippingAddress(payload = {}, fallbackUser = {}) {
  const {
    fullName,
    contactNumber,
    streetAddress,
    locality,
    province,
    city,
    area,
    addressNotes,
    postalCode,
  } = payload;

  const addressParts = [streetAddress, locality, addressNotes].filter(Boolean);
  const mergedAddress = addressParts.join(', ').trim() || streetAddress || addressNotes || '';

  return {
    fullName: fullName || fallbackUser.name || `${fallbackUser.firstName || ''} ${fallbackUser.lastName || ''}`.trim() || 'Customer',
    phone: contactNumber || fallbackUser.phone || '',
    address: mergedAddress,
    city: city || '',
    province: province || '',
    district: area || '',
    postalCode: postalCode || '',
  };
}

export async function createOrder(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const {
      items,
      shippingAddress: shippingAddressInput,
      paymentMethod,
      notes,
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(httpError(422, 'Validation failed', { items: 'At least one item is required' }));
    }

    if (!shippingAddressInput) {
      return next(httpError(422, 'Validation failed', { shippingAddress: 'Shipping address is required' }));
    }

    if (!paymentMethod) {
      return next(httpError(422, 'Validation failed', { paymentMethod: 'Payment method is required' }));
    }

    // Validate and fetch products
    const normalizedItems = items
      .map((item) => ({
        ...item,
        productId: item.productId,
        quantity: Number(item.quantity || item.qty || 0),
      }))
      .filter((item) => item.productId && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return next(httpError(422, 'Validation failed', { items: 'Invalid products in cart. Please refresh and try again.' }));
    }

    // Convert productIds (which may be slugs) to actual ObjectIds
    const productObjectIds = [];
    const productMap = new Map(); // Map original productId to actual ObjectId
    
    for (const item of normalizedItems) {
      let product;
      // Check if it's a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(item.productId) && item.productId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(item.productId);
      } else {
        // Treat it as a slug
        product = await Product.findOne({ slug: item.productId, isPublished: true, status: 'active' });
      }
      
      if (!product) {
        return next(httpError(404, `Product not found: ${item.productId}`));
      }
      
      const objectId = product._id;
      productObjectIds.push(objectId);
      productMap.set(item.productId, objectId);
    }
    
    // Fetch all products by their ObjectIds
    const products = await Product.find({ _id: { $in: productObjectIds } });

    if (products.length !== productObjectIds.length) {
      return next(httpError(404, 'One or more products not found'));
    }
    
    // Create a map of ObjectId to Product for quick lookup
    const productByIdMap = new Map(products.map(p => [p._id.toString(), p]));

    // Group items by seller (each seller gets a separate order)
    const ordersBySeller = new Map();

    for (const item of normalizedItems) {
      // Get the actual ObjectId from the map (handles both slug and ObjectId input)
      const productObjectId = productMap.get(item.productId);
      if (!productObjectId) {
        return next(httpError(404, `Product ${item.productId} not found`));
      }
      
      // Look up product by ObjectId
      const product = productByIdMap.get(productObjectId.toString());
      if (!product) {
        return next(httpError(404, `Product ${item.productId} not found`));
      }

      const sellerId = product.sellerId.toString();

      // Verify product availability
      const isAvailable = product.status === 'active' && 
                         product.isPublished && 
                         (product.unlimitedStock || product.stock > 0);
      if (!isAvailable) {
        return next(httpError(400, `Product ${product.title} is not available`));
      }

      // Check stock
      if (!product.unlimitedStock && product.stock < item.quantity) {
        return next(httpError(400, `Insufficient stock for ${product.title}. Available: ${product.stock}`));
      }

      const itemPrice = calculateItemPrice(product);
      const itemSubtotal = itemPrice * item.quantity;

      if (!ordersBySeller.has(sellerId)) {
        ordersBySeller.set(sellerId, {
          sellerId,
          items: [],
          subtotal: 0,
        });
      }

      const sellerOrder = ordersBySeller.get(sellerId);
      sellerOrder.items.push({
        productId: product._id,
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        thumbnailUrl: product.thumbnailUrl,
      });
      sellerOrder.subtotal += itemSubtotal;
    }

    const shippingAddress = buildShippingAddress(shippingAddressInput, {
      ...req.user,
      name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim(),
    });

    const sellerIds = [...ordersBySeller.keys()];
    const sellerUsers = sellerIds.length
      ? await User.find({ _id: { $in: sellerIds } }).select('email firstName lastName').lean()
      : [];
    const sellerSettingsDocs = sellerIds.length
      ? await SellerSettings.find({ sellerId: { $in: sellerIds } })
          .select('sellerId storeName contactEmail notifications')
          .lean()
      : [];

    const sellerUserMap = new Map();
    sellerUsers.forEach((seller) => {
      sellerUserMap.set(seller._id.toString(), seller);
    });

    const sellerSettingsMap = new Map();
    sellerSettingsDocs.forEach((settings) => {
      const key = (settings.sellerId?._id || settings.sellerId || '').toString();
      if (key) {
        sellerSettingsMap.set(key, settings);
      }
    });

    const createdOrders = [];
    const user = req.user || {};
    const notificationPromises = [];

    // Import settlement utility
    const { calculateSettlement } = await import('../utils/settlement.js');
    const { getPlatformSettings } = await import('../services/platformSettings.js');
    const platformSettings = await getPlatformSettings();
    const commissionRate = Math.min(1, Math.max(0, Number(platformSettings.platformCommissionPercent || 0) / 100));
    const escrowDays = Math.min(60, Math.max(0, Math.floor(Number(platformSettings.escrowHoldDays || 0))));

    for (const [sellerId, orderData] of ordersBySeller) {
      const shippingCost = 0; // Calculate based on shipping rules
      const discount = 0; // Apply any applicable discounts
      const total = orderData.subtotal + shippingCost - discount;
      const isCodPayment = paymentMethod === 'cod';
      const initialPaymentStatus = isCodPayment ? 'pending' : 'paid';
      const paidAt = isCodPayment ? undefined : new Date();

      // Calculate settlement (commission, fees, payout)
      const orderForSettlement = {
        subtotal: orderData.subtotal,
        total,
        paymentMethod,
        status: 'pending',
      };
      const settlement = calculateSettlement(orderForSettlement, { commissionRate, escrowDays });

      const order = await Order.create({
        buyerId,
        buyerEmail: user.email || '',
        buyerPhone: user.phone || '',
        buyerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || shippingAddress.fullName,
        shippingAddress,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        paidAt,
        status: 'pending',
        sellerId,
        notes,
        settlement, // Add settlement data
      });

      // Update product stock and sales count
      for (const item of orderData.items) {
        const product = products.find((p) => String(p._id) === String(item.productId));
        if (product) {
          // Update stock (only if not unlimited)
          if (!product.unlimitedStock) {
            product.stock -= item.quantity;
          }
          // Always update sales count (for both limited and unlimited stock)
          product.salesCount = (product.salesCount || 0) + item.quantity;
          await product.save();
        }
      }

      createdOrders.push(order);

      const sellerUser = sellerUserMap.get(sellerId) || {};
      const sellerSettings = sellerSettingsMap.get(sellerId);
      const allowEmailNotifications =
        sellerSettings?.notifications?.orderNotifications !== false &&
        sellerSettings?.notifications?.emailNotifications !== false;
      const toEmail = sellerSettings?.contactEmail || sellerUser.email;

      if (toEmail && allowEmailNotifications) {
        const sellerDisplayName =
          sellerSettings?.storeName ||
          `${sellerUser.firstName || ''} ${sellerUser.lastName || ''}`.trim() ||
          'Seller';

        notificationPromises.push(
          sendNewOrderNotificationToSeller({
            toEmail,
            sellerName: sellerDisplayName,
            orderNumber: order.orderNumber,
            buyerName: order.buyerName,
            total: order.total,
            items: order.items,
          }).catch((err) => {
            console.error('Failed to send seller new order notification', err);
          })
        );
      }

      notificationPromises.push(
        createSellerNotification({
          sellerId,
          type: 'order',
          title: 'New order received',
          message: `Order ${order.orderNumber} from ${order.buyerName || 'a customer'} is awaiting confirmation.`,
          // Note: Use orderNumber instead of raw database ID (Daraz/Amazon style)
          actionUrl: `/seller/manage-orders?orderNumber=${encodeURIComponent(order.orderNumber)}`,
          meta: {
            // Note: Removed orderId from meta - use orderNumber as public identifier
            orderNumber: order.orderNumber,
            total: order.total,
            buyerName: order.buyerName,
          },
          priority: 'success',
        }).catch((err) => {
          console.error('Failed to store seller notification', err);
        })
      );
    }

    if (notificationPromises.length > 0) {
      await Promise.allSettled(notificationPromises);
    }

    res.status(201).json({
      success: true,
      orders: createdOrders.map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      })),
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(e.errors || {}).forEach((key) => {
        fieldErrors[key] = e.errors[key].message;
      });
      return next(httpError(422, 'Validation failed', fieldErrors));
    }
    next(e);
  }
}

// Get buyer's orders
export async function getBuyerOrders(req, res, next) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const status = req.query.status;

    const query = { buyerId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('sellerId', 'firstName lastName')
      .populate('items.productId', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // Fetch store names for all unique seller IDs
    const sellerIdStrings = [...new Set(orders.map(order => {
      const sellerId = order.sellerId;
      if (!sellerId) return null;
      // Handle both populated object and ObjectId
      return (sellerId._id || sellerId).toString();
    }).filter(Boolean))];
    
    // Convert string IDs to ObjectIds for query
    const sellerObjectIds = sellerIdStrings.map(id => new mongoose.Types.ObjectId(id));
    
    const sellerSettings = await SellerSettings.find({ sellerId: { $in: sellerObjectIds } })
      .select('sellerId storeName')
      .lean();
    
    const storeNameMap = new Map();
    sellerSettings.forEach(settings => {
      if (settings.sellerId) {
        const sellerIdStr = (settings.sellerId._id || settings.sellerId).toString();
        storeNameMap.set(sellerIdStr, settings.storeName);
      }
    });

    res.json({
      items: orders.map((order) => {
        const sellerId = order.sellerId;
        const sellerIdStr = sellerId ? (sellerId._id || sellerId).toString() : null;
        const storeName = sellerIdStr ? storeNameMap.get(sellerIdStr) : null;
        
        // Clean up order items (Daraz/Amazon style - remove raw database IDs)
        const cleanedItems = order.items.map((item) => {
          const productId = item.productId;
          const productSlug = productId?.slug || (productId?._id ? productId._id.toString() : undefined);
        
        return {
            // Note: Removed _id from order item (internal identifier)
            // Product ID replaced with slug (public identifier)
            productSlug: productSlug,
            productTitle: productId?.title || item.title,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            color: item.color || undefined,
            size: item.size || undefined,
            thumbnailUrl: item.thumbnailUrl || undefined,
          };
        });
        
        return {
          // Note: Removed raw database ID - use orderNumber as public identifier (Daraz/Amazon style)
          orderNumber: order.orderNumber,
          items: cleanedItems,
          storeName: storeName || null,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          discount: order.discount,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber || undefined,
          hasReview: order.hasReview || false,
          cancelledAt: order.cancelledAt || undefined,
          cancellationReason: order.cancellationReason || undefined,
          cancellationNote: order.cancellationNote || undefined,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    next(e);
  }
}

// Get seller's orders
export async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const search = (req.query.search || '').trim();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = { sellerId };
    if (status && status !== 'all') {
      const statuses = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length === 1) {
        query.status = statuses[0];
      } else if (statuses.length > 1) {
        query.status = { $in: statuses };
      }
    }
    if (paymentStatus && paymentStatus !== 'all') {
      const payments = String(paymentStatus)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (payments.length === 1) {
        query.paymentStatus = payments[0];
      } else if (payments.length > 1) {
        query.paymentStatus = { $in: payments };
      }
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate && !Number.isNaN(startDate.getTime())) {
        query.createdAt.$gte = startDate;
      }
      if (endDate && !Number.isNaN(endDate.getTime())) {
        query.createdAt.$lte = endDate;
      }
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { orderNumber: regex },
        { buyerName: regex },
        { buyerEmail: regex },
        { buyerPhone: regex },
        { 'items.title': regex },
      ];
    }

    // Run count and fetch in parallel, and only select fields needed by the UI.
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select([
          'orderNumber',
          'buyerId',
          'buyerName',
          'buyerEmail',
          'buyerPhone',
          'items',
          'subtotal',
          'shippingCost',
          'discount',
          'total',
          'status',
          'paymentStatus',
          'settlement',
          'paymentMethod',
          'shippingAddress',
          'trackingNumber',
          'createdAt',
          'updatedAt',
        ])
        .populate('items.productId', 'slug')
        .lean(),
    ]);

    res.json({
      items: orders.map((order) => {
        const statusLockMeta = buildStatusLockMeta(order);
        
        // Clean up order items (Daraz/Amazon style - remove raw database IDs)
        const cleanedItems = order.items.map((item) => {
          const productId = item.productId;
          const productSlug = productId?.slug || (productId?._id ? productId._id.toString() : undefined);
          
          return {
            // Note: Removed _id and productId from order item (internal identifiers)
            // Product ID replaced with slug (public identifier)
            productSlug: productSlug,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            color: item.color || undefined,
            size: item.size || undefined,
            thumbnailUrl: item.thumbnailUrl || undefined,
          };
        });
        
        return {
          // Note: Removed raw database ID - use orderNumber as public identifier (Daraz/Amazon style)
          orderNumber: order.orderNumber,
          buyer: {
            // Note: Removed buyer.id (raw database ID) for security
            name: order.buyerName,
            email: order.buyerEmail,
            phone: order.buyerPhone,
          },
          items: cleanedItems,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          discount: order.discount,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          settlement: order.settlement || {
            commissionAmount: 0,
            paymentGatewayFee: 0,
            codFee: 0,
            sellerPayout: order.total,
            settlementStatus: 'pending',
          },
          paymentMethod: order.paymentMethod,
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          statusUpdateLocked: statusLockMeta.locked,
          statusLockedReason: statusLockMeta.reason,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    next(e);
  }
}

export async function getSellerOrderStats(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const [
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      refundedCount,
      paymentPendingCount,
      paymentPaidCount,
      paymentFailedCount,
      paymentRefundedCount,
    ] = await Promise.all([
      Order.countDocuments({ sellerId, status: 'pending' }),
      Order.countDocuments({ sellerId, status: 'confirmed' }),
      Order.countDocuments({ sellerId, status: 'processing' }),
      Order.countDocuments({ sellerId, status: 'shipped' }),
      Order.countDocuments({ sellerId, status: 'delivered' }),
      Order.countDocuments({ sellerId, status: 'cancelled' }),
      Order.countDocuments({ sellerId, status: 'refunded' }),
      Order.countDocuments({ sellerId, paymentStatus: 'pending' }),
      Order.countDocuments({ sellerId, paymentStatus: 'paid' }),
      Order.countDocuments({ sellerId, paymentStatus: 'failed' }),
      Order.countDocuments({ sellerId, paymentStatus: 'refunded' }),
    ]);

    res.json({
      stats: {
        newOrders: pendingCount + confirmedCount,
        processing: processingCount + shippedCount,
        completed: deliveredCount,
        canceled: cancelledCount + refundedCount,
      },
      paymentStats: {
        pending: paymentPendingCount,
        paid: paymentPaidCount,
        failed: paymentFailedCount,
        refunded: paymentRefundedCount,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
}

// Combined list + stats endpoint for seller dashboard
export async function getSellerOrdersOverview(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Reuse the filtering logic from getSellerOrders
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const search = (req.query.search || '').trim();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = { sellerId };
    if (status && status !== 'all') {
      const statuses = String(status)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length === 1) {
        query.status = statuses[0];
      } else if (statuses.length > 1) {
        query.status = { $in: statuses };
      }
    }
    if (paymentStatus && paymentStatus !== 'all') {
      const payments = String(paymentStatus)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (payments.length === 1) {
        query.paymentStatus = payments[0];
      } else if (payments.length > 1) {
        query.paymentStatus = { $in: payments };
      }
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate && !Number.isNaN(startDate.getTime())) {
        query.createdAt.$gte = startDate;
      }
      if (endDate && !Number.isNaN(endDate.getTime())) {
        query.createdAt.$lte = endDate;
      }
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { orderNumber: regex },
        { buyerName: regex },
        { buyerEmail: regex },
        { buyerPhone: regex },
        { 'items.title': regex },
      ];
    }

    // Run list + stats in parallel (similar to big marketplaces)
    const [
      total,
      orders,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      refundedCount,
    ] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select([
          'orderNumber',
          'buyerId',
          'buyerName',
          'buyerEmail',
          'buyerPhone',
          'items',
          'subtotal',
          'shippingCost',
          'discount',
          'total',
          'status',
          'paymentStatus',
          'settlement',
          'paymentMethod',
          'shippingAddress',
          'trackingNumber',
          'createdAt',
          'updatedAt',
        ])
        .populate('items.productId', 'slug')
        .lean(),
      Order.countDocuments({ sellerId, status: 'pending' }),
      Order.countDocuments({ sellerId, status: 'confirmed' }),
      Order.countDocuments({ sellerId, status: 'processing' }),
      Order.countDocuments({ sellerId, status: 'shipped' }),
      Order.countDocuments({ sellerId, status: 'delivered' }),
      Order.countDocuments({ sellerId, status: 'cancelled' }),
      Order.countDocuments({ sellerId, status: 'refunded' }),
    ]);

    const mapItem = (order) => {
      const statusLockMeta = buildStatusLockMeta(order);
      
      // Clean up order items (Daraz/Amazon style - remove raw database IDs)
      const cleanedItems = order.items.map((item) => {
        const productId = item.productId;
        const productSlug = productId?.slug || (productId?._id ? productId._id.toString() : undefined);
        
        return {
          // Note: Removed _id and productId from order item (internal identifiers)
          // Product ID replaced with slug (public identifier)
          productSlug: productSlug,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          color: item.color || undefined,
          size: item.size || undefined,
          thumbnailUrl: item.thumbnailUrl || undefined,
        };
      });
      
      return {
        // Note: Removed raw database ID - use orderNumber as public identifier (Daraz/Amazon style)
        orderNumber: order.orderNumber,
        buyer: {
          // Note: Removed buyer.id (raw database ID) for security
          name: order.buyerName,
          email: order.buyerEmail,
          phone: order.buyerPhone,
        },
        items: cleanedItems,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discount: order.discount,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        settlement: order.settlement || {
          commissionAmount: 0,
          paymentGatewayFee: 0,
          codFee: 0,
          sellerPayout: order.total,
          settlementStatus: 'pending',
        },
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        statusUpdateLocked: statusLockMeta.locked,
        statusLockedReason: statusLockMeta.reason,
      };
    };

    res.json({
      items: orders.map(mapItem),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      stats: {
        newOrders: pendingCount + confirmedCount,
        processing: processingCount + shippedCount,
        completed: deliveredCount,
        canceled: cancelledCount + refundedCount,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
}

// Get single order by ID or orderNumber (Daraz/Amazon style - supports both)
export async function getOrder(req, res, next) {
  try {
    // Decode URL-encoded orderId (Express does this automatically, but be explicit)
    let { orderId } = req.params;
    if (orderId) {
      try {
        orderId = decodeURIComponent(orderId);
      } catch (e) {
        // If decoding fails, use original value
      }
    }
    
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return next(httpError(401, 'Unauthorized'));
    }

    if (!orderId) {
      return next(httpError(400, 'Order identifier is required'));
    }

    // Support both ObjectId and orderNumber (Daraz/Amazon style)
    let order = null;
    
    // Try finding by ObjectId first if it looks like a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(orderId) && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        order = await Order.findById(orderId)
          .populate('buyerId', 'firstName lastName email phone')
          .populate('sellerId', 'firstName lastName email')
          .populate('items.productId', 'title slug images')
          .lean();
      } catch (err) {
        // If CastError occurs (e.g., invalid ObjectId format), ignore and try orderNumber lookup
        if (err.name === 'CastError') {
          // This is expected when orderId is not a valid ObjectId, continue to orderNumber lookup
          order = null;
        } else {
          // Re-throw other errors
          throw err;
        }
      }
    }
    
    // If not found by ID or not a valid ObjectId, try finding by orderNumber
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId })
        .populate('buyerId', 'firstName lastName email phone')
        .populate('sellerId', 'firstName lastName email')
        .populate('items.productId', 'title slug images')
        .lean();
    }

    if (!order) {
      return next(httpError(404, 'Order not found'));
    }

    // Check permissions
    const isBuyer = String(order.buyerId?._id || order.buyerId) === String(userId);
    const isSeller = String(order.sellerId?._id || order.sellerId) === String(userId);
    const isAdmin = userRole === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return next(httpError(403, 'Forbidden'));
    }

    const statusLockMeta = buildStatusLockMeta(order);

    // Clean up order items (Daraz/Amazon style - remove raw database IDs)
    const cleanedItems = order.items.map((item) => {
      const productId = item.productId;
      const productSlug = productId?.slug || (productId?._id ? productId._id.toString() : undefined);
      
      return {
        // Note: Removed _id and productId from order item (internal identifiers)
        // Product ID replaced with slug (public identifier)
        productSlug: productSlug,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        color: item.color || undefined,
        size: item.size || undefined,
        thumbnailUrl: item.thumbnailUrl || undefined,
      };
    });

    res.json({
      // Note: Removed raw database ID - use orderNumber as public identifier (Daraz/Amazon style)
      orderNumber: order.orderNumber,
      buyer: {
        // Note: Removed buyer.id (raw database ID) for security
        name: order.buyerName,
        email: order.buyerEmail,
        phone: order.buyerPhone,
      },
      seller: {
        // Note: Removed seller.id (raw database ID) for security
        name: order.sellerId
          ? `${order.sellerId.firstName || ''} ${order.sellerId.lastName || ''}`.trim()
          : 'Unknown',
      },
      items: cleanedItems,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentTransactionId: order.paymentTransactionId,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      settlement: order.settlement || {
        commissionAmount: 0,
        paymentGatewayFee: 0,
        codFee: 0,
        sellerPayout: order.total,
        settlementStatus: 'pending',
      },
    cancelledAt: order.cancelledAt,
    cancelledBy: order.cancelledBy,
    cancellationReason: order.cancellationReason,
    cancellationNote: order.cancellationNote,
    returnRequestedAt: order.returnRequestedAt,
    returnedAt: order.returnedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      paidAt: order.paidAt,
      statusHistory: order.statusHistory || [],
      statusUpdateLocked: statusLockMeta.locked,
      statusLockedReason: statusLockMeta.reason,
    });
  } catch (e) {
    next(e);
  }
}

// Update order status (seller/admin) - supports both ObjectId and orderNumber (Daraz/Amazon style)
export async function updateOrderStatus(req, res, next) {
  try {
    // Decode URL-encoded orderId (Express does this automatically, but be explicit)
    let { orderId } = req.params;
    if (orderId) {
      try {
        orderId = decodeURIComponent(orderId);
      } catch (e) {
        // If decoding fails, use original value
      }
    }
    
    const { status, trackingNumber, reason, note } = req.body || {};
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return next(httpError(401, 'Unauthorized'));
    }

    if (!orderId) {
      return next(httpError(400, 'Order identifier is required'));
    }

    // Support both ObjectId and orderNumber (Daraz/Amazon style)
    let order = null;
    
    // Try finding by ObjectId first if it looks like a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(orderId) && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        order = await Order.findById(orderId);
      } catch (err) {
        // If CastError occurs (e.g., invalid ObjectId format), ignore and try orderNumber lookup
        if (err.name === 'CastError') {
          // This is expected when orderId is not a valid ObjectId, continue to orderNumber lookup
          order = null;
        } else {
          // Re-throw other errors
          throw err;
        }
      }
    }
    
    // If not found by ID or not a valid ObjectId, try finding by orderNumber
    if (!order) {
      order = await Order.findOne({ orderNumber: orderId });
    }

    if (!order) {
      return next(httpError(404, 'Order not found'));
    }

    // Check permissions
    const isSeller = String(order.sellerId) === String(userId);
    const isAdmin = userRole === 'admin';

    if (!isSeller && !isAdmin) {
      return next(httpError(403, 'Forbidden'));
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return next(httpError(422, 'Invalid status'));
    }

    const oldStatus = order.status;
    const statusLockMeta = buildStatusLockMeta(order);

    if (status && status !== oldStatus) {
      if (isSeller) {
        if (statusLockMeta.locked) {
          return next(
            httpError(400, statusLockMeta.reason || 'Delivered orders cannot be updated after payout release.')
          );
        }
        const allowedTransitions = STATUS_TRANSITIONS[oldStatus] || [];
        if (!allowedTransitions.includes(status)) {
          return next(
            httpError(400, `You cannot move an order from "${oldStatus}" to "${status}" once it progresses forward.`)
          );
        }
      }

      order.status = status;
      if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
        if (order.paymentStatus === 'pending' && order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
        }
      }

      order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
      order.statusHistory.push({
        from: oldStatus,
        to: status,
        changedAt: new Date(),
        changedBy: {
          id: userId,
          role: isAdmin ? 'admin' : 'seller',
        },
        note: note || reason,
      });
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = String(trackingNumber).trim();
    }

    if (status === 'cancelled') {
      order.cancelledAt = order.cancelledAt || new Date();
      order.cancellationReason = reason || order.cancellationReason || 'Cancelled by seller';
      order.cancellationNote = note || order.cancellationNote || undefined;
      order.cancelledBy = isAdmin ? 'admin' : 'seller';
      const buyerEmail =
        order.buyerEmail ||
        (order.buyerId && typeof order.buyerId === 'object' && order.buyerId.email ? order.buyerId.email : undefined);
      if (buyerEmail) {
        try {
          await sendOrderCancellationEmail({
            toEmail: buyerEmail,
            buyerName: order.buyerName,
            orderNumber: order.orderNumber,
            reason: order.cancellationReason,
            note: order.cancellationNote,
          });
        } catch (notifyErr) {
          console.error('Failed to send buyer cancellation email:', notifyErr?.message || notifyErr);
        }
      }
    }

    await order.save();

    // Update analytics when order status changes to delivered
    // This happens AUTOMATICALLY - no manual backfill needed for new orders!
    if (status === 'delivered' && oldStatus !== 'delivered') {
      // Ensure deliveredAt is set (in case it wasn't set earlier)
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      
      // Recalculate settlement with delivery date (escrow period starts now)
      const { calculateSettlement } = await import('../utils/settlement.js');
      const updatedSettlement = calculateSettlement({
        subtotal: order.subtotal,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: 'delivered',
        deliveredAt: order.deliveredAt,
      });
      
      // Update settlement in order
      order.settlement = {
        ...order.settlement,
        ...updatedSettlement,
      };
      
      await order.save();
      
      // Use order for analytics - THIS IS AUTOMATIC (like Amazon/Daraz)
      try {
        await updateAnalyticsOnDelivery(order);
      } catch (analyticsError) {
        // Log error but don't fail the order update
        console.error('Error updating analytics on delivery:', analyticsError.message);
        // Order status update should still succeed even if analytics fail
      }
    }
    
    // Update analytics when order is cancelled/refunded
    if ((status === 'cancelled' || status === 'refunded') && oldStatus === 'delivered') {
      await updateAnalyticsOnCancellation(order);
    }

    // Refresh order from database to get populated data for response (use order._id, not orderId)
    const refreshedOrder = await Order.findById(order._id)
      .populate('buyerId', 'firstName lastName email phone')
      .populate('sellerId', 'firstName lastName email')
      .populate('items.productId', 'title slug images')
      .lean();

    const responseOrder = refreshedOrder || order;
    const responseLockMeta = buildStatusLockMeta(responseOrder);

    res.json({
      success: true,
      order: {
        // Note: Removed raw database ID - use orderNumber as public identifier (Daraz/Amazon style)
        orderNumber: responseOrder.orderNumber,
        status: responseOrder.status,
        trackingNumber: responseOrder.trackingNumber,
        statusUpdateLocked: responseLockMeta.locked,
        statusLockedReason: responseLockMeta.reason,
      },
    });
  } catch (e) {
    next(e);
  }
}

// Cancel order (buyer)
export async function cancelOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body || {};
    const buyerId = req.user?.id;

    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(httpError(404, 'Order not found'));
    }

    if (String(order.buyerId) !== String(buyerId)) {
      return next(httpError(403, 'Forbidden'));
    }

    if (!order.canBeCancelled()) {
      return next(httpError(400, 'Order cannot be cancelled at this stage'));
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by buyer';
    order.cancelledBy = 'buyer';

    // Restore product stock and decrease sales count
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Restore stock (only if not unlimited)
        if (!product.unlimitedStock) {
          product.stock += item.quantity;
        }
        // Always decrease sales count (for both limited and unlimited stock)
        product.salesCount = Math.max(0, (product.salesCount || 0) - item.quantity);
        await product.save();
      }
    }

    await order.save();

    // Update analytics when order is cancelled
    if (order.status === 'delivered') {
      await updateAnalyticsOnCancellation(order);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (e) {
    next(e);
  }
}

// Submit review for an order
export async function submitReview(req, res, next) {
  try {
    const { orderId } = req.params; // Can be orderNumber or ObjectId
    const buyerId = req.user?.id;

    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    const { productRating, productReview } = req.body || {};

    // Validate required fields
    if (!productRating || typeof productRating !== 'number' || productRating < 1 || productRating > 5) {
      return next(httpError(422, 'Validation failed', {
        productRating: 'Product rating is required and must be between 1 and 5',
      }));
    }

    // Convert buyerId to ObjectId for comparison
    let buyerObjectId;
    try {
      buyerObjectId = new mongoose.Types.ObjectId(buyerId);
    } catch (err) {
      return next(httpError(400, 'Invalid buyer ID'));
    }

    // Find the order by orderNumber or ObjectId (support both for backward compatibility)
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId) && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    } else {
      // Treat as orderNumber
      order = await Order.findOne({ orderNumber: orderId });
    }
    
    if (!order) {
      return next(httpError(404, 'Order not found'));
    }

    // Verify buyer owns the order - compare ObjectIds properly
    const orderBuyerId = order.buyerId instanceof mongoose.Types.ObjectId 
      ? order.buyerId 
      : new mongoose.Types.ObjectId(order.buyerId);

    if (!orderBuyerId.equals(buyerObjectId)) {
      return next(httpError(403, 'Forbidden: You can only review your own orders'));
    }

    // Verify order is delivered
    if (order.status !== 'delivered') {
      return next(httpError(400, 'You can only review orders that have been delivered'));
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId: order._id });
    if (existingReview || order.hasReview) {
      return next(httpError(409, 'This order has already been reviewed'));
    }

    // Get product from order
    const mainItem = order.items[0];
    if (!mainItem || !mainItem.productId) {
      return next(httpError(400, 'Order does not contain valid product information'));
    }

    const product = await Product.findById(mainItem.productId);
    if (!product) {
      return next(httpError(404, 'Product not found'));
    }

    // Create review in Review model
    const review = await Review.create({
      orderId: order._id,
      productId: product._id,
      sellerId: order.sellerId,
      buyerId: buyerObjectId,
      buyerName: order.buyerName || 'Customer',
      productRating,
      productReview: productReview?.trim() || undefined,
      orderItem: {
        title: mainItem.title,
        color: mainItem.color,
        size: mainItem.size,
        quantity: mainItem.quantity,
      },
      status: 'approved',
    });

    // Update order hasReview flag
    order.hasReview = true;
    await order.save();

    // Update product rating (simple average calculation)
    const currentRating = product.rating || 0;
    const currentReviewCount = product.reviewCount || 0;
    const newReviewCount = currentReviewCount + 1;
    const newRating = ((currentRating * currentReviewCount) + productRating) / newReviewCount;

    product.rating = Number(newRating.toFixed(2));
    product.reviewCount = newReviewCount;
    await product.save();

    res.status(201).json({
      success: true,
      review: {
        id: review._id.toString(),
        orderId: order._id.toString(),
        productId: product._id.toString(),
        sellerId: order.sellerId.toString(),
        productRating: review.productRating,
        productReview: review.productReview || undefined,
        buyer: {
          name: review.buyerName,
        },
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const fieldErrors = {};
      Object.keys(e.errors || {}).forEach((key) => {
        fieldErrors[key] = e.errors[key].message;
      });
      return next(httpError(422, 'Validation failed', fieldErrors));
    }
    if (e.code === 11000) {
      // Duplicate key error (orderId already has a review)
      return next(httpError(409, 'This order has already been reviewed'));
    }
    next(e);
  }
}

// Check if an order has been reviewed
// Helper function to update analytics when order is delivered
async function updateAnalyticsOnDelivery(order) {
  try {
    const sellerId = order.sellerId instanceof mongoose.Types.ObjectId 
      ? order.sellerId 
      : new mongoose.Types.ObjectId(order.sellerId);
    
    const orderDate = order.deliveredAt || order.createdAt;
    const statsDate = new Date(orderDate);
    statsDate.setHours(0, 0, 0, 0);

    // Update daily stats
    const dailyStats = await SellerDailyStats.findOneAndUpdate(
      { sellerId, date: statsDate },
      {
        $inc: {
          totalSales: order.total || 0,
          orderCount: 1,
        },
        $addToSet: { customerIds: order.buyerId }, // Track unique customers
      },
      { upsert: true, new: true }
    );

    // Update new customers count (only if this is first order from this buyer today)
    if (dailyStats.customerIds && dailyStats.customerIds.length > 0) {
      // Check if this buyer has ordered before today
      const buyerId = order.buyerId instanceof mongoose.Types.ObjectId
        ? order.buyerId
        : new mongoose.Types.ObjectId(order.buyerId);

      const previousOrders = await Order.countDocuments({
        sellerId,
        buyerId,
        deliveredAt: { $lt: statsDate },
      });
      
      if (previousOrders === 0) {
        await SellerDailyStats.updateOne(
          { sellerId, date: statsDate },
          { $inc: { newCustomers: 1 } }
        );
      }
    }

    // Update product stats for each item
    for (const item of order.items || []) {
      if (item.productId) {
        const productId = item.productId instanceof mongoose.Types.ObjectId
          ? item.productId
          : new mongoose.Types.ObjectId(item.productId);
        
        const itemTotal = (item.price || 0) * (item.quantity || 0);

        await SellerProductStats.findOneAndUpdate(
          { sellerId, productId },
          {
            $inc: {
              totalSales: itemTotal,
              quantitySold: item.quantity || 0,
              orderCount: 1,
            },
          },
          { upsert: true, new: true }
        );
      }
    }
  } catch (error) {
    // Don't fail the order update if analytics update fails
    console.error('Error updating analytics on delivery:', error.message);
    // Order status update should still succeed even if analytics fail
  }
}

// Helper function to update analytics when order is cancelled/refunded
async function updateAnalyticsOnCancellation(order) {
  try {
    const orderDate = order.deliveredAt || order.createdAt;
    const statsDate = new Date(orderDate);
    statsDate.setHours(0, 0, 0, 0);

    const sellerId = order.sellerId;

    // Update daily stats
    await SellerDailyStats.updateOne(
      { sellerId, date: statsDate },
      {
        $inc: {
          refundCount: 1,
          refundAmount: order.total || 0,
          totalSales: -(order.total || 0), // Subtract from total sales
          orderCount: -1, // Decrease order count
        },
      }
    );

    // Update product stats for each item
    for (const item of order.items || []) {
      if (item.productId) {
        await SellerProductStats.updateOne(
          { sellerId, productId: item.productId },
          {
            $inc: {
              totalSales: -((item.price || 0) * (item.quantity || 0)),
              quantitySold: -(item.quantity || 0),
              refundCount: 1,
              orderCount: -1,
            },
          }
        );
      }
    }
  } catch (error) {
    // Don't fail the order update if analytics update fails
    console.error('Error updating analytics on cancellation:', error);
  }
}

export async function checkOrderReview(req, res, next) {
  try {
    const { orderId } = req.params;
    const buyerId = req.user?.id;

    if (!buyerId) {
      return next(httpError(401, 'Unauthorized'));
    }

    // Convert buyerId to ObjectId for comparison
    let buyerObjectId;
    try {
      buyerObjectId = new mongoose.Types.ObjectId(buyerId);
    } catch (err) {
      return next(httpError(400, 'Invalid buyer ID'));
    }

    // Find the order by orderNumber or ObjectId (support both for backward compatibility)
    let order;
    if (mongoose.Types.ObjectId.isValid(orderId) && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId).lean();
    } else {
      // Treat as orderNumber
      order = await Order.findOne({ orderNumber: orderId }).lean();
    }
    
    if (!order) {
      return next(httpError(404, 'Order not found'));
    }

    // Verify buyer owns the order - compare ObjectIds properly
    const orderBuyerId = order.buyerId instanceof mongoose.Types.ObjectId 
      ? order.buyerId 
      : new mongoose.Types.ObjectId(order.buyerId);

    if (!orderBuyerId.equals(buyerObjectId)) {
      return next(httpError(403, 'Forbidden'));
    }

    // Check if review exists in Review model
    const review = await Review.findOne({ orderId: order._id }).lean();
    const hasReview = !!review || order.hasReview || false;
    const canReview = order.status === 'delivered' && !hasReview;

    res.json({
      success: true,
      hasReview,
      canReview,
      review: review ? {
        id: review._id.toString(),
        productRating: review.productRating,
        productReview: review.productReview,
        createdAt: review.createdAt,
      } : null,
    });
  } catch (e) {
    next(e);
  }
}

