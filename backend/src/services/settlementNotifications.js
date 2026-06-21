/**
 * Settlement Notification Service
 * Sends email/SMS notifications when settlements become available
 */

import { sendWhatsAppOtp } from './whatsapp.js';
import { sendPayoutAvailableEmail } from './email.js';
import { createSellerNotification } from './sellerNotifications.js';

/**
 * Send settlement available notification to seller
 * 
 * @param {Object} seller - Seller user object
 * @param {Object} settlementData - Settlement information
 * @param {number} settlementData.totalAmount - Total amount available
 * @param {number} settlementData.orderCount - Number of orders settled
 * @param {Array} settlementData.orders - Array of settled orders
 */
export async function sendSettlementAvailableNotification(seller, settlementData) {
  const { totalAmount, orderCount, orders } = settlementData;
  
  // Format amount
  const formattedAmount = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(totalAmount);

  const sellerName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller';
  const sellerIdentifier = seller?._id || seller?.id || seller?.sellerId;

  // Email notification using styled template
  if (seller.email) {
    try {
      await sendPayoutAvailableEmail({
        toEmail: seller.email,
        sellerName,
        amount: totalAmount,
        orderCount,
      });
      console.log(`[SETTLEMENT] Email sent to ${seller.email} for ${formattedAmount}`);
    } catch (error) {
      console.error('Failed to send settlement email:', error.message);
    }
  }

  if (sellerIdentifier) {
    createSellerNotification({
      sellerId: sellerIdentifier,
      type: 'payout',
      title: 'Payout available',
      message: `${formattedAmount} is ready for withdrawal (${orderCount} order${orderCount === 1 ? '' : 's'} settled).`,
      actionUrl: '/seller/manage-payments',
      meta: {
        amount: totalAmount,
        orderCount,
      },
      priority: 'success',
    }).catch((err) => {
      console.error('Failed to store settlement notification', err);
    });
  }

  // SMS/WhatsApp notification (if phone available)
  if (seller.phone) {
    try {
      await sendSettlementSMS(seller.phone, {
        totalAmount: formattedAmount,
        orderCount,
      });
    } catch (error) {
      console.error('Failed to send settlement SMS:', error.message);
    }
  }
}


/**
 * Send SMS/WhatsApp notification
 */
async function sendSettlementSMS(phone, data) {
  const message = `Carriya: ${data.totalAmount} is now available for withdrawal. ${data.orderCount} order(s) settled. Login to withdraw.`;
  
  // Use WhatsApp service (can be extended to SMS)
  try {
    await sendWhatsAppOtp(phone, message.substring(0, 6));
    console.log(`[SETTLEMENT SMS] To: ${phone}, Message: ${message}`);
  } catch (error) {
    // If WhatsApp fails, just log
    console.log(`[SETTLEMENT SMS] To: ${phone}, Message: ${message}`);
  }
}
