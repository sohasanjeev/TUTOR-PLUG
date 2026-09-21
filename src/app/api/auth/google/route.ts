import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { UserRole } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, avatar, role = 'student' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const fullName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];
    const userRole: UserRole = role === 'tutor' ? 'tutor' : role === 'admin' ? 'admin' : 'student';

    // Look up or auto-provision Google user profile
    const profile = serverDB.findOrCreateGoogleProfile({
      email: cleanEmail,
      full_name: fullName,
      role: userRole,
      avatar_url: avatar,
    });

    // Auto-create role-specific profile if not present
    let studentProfile = serverDB.getStudentProfile(profile.id);
    let tutorProfile = serverDB.getTutorById(profile.id);

    if (userRole === 'student' && !studentProfile) {
      studentProfile = serverDB.saveStudentProfile(profile.id, {
        class_level: 'Class 11',
        board: 'CBSE',
        preferred_language: 'English',
        learning_goals: 'IIT-JEE & Board Exams',
        timezone: 'Asia/Kolkata',
      });
    }

    return NextResponse.json({
      success: true,
      user: profile,
      studentProfile,
      tutorProfile,
      message: 'Signed in with Google successfully.',
    });
  } catch (error) {
    console.error('Google Auth API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during Google sign in.' },
      { status: 500 }
    );
  }
}
