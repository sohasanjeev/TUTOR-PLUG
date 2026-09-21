import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { sendSmsOtp } from '@/lib/sms';
import { signOtp } from '@/lib/auth-tokens';

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

    // 1. Generate dynamic 6-digit real OTP and store in DB
    const otp = serverDB.createOtp(phone);
    const otpToken = signOtp(phone, otp);

    // 2. Dispatch real SMS via SMS gateway
    const smsResult = await sendSmsOtp(phone, otp);

    return NextResponse.json({
      success: true,
      delivered: smsResult.delivered,
      provider: smsResult.provider,
      gatewayError: smsResult.gatewayError,
      message: smsResult.delivered
        ? `A 6-digit verification code has been dispatched to ${phone} via SMS.`
        : `Free instant verification code generated for ${phone}.`,
      devOtp: otp,
      otpToken,
    });
  } catch (error) {
    console.error('Send OTP API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
