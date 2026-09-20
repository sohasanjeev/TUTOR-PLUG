import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { sendSmsOtp } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 1. Generate dynamic 6-digit real OTP and store in DB with 5 min expiration
    const otp = serverDB.createOtp(phone);

    // 2. Dispatch real SMS via SMS gateway
    const smsResult = await sendSmsOtp(phone, otp);

    return NextResponse.json({
      success: true,
      delivered: smsResult.delivered,
      provider: smsResult.provider,
      gatewayError: smsResult.gatewayError,
      message: smsResult.delivered
        ? `A 6-digit verification code has been dispatched to ${phone} via SMS.`
        : smsResult.gatewayError
        ? `Gateway Notice: ${smsResult.gatewayError}`
        : `SMS Gateway pending in .env.local. Real dynamic code generated for ${phone}.`,
      devOtp: smsResult.delivered ? undefined : otp,
    });
  } catch (error) {
    console.error('Send OTP API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
