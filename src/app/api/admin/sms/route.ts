import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { sendSmsOtp } from '@/lib/sms';

export async function GET() {
  try {
    const config = serverDB.getSmsConfig();
    const envFast2Sms = process.env.FAST2SMS_API_KEY;
    const envTwoFactor = process.env.TWOFACTOR_API_KEY;
    const envTwilio = process.env.TWILIO_ACCOUNT_SID;

    const activeProvider = config.is_active && config.api_key
      ? config.provider
      : envFast2Sms
      ? 'fast2sms (via .env)'
      : envTwoFactor
      ? '2factor (via .env)'
      : envTwilio
      ? 'twilio (via .env)'
      : 'none';

    const hasKey = !!(
      (config.is_active && config.api_key) ||
      envFast2Sms ||
      envTwoFactor ||
      envTwilio
    );

    return NextResponse.json({
      success: true,
      activeProvider,
      isConfigured: hasKey,
      config: {
        provider: config.provider,
        is_active: config.is_active,
        has_api_key: !!config.api_key,
        masked_key: config.api_key ? `${config.api_key.substring(0, 4)}••••${config.api_key.slice(-4)}` : '',
      },
    });
  } catch (error) {
    console.error('Admin SMS Config GET Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, api_key, is_active, test_phone } = body;

    if (provider && api_key !== undefined) {
      serverDB.updateSmsConfig({
        provider: provider || 'fast2sms',
        api_key: api_key.trim(),
        is_active: is_active ?? true,
      });
    }

    let testResult = null;
    if (test_phone) {
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      testResult = await sendSmsOtp(test_phone, testOtp);
    }

    return NextResponse.json({
      success: true,
      message: 'SMS configuration updated successfully.',
      testResult,
    });
  } catch (error) {
    console.error('Admin SMS Config POST Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
