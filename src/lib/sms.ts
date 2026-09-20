import { serverDB } from './server-db';

export interface SendSmsResult {
  success: boolean;
  message: string;
  provider?: string;
  delivered?: boolean;
  gatewayError?: string;
}

export async function sendSmsOtp(phone: string, otp: string): Promise<SendSmsResult> {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const digitsOnly = phone.replace(/\D/g, '');
  const indianNumber =
    digitsOnly.length === 12 && digitsOnly.startsWith('91')
      ? digitsOnly.substring(2)
      : digitsOnly.length === 10
      ? digitsOnly
      : digitsOnly;

  console.log(`[TutorPlug SMS Engine] Generating real OTP for ${phone}: ${otp}`);

  // Retrieve dynamic database config if present
  const dbConfig = serverDB.getSmsConfig();

  // 1. Check for Fast2SMS (Common for Indian mobile numbers)
  const fast2smsKey =
    (dbConfig?.provider === 'fast2sms' && dbConfig?.is_active && dbConfig?.api_key)
      ? dbConfig.api_key
      : process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      // Attempt 1: Fast2SMS Quick OTP Route (POST)
      let response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: indianNumber,
        }),
      });

      let data = await response.json().catch(() => null);

      // Attempt 2: If OTP route didn't return true, try GET URL format
      if (!data?.return) {
        const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
          fast2smsKey
        )}&route=otp&variables_values=${encodeURIComponent(otp)}&flash=0&numbers=${encodeURIComponent(
          indianNumber
        )}`;
        response = await fetch(getUrl, { method: 'GET' });
        data = await response.json().catch(() => null);
      }

      // Attempt 3: If still not returned, try Quick SMS route (route: 'q')
      if (!data?.return) {
        const qUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
          fast2smsKey
        )}&route=q&message=${encodeURIComponent(
          `Your Tutor Plug OTP is ${otp}. Valid for 5 mins.`
        )}&flash=0&numbers=${encodeURIComponent(indianNumber)}`;
        response = await fetch(qUrl, { method: 'GET' });
        data = await response.json().catch(() => null);
      }

      if (data?.return) {
        console.log(`[TutorPlug SMS] Fast2SMS delivered OTP to ${phone}:`, data);
        return {
          success: true,
          delivered: true,
          provider: 'Fast2SMS',
          message: `OTP sent to ${phone} via SMS`,
        };
      } else {
        console.error('[TutorPlug SMS] Fast2SMS API response:', data);
        const errMsg = Array.isArray(data?.message)
          ? data.message.join(', ')
          : typeof data?.message === 'string'
          ? data.message
          : 'Fast2SMS rejected request';
        return {
          success: true,
          delivered: false,
          provider: 'Fast2SMS',
          gatewayError: errMsg,
          message: errMsg,
        };
      }
    } catch (err) {
      console.error('[TutorPlug SMS] Fast2SMS request failed:', err);
    }
  }

  // 2. Check for Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: cleanPhone.startsWith('+') ? cleanPhone : `+91${indianNumber}`,
        From: twilioFrom,
        Body: `Your Tutor Plug verification code is: ${otp}. Valid for 5 minutes. Learn Better. Teach Better.`,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[TutorPlug SMS] Twilio delivered OTP to ${phone}, SID: ${data.sid}`);
        return {
          success: true,
          delivered: true,
          provider: 'Twilio',
          message: `OTP sent to ${phone} via SMS`,
        };
      } else {
        console.error('[TutorPlug SMS] Twilio API error:', data);
      }
    } catch (err) {
      console.error('[TutorPlug SMS] Twilio request failed:', err);
    }
  }

  // 3. Check for MSG91
  const msg91Auth = process.env.MSG91_AUTH_KEY;
  const msg91Template = process.env.MSG91_TEMPLATE_ID;
  if (msg91Auth && msg91Template) {
    try {
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          authkey: msg91Auth,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: msg91Template,
          mobile: digitsOnly,
          otp: otp,
        }),
      });
      const data = await response.json();
      if (data.type === 'success') {
        return {
          success: true,
          delivered: true,
          provider: 'MSG91',
          message: `OTP sent to ${phone} via SMS`,
        };
      }
    } catch (err) {
      console.error('[TutorPlug SMS] MSG91 request failed:', err);
    }
  }

  // 4. Check for 2Factor.in (Very popular in India for instant OTP)
  const twoFactorKey =
    (dbConfig?.provider === '2factor' && dbConfig?.is_active && dbConfig?.api_key)
      ? dbConfig.api_key
      : process.env.TWOFACTOR_API_KEY;
  if (twoFactorKey) {
    try {
      const response = await fetch(
        `https://2factor.in/API/V1/${twoFactorKey}/SMS/${indianNumber}/${otp}/OTP1`,
        { method: 'GET' }
      );
      const data = await response.json();
      if (data.Status === 'Success') {
        console.log(`[TutorPlug SMS] 2Factor.in delivered OTP to ${phone}`);
        return {
          success: true,
          delivered: true,
          provider: '2Factor.in',
          message: `OTP sent to ${phone} via SMS`,
        };
      }
    } catch (err) {
      console.error('[TutorPlug SMS] 2Factor request failed:', err);
    }
  }

  // 5. Development / Fallback if no SMS provider key added to .env.local yet
  return {
    success: true,
    delivered: false,
    provider: 'DevFallback',
    message: `No SMS gateway key found in .env.local. Add FAST2SMS_API_KEY or TWOFACTOR_API_KEY to send cellular SMS to ${phone}.`,
  };
}
