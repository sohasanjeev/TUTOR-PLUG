import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, full_name, role, email, otp } = body;

    if (!phone || !full_name || !role) {
      return NextResponse.json(
        { success: false, message: 'Phone, Full Name, and Role are required.' },
        { status: 400 }
      );
    }

    if (otp) {
      const verifyResult = serverDB.verifyOtp(phone, otp);
      if (!verifyResult.valid) {
        return NextResponse.json(
          { success: false, message: verifyResult.message || 'Invalid or expired OTP code.' },
          { status: 400 }
        );
      }
    }

    // Save to real database
    const profile = serverDB.createProfile({
      phone,
      full_name,
      role,
      email: email || '',
    });

    return NextResponse.json({
      success: true,
      user: profile,
      message: 'Account registered successfully in persistent database.',
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
