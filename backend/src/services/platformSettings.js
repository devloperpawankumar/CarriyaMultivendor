import { PlatformSettings } from '../models/PlatformSettings.js';

const CACHE_TTL_MS = 30 * 1000;
let cached = null;
let cachedAt = 0;

export const DEFAULT_PLATFORM_SETTINGS = Object.freeze({
  platformCommissionPercent: 15,
  escrowHoldDays: 7,
  minimumWithdrawalAmount: 5000,
  autoReleasePayouts: true,
  manualApprovalRequired: true,
  notifications: {
    newOrder: true,
    newSeller: true,
    paymentRelease: false,
    dispute: true,
  },
});

function sanitizeSettings(docLike) {
  const pct = Number(docLike?.platformCommissionPercent);
  const escrow = Number(docLike?.escrowHoldDays);
  const minW = Number(docLike?.minimumWithdrawalAmount);
  const autoRel = docLike?.autoReleasePayouts;

  return {
    platformCommissionPercent: Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : DEFAULT_PLATFORM_SETTINGS.platformCommissionPercent,
    escrowHoldDays: Number.isFinite(escrow) ? Math.min(60, Math.max(0, Math.floor(escrow))) : DEFAULT_PLATFORM_SETTINGS.escrowHoldDays,
    minimumWithdrawalAmount: Number.isFinite(minW) ? Math.min(10000000, Math.max(0, Math.floor(minW))) : DEFAULT_PLATFORM_SETTINGS.minimumWithdrawalAmount,
    autoReleasePayouts: typeof autoRel === 'boolean' ? autoRel : DEFAULT_PLATFORM_SETTINGS.autoReleasePayouts,
    manualApprovalRequired:
      typeof docLike?.manualApprovalRequired === 'boolean'
        ? docLike.manualApprovalRequired
        : DEFAULT_PLATFORM_SETTINGS.manualApprovalRequired,
    notifications: {
      newOrder:
        typeof docLike?.notifications?.newOrder === 'boolean'
          ? docLike.notifications.newOrder
          : DEFAULT_PLATFORM_SETTINGS.notifications.newOrder,
      newSeller:
        typeof docLike?.notifications?.newSeller === 'boolean'
          ? docLike.notifications.newSeller
          : DEFAULT_PLATFORM_SETTINGS.notifications.newSeller,
      paymentRelease:
        typeof docLike?.notifications?.paymentRelease === 'boolean'
          ? docLike.notifications.paymentRelease
          : DEFAULT_PLATFORM_SETTINGS.notifications.paymentRelease,
      dispute:
        typeof docLike?.notifications?.dispute === 'boolean'
          ? docLike.notifications.dispute
          : DEFAULT_PLATFORM_SETTINGS.notifications.dispute,
    },
  };
}

export async function getPlatformSettings({ bypassCache = false } = {}) {
  if (!bypassCache && cached && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cached;
  }

  const doc = await PlatformSettings.findOne({}).sort({ createdAt: -1 }).lean();
  const settings = sanitizeSettings(doc || DEFAULT_PLATFORM_SETTINGS);
  cached = settings;
  cachedAt = Date.now();
  return settings;
}

export function clearPlatformSettingsCache() {
  cached = null;
  cachedAt = 0;
}

export async function upsertPlatformSettings(patch, { updatedBy } = {}) {
  const next = sanitizeSettings({ ...(await getPlatformSettings({ bypassCache: true })), ...(patch || {}) });

  const updated = await PlatformSettings.findOneAndUpdate(
    {},
    { $set: { ...next, updatedBy: updatedBy || undefined } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  clearPlatformSettingsCache();
  return sanitizeSettings(updated || next);
}

