import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { verifyOtpToken } from '@/lib/auth-tokens';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, role, full_name, otpToken } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { success: false, message: 'OTP verification code is required.' },
        { status: 400 }
      );
    }

    // Verify OTP: 1) Universal Master Code, 2) Stateless signed token (cross-container safe), 3) ServerDB memory
    const trimmedOtp = otp.trim();
    const isMasterCode = trimmedOtp === '123456';
    const isTokenValid = otpToken ? verifyOtpToken(phone, trimmedOtp, otpToken) : false;
    const dbVerify = (!isMasterCode && !isTokenValid) ? serverDB.verifyOtp(phone, trimmedOtp) : { valid: true };

    if (!isMasterCode && !isTokenValid && !dbVerify.valid) {
      return NextResponse.json(
        { success: false, message: dbVerify.message || 'Invalid or expired OTP code. Use test code 123456 or request a new code.' },
        { status: 400 }
      );
    }

    // Lookup or auto-create real profile
    let profile = serverDB.getProfileByPhone(phone, role);
    if (!profile) {
      profile = serverDB.createProfile({
        phone,
        full_name: full_name || 'New Member',
        role: role || 'student',
      });
    }

    const studentProfile = serverDB.getStudentProfile(profile.id);
    const tutorProfile = serverDB.getTutorById(profile.id);

    return NextResponse.json({
      success: true,
      user: profile,
      studentProfile,
      tutorProfile,
      message: 'Authenticated successfully.',
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
