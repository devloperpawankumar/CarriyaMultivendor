import nodemailer from 'nodemailer';

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    // Create a debug transport that logs instead of sending when SMTP is not configured
    cachedTransporter = {
      sendMail: async (opts) => {
        console.log('[DEV EMAIL] To:', opts.to);
        console.log('[DEV EMAIL] Subject:', opts.subject);
        console.log('[DEV EMAIL] HTML Preview:');
        console.log('─'.repeat(60));
        console.log(opts.text || '(no plain text)');
        console.log('─'.repeat(60));
        return { messageId: 'dev-transport' };
      },
    };
    return cachedTransporter;
  }
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

function resolveFrom() {
  const fromName = process.env.SMTP_FROM_NAME || 'Carriya';
  const fromAddress = process.env.SMTP_FROM_ADDRESS || '';
  const fromString = process.env.SMTP_FROM || '';

  if (fromName && fromAddress) {
    return { name: fromName, address: fromAddress };
  }
  if (fromString.includes('<') && fromString.includes('>')) {
    return fromString;
  }
  if (fromAddress) {
    return { name: fromName, address: fromAddress };
  }
  if (fromString) {
    return { name: fromName, address: fromString };
  }
  return { name: fromName, address: 'no-reply@carriya.local' };
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLED HTML EMAIL TEMPLATE - Used by all emails (buyers, sellers, etc.)
// ─────────────────────────────────────────────────────────────────────────────

const BRAND_COLOR = '#2ECC71';
const BRAND_COLOR_DARK = '#27AE60';

// Helper to get env vars dynamically (in case they're set after server start)
const getEnvVar = (key, fallback = '') => process.env[key] || fallback;
const getSupportEmail = () => getEnvVar('SUPPORT_EMAIL', 'support@carriya.com');
const getWebsiteUrl = () => getEnvVar('WEBSITE_URL', 'https://carriya.com');
// Logo URL - Set this in .env to your hosted logo image (e.g., Cloudinary URL)
// Example: EMAIL_LOGO_URL=https://res.cloudinary.com/your-cloud/image/upload/carriya-logo.png
const getLogoUrl = () => getEnvVar('EMAIL_LOGO_URL', '');
const getLogoBackground = () => getEnvVar('EMAIL_LOGO_BACKGROUND', 'rgba(255,255,255,0.96)');
const getLogoPadding = () => getEnvVar('EMAIL_LOGO_PADDING', '18px');
const getLogoBorderRadius = () => getEnvVar('EMAIL_LOGO_RADIUS', '18px');
const shouldUseLogoCard = () => {
  const raw = getEnvVar('EMAIL_LOGO_CARD', 'true');
  return raw !== 'false';
};

/**
 * Builds a styled HTML email using the Carriya template.
 * 
 * @param {Object} options
 * @param {string} options.recipientName - Name of the recipient (e.g., "John" or "Seller")
 * @param {string} options.title - Email title shown in header (e.g., "Order Cancelled")
 * @param {string} options.preheader - Preview text shown in email client (optional)
 * @param {Array<string|Object>} options.content - Array of content blocks:
 *   - string: Plain paragraph text
 *   - { type: 'text', value: '...' }: Plain paragraph
 *   - { type: 'highlight', label: '...', value: '...' }: Highlighted info box
 *   - { type: 'code', value: '...' }: Large code/OTP display
 *   - { type: 'button', text: '...', url: '...' }: CTA button
 *   - { type: 'divider' }: Horizontal divider
 *   - { type: 'note', value: '...' }: Gray note/tip box
 * @param {string} options.recipientType - 'buyer' | 'seller' | 'general' (affects footer text)
 * @returns {{ html: string, text: string }} HTML and plain text versions
 */
function buildStyledEmail({
  recipientName = 'there',
  title = '',
  preheader = '',
  content = [],
  recipientType = 'general',
}) {
  const safeName = recipientName && String(recipientName).trim() ? recipientName.trim() : 'there';
  const currentYear = new Date().getFullYear();
  
  // Get dynamic env vars (evaluated at email send time)
  const SUPPORT_EMAIL = getSupportEmail();
  const WEBSITE_URL = getWebsiteUrl();
  const LOGO_URL = getLogoUrl();
  const LOGO_BACKGROUND = getLogoBackground();
  const LOGO_PADDING = getLogoPadding();
  const LOGO_RADIUS = getLogoBorderRadius();
  const LOGO_CARD_ENABLED = shouldUseLogoCard();

  // Build content blocks
  const htmlBlocks = [];
  const textBlocks = [`Hi ${safeName},`, ''];

  content.forEach((block) => {
    if (typeof block === 'string') {
      htmlBlocks.push(`<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${escapeHtml(block)}</p>`);
      textBlocks.push(block, '');
    } else if (block.type === 'text') {
      htmlBlocks.push(`<p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">${escapeHtml(block.value)}</p>`);
      textBlocks.push(block.value, '');
    } else if (block.type === 'highlight') {
      htmlBlocks.push(`
        <div style="background-color: #f0fdf4; border-left: 4px solid ${BRAND_COLOR}; padding: 16px 20px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(block.label)}</p>
          <p style="margin: 8px 0 0 0; color: #15803d; font-size: 18px; font-weight: 700;">${escapeHtml(block.value)}</p>
        </div>
      `);
      textBlocks.push(`${block.label}: ${block.value}`, '');
    } else if (block.type === 'code') {
      htmlBlocks.push(`
        <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; padding: 24px; margin: 20px 0; text-align: center; border-radius: 12px;">
          <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_COLOR}; font-family: 'Courier New', monospace;">${escapeHtml(block.value)}</p>
        </div>
      `);
      textBlocks.push(`Your code: ${block.value}`, '');
    } else if (block.type === 'button') {
      htmlBlocks.push(`
        <div style="text-align: center; margin: 28px 0;">
          <a href="${escapeHtml(block.url)}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(46, 204, 113, 0.3);">${escapeHtml(block.text)}</a>
        </div>
      `);
      textBlocks.push(`${block.text}: ${block.url}`, '');
    } else if (block.type === 'divider') {
      htmlBlocks.push('<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />');
      textBlocks.push('─'.repeat(40), '');
    } else if (block.type === 'note') {
      htmlBlocks.push(`
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 14px 18px; margin: 16px 0; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">💡 ${escapeHtml(block.value)}</p>
        </div>
      `);
      textBlocks.push(`Note: ${block.value}`, '');
    } else if (block.type === 'warning') {
      htmlBlocks.push(`
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">⚠️ ${escapeHtml(block.value)}</p>
        </div>
      `);
      textBlocks.push(`Warning: ${block.value}`, '');
    } else if (block.type === 'success') {
      htmlBlocks.push(`
        <div style="background-color: #ecfdf5; border-left: 4px solid ${BRAND_COLOR}; padding: 14px 18px; margin: 16px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.5;">✓ ${escapeHtml(block.value)}</p>
        </div>
      `);
      textBlocks.push(`✓ ${block.value}`, '');
    }
  });

  // Footer text based on recipient type
  let footerNote = '';
  if (recipientType === 'buyer') {
    footerNote = 'You received this email because you placed an order on Carriya.';
  } else if (recipientType === 'seller') {
    footerNote = 'You received this email because you are a registered seller on Carriya.';
  } else {
    footerNote = 'You received this email because you have an account on Carriya.';
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title || 'Carriya')}</title>
  ${preheader ? `<meta name="x-apple-disable-message-reformatting"><meta name="format-detection" content="telephone=no,address=no,email=no,date=no"><!--[if !mso]><!--><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');</style><!--<![endif]--><span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
          
          <!-- HEADER WITH LOGO -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    ${LOGO_URL ? `
                    <!-- Image Logo -->
                    <a href="${WEBSITE_URL}" style="text-decoration: none; display: inline-block;">
                      ${LOGO_CARD_ENABLED ? `
                      <span style="display: inline-block; background-color: ${LOGO_BACKGROUND}; padding: ${LOGO_PADDING}; border-radius: ${LOGO_RADIUS}; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                        <img src="${LOGO_URL}" alt="Carriya" width="180" height="auto" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
                      </span>
                      ` : `
                      <img src="${LOGO_URL}" alt="Carriya" width="180" height="auto" style="display: block; margin: 0 auto 8px auto; max-width: 180px; height: auto;" />
                      `}
                    </a>
                    ` : `
                    <!-- Text-based Logo (fallback) -->
                    <a href="${WEBSITE_URL}" style="text-decoration: none;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -1px;">
                        <span style="display: inline-block; width: 40px; height: 40px; background-color: #ffffff; border-radius: 10px; line-height: 40px; text-align: center; color: ${BRAND_COLOR}; font-size: 24px; margin-right: 10px; vertical-align: middle;">C</span>
                        Carriya
                      </h1>
                    </a>
                    `}
                    ${title ? `<p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.9); font-weight: 500;">${escapeHtml(title)}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- MAIN CONTENT -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; color: #111827; font-size: 18px; font-weight: 600;">Hi ${escapeHtml(safeName)},</p>
              
              <!-- Dynamic Content -->
              ${htmlBlocks.join('\n')}
            </td>
          </tr>
          
          <!-- SIGNATURE -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 40px 32px 40px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                    <p style="margin: 0 0 4px 0; color: #374151; font-size: 15px; font-weight: 600;">Best regards,</p>
                    <p style="margin: 0; color: ${BRAND_COLOR}; font-size: 15px; font-weight: 700;">The Carriya Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fafb; padding: 28px 40px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                      ${escapeHtml(footerNote)}
                    </p>
                    <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px;">
                      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_COLOR}; text-decoration: none;">${SUPPORT_EMAIL}</a>
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${currentYear} Carriya. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text version
  textBlocks.push('─'.repeat(40), '');
  textBlocks.push('Best regards,');
  textBlocks.push('The Carriya Team');
  textBlocks.push('');
  textBlocks.push(`Need help? Contact us at ${SUPPORT_EMAIL}`);
  textBlocks.push(`© ${currentYear} Carriya. All rights reserved.`);

  const text = textBlocks.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  return { html, text };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SENDING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send OTP verification email
 */
