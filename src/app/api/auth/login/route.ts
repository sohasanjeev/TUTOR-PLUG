import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, otp, role, full_name } = body;

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

    // Verify dynamic one-time password from real SMS/database
    const verifyResult = serverDB.verifyOtp(phone, otp);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { success: false, message: verifyResult.message || 'Invalid or expired OTP code.' },
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
