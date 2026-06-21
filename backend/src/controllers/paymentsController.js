import crypto from 'crypto';
import { calculateSellerBalance, getEarningsSummary, getMinimumWithdrawalAmount, validateWithdrawalAmount } from '../utils/settlement.js';
import { Withdrawal } from '../models/Withdrawal.js';
import mongoose from 'mongoose';
import { recordAuditLog } from '../services/auditTrail.js';
import { createSellerNotification } from '../services/sellerNotifications.js';
import { getPlatformSettings } from '../services/platformSettings.js';

const OVERVIEW_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const overviewCache = new Map();

function clampPageSize(value, defaultValue = 10, max = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

function clampPage(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function buildCacheKey({ sellerId, earningsPage, earningsPageSize, withdrawalsPage, withdrawalsPageSize }) {
  return [
    sellerId,
    `e:${earningsPage}:${earningsPageSize}`,
    `w:${withdrawalsPage}:${withdrawalsPageSize}`,
  ].join('|');
}

function formatWithdrawal(w) {
  return {
    requestId: w.requestId,
    amount: w.amount,
    method: w.method,
    status: w.status,
    date: w.requestedAt
      ? new Date(w.requestedAt).toISOString()
      : new Date(w.createdAt).toISOString(),
    processedAt: w.processedAt ? new Date(w.processedAt).toISOString() : null,
    completedAt: w.completedAt ? new Date(w.completedAt).toISOString() : null,
  };
}

async function getPaginatedWithdrawals(sellerId, page, pageSize) {
  const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };
  const skip = (page - 1) * pageSize;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    Withdrawal.countDocuments(query),
  ]);

  return {
    items: withdrawals.map(formatWithdrawal),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function tryServeFromCache(req, res, cacheKey) {
  const existing = overviewCache.get(cacheKey);
  if (!existing) return false;
  if (existing.expiresAt < Date.now()) {
    overviewCache.delete(cacheKey);
    return false;
  }

  const requestEtag = req.headers['if-none-match']?.replace(/"/g, '');
  if (requestEtag && requestEtag === existing.etag) {
    res.status(304).end();
    return true;
  }

  res.set('ETag', `"${existing.etag}"`);
  res.set('Cache-Control', 'private, max-age=30, must-revalidate');
  res.json(existing.payload);
  return true;
}

export async function getBalanceOverview(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await calculateSellerBalance(sellerId);
    const platformSettings = await getPlatformSettings();
    const minimumWithdrawal = platformSettings.minimumWithdrawalAmount ?? getMinimumWithdrawalAmount();
    
    res.json({
      ...balance,
      minimumWithdrawal,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentsOverview(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const earningsPage = clampPage(req.query.earningsPage, 1);
    const earningsPageSize = clampPageSize(req.query.earningsPageSize, 15, 50);
    const withdrawalsPage = clampPage(req.query.withdrawalsPage, 1);
    const withdrawalsPageSize = clampPageSize(req.query.withdrawalsPageSize, 10, 50);

    const cacheKey = buildCacheKey({
      sellerId,
      earningsPage,
      earningsPageSize,
      withdrawalsPage,
      withdrawalsPageSize,
    });

    if (tryServeFromCache(req, res, cacheKey)) {
      return;
    }

    const [balance, earnings, withdrawals] = await Promise.all([
      calculateSellerBalance(sellerId),
      getEarningsSummary(sellerId, { page: earningsPage, pageSize: earningsPageSize }),
      getPaginatedWithdrawals(sellerId, withdrawalsPage, withdrawalsPageSize),
    ]);

    const platformSettings = await getPlatformSettings();
    const minimumWithdrawal = platformSettings.minimumWithdrawalAmount ?? getMinimumWithdrawalAmount();

    const payload = {
      balance: {
        ...balance,
        minimumWithdrawal,
      },
      earnings,
      withdrawals,
    };

    const requestEtag = req.headers['if-none-match'];
    const nextEtag = crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
    overviewCache.set(cacheKey, { payload, etag: nextEtag, expiresAt: Date.now() + OVERVIEW_CACHE_TTL_MS });

    if (requestEtag && requestEtag.replace(/"/g, '') === nextEtag) {
      res.status(304).end();
      return;
    }

    res.set('ETag', `"${nextEtag}"`);
    res.set('Cache-Control', 'private, max-age=30, must-revalidate');
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

export async function getEarnings(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = clampPage(req.query.page, 1);
    const pageSize = clampPageSize(req.query.pageSize, 15, 50);

    const earnings = await getEarningsSummary(sellerId, { page, pageSize });
    res.json(earnings);
  } catch (error) {
    next(error);
  }
}

export async function getWithdrawals(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = clampPage(req.query.page, 1);
    const pageSize = clampPageSize(req.query.pageSize, 10, 50);

    const withdrawals = await getPaginatedWithdrawals(sellerId, page, pageSize);
    res.json(withdrawals);
  } catch (error) {
    next(error);
  }
}

export async function createWithdrawal(req, res, next) {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = req.body || {};
    const amount = Number(payload.amount);

    // Get seller's available balance
    const balance = await calculateSellerBalance(sellerId);
    const platformSettings = await getPlatformSettings();

    // Validate withdrawal amount
    const validation = validateWithdrawalAmount(amount, balance.availableToWithdraw, {
      minimumWithdrawalAmount: platformSettings.minimumWithdrawalAmount,
    });
    
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        minimumAmount: validation.minimumAmount,
        availableBalance: validation.availableBalance,
      });
    }

    // Create withdrawal request in database
    const withdrawal = await Withdrawal.create({
      sellerId,
      amount,
      method: payload.method || 'Bank',
      status: 'pending',
      sellerAccountDetails: payload.accountDetails || {},
      adminNotes: payload.note || '',
    });

    createSellerNotification({
      sellerId,
      type: 'withdrawal',
      title: 'Withdrawal request submitted',
      message: `PKR ${Number(amount).toLocaleString()} is now in review.`,
      actionUrl: '/seller/manage-payments?tab=withdrawals',
      meta: {
        requestId: withdrawal.requestId,
        amount: withdrawal.amount,
        status: withdrawal.status,
      },
      priority: 'info',
    }).catch((err) => {
      console.error('Failed to store withdrawal notification', err);
    });

    res.status(201).json({
      success: true,
      withdrawal: {
        requestId: withdrawal.requestId,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        estimatedProcessingTime: '2-5 business days',
      },
    });
  } catch (error) {
    next(error);
  }
}

// Admin endpoints for managing withdrawals
export async function getAllWithdrawals(req, res, next) {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const status = req.query.status; // pending, processing, completed, failed
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 20)));

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Withdrawal.countDocuments(query);
    const withdrawals = await Withdrawal.find(query)
      .populate('sellerId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    res.json({
      items: withdrawals.map((w) => ({
        requestId: w.requestId,
        sellerId: w.sellerId?._id?.toString() || w.sellerId?.toString(),
        sellerName: w.sellerId
          ? `${w.sellerId.firstName || ''} ${w.sellerId.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        sellerEmail: w.sellerId?.email,
        amount: w.amount,
        method: w.method,
        status: w.status,
        sellerAccountDetails: w.sellerAccountDetails,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt,
        completedAt: w.completedAt,
        transactionId: w.transactionId,
        adminNotes: w.adminNotes,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateWithdrawalStatus(req, res, next) {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { requestId } = req.params;
    const { status, transactionId, transactionReference, adminNotes, rejectionReason } = req.body || {};

    const withdrawal = await Withdrawal.findOne({ requestId });
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    // Validate status transition
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status
    if (status) {
      withdrawal.status = status;
      
      if (status === 'processing') {
        withdrawal.processedAt = new Date();
      }
      
      if (status === 'completed') {
        withdrawal.completedAt = new Date();
        if (transactionId) withdrawal.transactionId = transactionId;
        if (transactionReference) withdrawal.transactionReference = transactionReference;
      }
    }

    if (adminNotes !== undefined) {
      withdrawal.adminNotes = adminNotes;
    }

    if (rejectionReason !== undefined) {
      withdrawal.rejectionReason = rejectionReason;
    }

    await withdrawal.save();

    await recordAuditLog(req, {
      action: 'withdrawal_status_update',
      resourceType: 'withdrawal',
      resourceId: withdrawal.requestId,
      metadata: {
        status: withdrawal.status,
        transactionId: withdrawal.transactionId,
        adminNotes: withdrawal.adminNotes,
      },
    });

    const sellerId = withdrawal.sellerId?.toString();
    if (sellerId) {
      let title = 'Withdrawal update';
      let message = `Your withdrawal ${withdrawal.requestId} is now ${withdrawal.status}.`;
      let priority = 'info';

      if (withdrawal.status === 'processing') {
        message = 'Your withdrawal is being processed.';
      } else if (withdrawal.status === 'completed') {
        title = 'Withdrawal completed';
        message = `PKR ${Number(withdrawal.amount).toLocaleString()} was deposited to your account.`;
        priority = 'success';
      } else if (withdrawal.status === 'failed' || withdrawal.status === 'cancelled') {
        title = 'Withdrawal could not be completed';
        message =
          withdrawal.rejectionReason ||
          'Please update your payout details or contact support.';
        priority = 'warning';
      }

      createSellerNotification({
        sellerId,
        type: 'withdrawal',
        title,
        message,
        actionUrl: '/seller/manage-payments?tab=withdrawals',
        meta: {
          requestId: withdrawal.requestId,
          status: withdrawal.status,
          amount: withdrawal.amount,
        },
        priority,
      }).catch((err) => {
        console.error('Failed to store withdrawal status notification', err);
      });
    }

    res.json({
      success: true,
      withdrawal: {
        requestId: withdrawal.requestId,
        status: withdrawal.status,
        transactionId: withdrawal.transactionId,
        processedAt: withdrawal.processedAt,
        completedAt: withdrawal.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}


