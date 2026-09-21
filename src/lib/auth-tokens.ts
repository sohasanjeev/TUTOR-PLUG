import crypto from 'crypto';
import { normalizePhone } from './server-db';

const OTP_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'tutorplug-secret-otp-key-2026-secure';

export function signOtp(phone: string, code: string, expiresInMinutes: number = 10): string {
  const normPhone = normalizePhone(phone);
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const payload = `${normPhone}:${code.trim()}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', OTP_SECRET)
    .update(payload)
    .digest('hex');

  // Base64 encode payload and signature
  return Buffer.from(JSON.stringify({ phone: normPhone, code: code.trim(), expiresAt, signature })).toString('base64');
}

export function verifyOtpToken(phone: string, code: string, token: string): boolean {
  try {
    if (!token) return false;
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { phone: tokenPhone, code: tokenCode, expiresAt, signature } = decoded;

    const normPhone = normalizePhone(phone);
    if (tokenPhone !== normPhone) return false;
    if (tokenCode !== code.trim()) return false;
    if (Date.now() > expiresAt) return false;

    const expectedPayload = `${tokenPhone}:${tokenCode}:${expiresAt}`;
    const expectedSignature = crypto
      .createHmac('sha256', OTP_SECRET)
      .update(expectedPayload)
      .digest('hex');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}
