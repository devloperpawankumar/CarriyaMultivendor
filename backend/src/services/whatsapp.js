// WhatsApp Cloud API sender (optional). If not configured, falls back to console logging.

const API_BASE = 'https://graph.facebook.com/v19.0';

export async function sendWhatsAppOtp(phone, code) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID; // the WhatsApp Business phone number ID
  if (!token || !phoneId) {
    console.log(`[OTP] Send to ${phone}: ${code}`);
    return { ok: true, fallback: true };
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizePhoneE164(phone),
    type: 'text',
    text: {
      body: `Your Carriya verification code is: ${code}`,
    },
  };

  const res = await fetch(`${API_BASE}/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp send failed: ${res.status} ${text}`);
  }
  return { ok: true };
}

function normalizePhoneE164(p) {
  const digits = String(p).replace(/\D/g, '');
  // naive: if starts with country code, keep; else assume +92 as per UI
  if (digits.startsWith('92')) return `+${digits}`;
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
  return `+92${digits}`;
}