export async function sendEmailOtp(toEmail, code) {
  const from = resolveFrom();
  const transporter = getTransporter();
  
  const { html, text } = buildStyledEmail({
    recipientName: null,
    title: 'Email Verification',
    preheader: `Your verification code is ${code}`,
    content: [
      'You requested a verification code for your Carriya account. Enter the code below to continue:',
      { type: 'code', value: code },
      { type: 'warning', value: 'This code will expire in 5 minutes. If you did not request this code, please ignore this email.' },
    ],
    recipientType: 'general',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: 'Your Carriya Verification Code',
    text,
    html,
  });
}

/**
 * Send order cancellation email to buyer
 */
export async function sendOrderCancellationEmail({ toEmail, buyerName, orderNumber, reason, note } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    `We're sorry to inform you that your order has been cancelled by the seller.`,
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
  ];

  if (reason) {
    content.push({ type: 'highlight', label: 'Cancellation Reason', value: reason });
  }

  if (note) {
    content.push({ type: 'note', value: `Seller note: ${note}` });
  }

  content.push({ type: 'divider' });
  content.push({ type: 'success', value: 'If the order was prepaid, any charges will be automatically reversed to your original payment method within 5-7 business days. Cash on delivery orders will not be charged.' });
  content.push('You can view your order history and track all updates from your account.');
  content.push({ type: 'button', text: 'View My Orders', url: `${WEBSITE_URL}/my-orders` });

  const { html, text } = buildStyledEmail({
    recipientName: buyerName,
    title: 'Order Cancelled',
    preheader: `Your order ${orderNumber || ''} has been cancelled`,
    content,
    recipientType: 'buyer',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Order Cancelled - ${orderNumber || 'Your Order'}`,
    text,
    html,
  });
}

/**
 * Send order confirmation email to buyer
 */
export async function sendOrderConfirmationEmail({ toEmail, buyerName, orderNumber, total, items = [] } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const itemSummary = items.length > 0
    ? items.map(i => `${i.title || 'Item'} x${i.quantity || 1}`).join(', ')
    : 'Your items';

  const content = [
    'Thank you for your order! We have received your order and it is being processed.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
    { type: 'highlight', label: 'Order Total', value: `PKR ${Number(total || 0).toLocaleString()}` },
    { type: 'note', value: `Items: ${itemSummary}` },
    { type: 'divider' },
    'The seller will confirm and prepare your order shortly. You will receive updates as your order progresses.',
    { type: 'button', text: 'Track Your Order', url: `${WEBSITE_URL}/my-orders` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: buyerName,
    title: 'Order Confirmed',
    preheader: `Your order ${orderNumber || ''} has been placed successfully`,
    content,
    recipientType: 'buyer',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Order Confirmed - ${orderNumber || 'Your Order'}`,
    text,
    html,
  });
}

/**
 * Send order shipped email to buyer
 */
export async function sendOrderShippedEmail({ toEmail, buyerName, orderNumber, trackingNumber } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Great news! Your order is on its way.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
  ];

  if (trackingNumber) {
    content.push({ type: 'highlight', label: 'Tracking Number', value: trackingNumber });
  }

  content.push({ type: 'divider' });
  content.push({ type: 'success', value: 'Your package has been handed over to our delivery partner and is en route to your address.' });
  content.push({ type: 'button', text: 'Track Your Order', url: `${WEBSITE_URL}/my-orders` });

  const { html, text } = buildStyledEmail({
    recipientName: buyerName,
    title: 'Order Shipped',
    preheader: `Your order ${orderNumber || ''} is on its way!`,
    content,
    recipientType: 'buyer',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Order Shipped - ${orderNumber || 'Your Order'}`,
    text,
    html,
  });
}

/**
 * Send order delivered email to buyer
 */
export async function sendOrderDeliveredEmail({ toEmail, buyerName, orderNumber } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Your order has been delivered! We hope you love your purchase.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
    { type: 'divider' },
    { type: 'success', value: 'Your package has been successfully delivered to your address.' },
    'We would love to hear about your experience. Please take a moment to review your purchase and help other customers make informed decisions.',
    { type: 'button', text: 'Write a Review', url: `${WEBSITE_URL}/my-orders` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: buyerName,
    title: 'Order Delivered',
    preheader: `Your order ${orderNumber || ''} has been delivered`,
    content,
    recipientType: 'buyer',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `Order Delivered - ${orderNumber || 'Your Order'}`,
    text,
    html,
  });
}

/**
 * Send new order notification to seller
 */
export async function sendNewOrderNotificationToSeller({ toEmail, sellerName, orderNumber, buyerName, total, items = [] } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const itemSummary = items.length > 0
    ? items.map(i => `${i.title || 'Item'} x${i.quantity || 1}`).join(', ')
    : 'Items ordered';

  const content = [
    'You have received a new order! Please review and confirm it as soon as possible.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
    { type: 'highlight', label: 'Customer', value: buyerName || 'Customer' },
    { type: 'highlight', label: 'Order Total', value: `PKR ${Number(total || 0).toLocaleString()}` },
    { type: 'note', value: `Items: ${itemSummary}` },
    { type: 'divider' },
    { type: 'warning', value: 'Please confirm this order within 24 hours to ensure timely delivery and maintain your seller rating.' },
    { type: 'button', text: 'View Order Details', url: `${WEBSITE_URL}/seller/manage-orders` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'New Order Received',
    preheader: `New order ${orderNumber || ''} - PKR ${Number(total || 0).toLocaleString()}`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `🛒 New Order - ${orderNumber || 'Order'} - PKR ${Number(total || 0).toLocaleString()}`,
    text,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SELLER NOTIFICATION EMAILS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send withdrawal request confirmation to seller
 */
export async function sendWithdrawalRequestedEmail({ toEmail, sellerName, amount, withdrawalId, bankName, accountNumber } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const maskedAccount = accountNumber ? `****${accountNumber.slice(-4)}` : 'N/A';
  
  const content = [
    'Your withdrawal request has been submitted successfully and is now being processed.',
    { type: 'highlight', label: 'Withdrawal Amount', value: `PKR ${Number(amount || 0).toLocaleString()}` },
    { type: 'highlight', label: 'Request ID', value: withdrawalId || 'N/A' },
    { type: 'note', value: `Bank: ${bankName || 'N/A'} | Account: ${maskedAccount}` },
    { type: 'divider' },
    { type: 'warning', value: 'Withdrawal requests are typically processed within 1-3 business days. You will receive an email once your withdrawal is approved and processed.' },
    'You can track the status of your withdrawal from your seller dashboard.',
    { type: 'button', text: 'View Withdrawal Status', url: `${WEBSITE_URL}/seller/payments` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Withdrawal Request Submitted',
    preheader: `Your withdrawal request for PKR ${Number(amount || 0).toLocaleString()} has been submitted`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `💰 Withdrawal Request Submitted - PKR ${Number(amount || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send withdrawal approved notification to seller
 */
export async function sendWithdrawalApprovedEmail({ toEmail, sellerName, amount, withdrawalId, bankName, expectedDate } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Great news! Your withdrawal request has been approved and is being processed.',
    { type: 'highlight', label: 'Withdrawal Amount', value: `PKR ${Number(amount || 0).toLocaleString()}` },
    { type: 'highlight', label: 'Request ID', value: withdrawalId || 'N/A' },
    { type: 'note', value: `Bank: ${bankName || 'Your registered bank account'}` },
    { type: 'divider' },
    { type: 'success', value: expectedDate 
      ? `Expected transfer date: ${expectedDate}. Funds will be deposited to your registered bank account.`
      : 'Funds will be deposited to your registered bank account within 1-2 business days.' 
    },
    { type: 'button', text: 'View Payment History', url: `${WEBSITE_URL}/seller/payments` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Withdrawal Approved',
    preheader: `Your withdrawal of PKR ${Number(amount || 0).toLocaleString()} has been approved`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `✅ Withdrawal Approved - PKR ${Number(amount || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send withdrawal rejected notification to seller
 */
export async function sendWithdrawalRejectedEmail({ toEmail, sellerName, amount, withdrawalId, reason } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Unfortunately, your withdrawal request could not be processed at this time.',
    { type: 'highlight', label: 'Withdrawal Amount', value: `PKR ${Number(amount || 0).toLocaleString()}` },
    { type: 'highlight', label: 'Request ID', value: withdrawalId || 'N/A' },
    { type: 'divider' },
    { type: 'warning', value: reason 
      ? `Reason: ${reason}`
      : 'Please review your bank details and ensure your account information is correct.'
    },
    'The requested amount has been returned to your available balance. You can submit a new withdrawal request after resolving any issues.',
    { type: 'button', text: 'Update Bank Details', url: `${WEBSITE_URL}/seller/settings` },
    { type: 'note', value: 'If you believe this is an error or need assistance, please contact our support team.' },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Withdrawal Request Rejected',
    preheader: `Your withdrawal request for PKR ${Number(amount || 0).toLocaleString()} was rejected`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `❌ Withdrawal Rejected - PKR ${Number(amount || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send withdrawal completed notification to seller
 */
export async function sendWithdrawalCompletedEmail({ toEmail, sellerName, amount, withdrawalId, bankName, transactionRef } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Your withdrawal has been successfully processed! The funds have been transferred to your bank account.',
    { type: 'highlight', label: 'Amount Transferred', value: `PKR ${Number(amount || 0).toLocaleString()}` },
    { type: 'highlight', label: 'Request ID', value: withdrawalId || 'N/A' },
    transactionRef ? { type: 'highlight', label: 'Transaction Reference', value: transactionRef } : null,
    { type: 'note', value: `Deposited to: ${bankName || 'Your registered bank account'}` },
    { type: 'divider' },
    { type: 'success', value: 'The funds should reflect in your bank account within 24-48 hours depending on your bank.' },
    'Thank you for selling on Carriya! Keep up the great work.',
    { type: 'button', text: 'View Payment History', url: `${WEBSITE_URL}/seller/payments` },
  ].filter(Boolean);

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Withdrawal Completed',
    preheader: `PKR ${Number(amount || 0).toLocaleString()} has been transferred to your bank account`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `🎉 Withdrawal Completed - PKR ${Number(amount || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send payout available notification to seller
 */
export async function sendPayoutAvailableEmail({ toEmail, sellerName, amount, orderCount } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Good news! You have funds available for withdrawal.',
    { type: 'highlight', label: 'Available Balance', value: `PKR ${Number(amount || 0).toLocaleString()}` },
    orderCount ? { type: 'note', value: `From ${orderCount} completed order${orderCount > 1 ? 's' : ''}` } : null,
    { type: 'divider' },
    { type: 'success', value: 'These funds have cleared the holding period and are ready to be withdrawn to your bank account.' },
    { type: 'button', text: 'Withdraw Funds', url: `${WEBSITE_URL}/seller/payments` },
  ].filter(Boolean);

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Payout Available',
    preheader: `PKR ${Number(amount || 0).toLocaleString()} is ready for withdrawal`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `💵 Payout Available - PKR ${Number(amount || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send order cancelled by buyer notification to seller
 */
export async function sendOrderCancelledByBuyerEmail({ toEmail, sellerName, orderNumber, buyerName, reason, total } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'A customer has cancelled their order.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
    { type: 'highlight', label: 'Customer', value: buyerName || 'Customer' },
    { type: 'highlight', label: 'Order Value', value: `PKR ${Number(total || 0).toLocaleString()}` },
    reason ? { type: 'note', value: `Customer reason: ${reason}` } : null,
    { type: 'divider' },
    { type: 'warning', value: 'If you had already prepared or shipped this order, please contact support for assistance with any incurred costs.' },
    'Product stock has been automatically restored.',
    { type: 'button', text: 'View Orders', url: `${WEBSITE_URL}/seller/manage-orders` },
  ].filter(Boolean);

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Order Cancelled by Customer',
    preheader: `Order ${orderNumber || ''} has been cancelled by the customer`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `📦 Order Cancelled - ${orderNumber || 'Order'}`,
    text,
    html,
  });
}

/**
 * Send new product review notification to seller
 */
export async function sendNewReviewNotificationEmail({ toEmail, sellerName, productName, rating, reviewText, buyerName, orderNumber } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const stars = '★'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0));
  
  const content = [
    'You have received a new product review from a customer.',
    { type: 'highlight', label: 'Product', value: productName || 'Your Product' },
    { type: 'highlight', label: 'Rating', value: `${stars} (${rating || 0}/5)` },
    reviewText ? { type: 'note', value: `"${reviewText}"` } : null,
    { type: 'note', value: `By: ${buyerName || 'Customer'} | Order: ${orderNumber || 'N/A'}` },
    { type: 'divider' },
    rating >= 4 
      ? { type: 'success', value: 'Great job! Positive reviews help build trust and attract more customers.' }
      : { type: 'warning', value: 'Consider reaching out to the customer to address any concerns and improve their experience.' },
    { type: 'button', text: 'View All Reviews', url: `${WEBSITE_URL}/seller/reviews` },
  ].filter(Boolean);

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'New Product Review',
    preheader: `${rating || 0}-star review for ${productName || 'your product'}`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `⭐ New ${rating || 0}-Star Review - ${productName || 'Your Product'}`,
    text,
    html,
  });
}

/**
 * Send low stock alert to seller
 */
export async function sendLowStockAlertEmail({ toEmail, sellerName, products = [] } = {}) {
  if (!toEmail || !products.length) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const productList = products.map(p => `• ${p.title || 'Product'}: ${p.stock || 0} remaining`).join('\n');
  
  const content = [
    'Some of your products are running low on stock. Consider restocking soon to avoid missing sales.',
    { type: 'warning', value: `${products.length} product${products.length > 1 ? 's' : ''} need attention:` },
    { type: 'note', value: productList },
    { type: 'divider' },
    'Keeping your inventory updated helps maintain customer satisfaction and prevents overselling.',
    { type: 'button', text: 'Manage Inventory', url: `${WEBSITE_URL}/seller/products` },
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Low Stock Alert',
    preheader: `${products.length} product${products.length > 1 ? 's are' : ' is'} running low on stock`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `⚠️ Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''}`,
    text,
    html,
  });
}

/**
 * Send daily sales summary to seller
 */
export async function sendDailySalesSummaryEmail({ toEmail, sellerName, date, totalOrders, totalRevenue, topProducts = [] } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const formattedDate = date || new Date().toLocaleDateString('en-PK', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = [
    `Here's your sales summary for ${formattedDate}.`,
    { type: 'highlight', label: 'Total Orders', value: String(totalOrders || 0) },
    { type: 'highlight', label: 'Total Revenue', value: `PKR ${Number(totalRevenue || 0).toLocaleString()}` },
  ];

  if (topProducts.length > 0) {
    const topProductsList = topProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.title || 'Product'} (${p.quantity || 0} sold)`).join('\n');
    content.push({ type: 'note', value: `Top Products:\n${topProductsList}` });
  }

  content.push({ type: 'divider' });
  
  if (totalOrders > 0) {
    content.push({ type: 'success', value: 'Great job! Keep up the good work and maintain your excellent service.' });
  } else {
    content.push({ type: 'note', value: 'No sales today. Consider running promotions or updating your product listings to boost visibility.' });
  }
  
  content.push({ type: 'button', text: 'View Full Analytics', url: `${WEBSITE_URL}/seller/analytics` });

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Daily Sales Summary',
    preheader: `${totalOrders || 0} orders | PKR ${Number(totalRevenue || 0).toLocaleString()} revenue`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `📊 Daily Summary - ${totalOrders || 0} Orders | PKR ${Number(totalRevenue || 0).toLocaleString()}`,
    text,
    html,
  });
}

/**
 * Send account verification success to seller
 */
export async function sendSellerVerifiedEmail({ toEmail, sellerName, storeName } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'Congratulations! Your seller account has been verified and you are now ready to start selling on Carriya.',
    { type: 'success', value: `Your store "${storeName || 'Your Store'}" is now live!` },
    { type: 'divider' },
    'Here are some tips to get started:',
    { type: 'note', value: '1. Add your products with clear photos and descriptions\n2. Set competitive prices\n3. Respond to orders promptly\n4. Maintain high quality standards' },
    { type: 'button', text: 'Go to Seller Dashboard', url: `${WEBSITE_URL}/seller/dashboard` },
    'Welcome to the Carriya seller community! We are excited to have you on board.',
  ];

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Account Verified',
    preheader: 'Your seller account is now active',
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `🎉 Welcome to Carriya - Your Seller Account is Verified!`,
    text,
    html,
  });
}

/**
 * Send return request notification to seller
 */
export async function sendReturnRequestEmail({ toEmail, sellerName, orderNumber, productName, reason, buyerName } = {}) {
  if (!toEmail) return;
  
  const from = resolveFrom();
  const transporter = getTransporter();
  const WEBSITE_URL = getWebsiteUrl();
  
  const content = [
    'A customer has requested a return for their order. Please review the request and take appropriate action.',
    { type: 'highlight', label: 'Order Number', value: orderNumber || 'N/A' },
    { type: 'highlight', label: 'Product', value: productName || 'Product' },
    { type: 'highlight', label: 'Customer', value: buyerName || 'Customer' },
    reason ? { type: 'warning', value: `Return Reason: ${reason}` } : null,
    { type: 'divider' },
    { type: 'note', value: 'You have 48 hours to approve or dispute this return request. Failing to respond may result in automatic approval.' },
    { type: 'button', text: 'Review Return Request', url: `${WEBSITE_URL}/seller/manage-orders/canceled-returned` },
  ].filter(Boolean);

  const { html, text } = buildStyledEmail({
    recipientName: sellerName,
    title: 'Return Request Received',
    preheader: `Return request for order ${orderNumber || ''}`,
    content,
    recipientType: 'seller',
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: `🔄 Return Request - Order ${orderNumber || ''}`,
    text,
    html,
  });
}

// Export the template builder for custom emails
export { buildStyledEmail };
