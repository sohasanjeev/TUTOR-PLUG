import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET() {
  try {
    const profiles = serverDB.getProfiles();
    const tutors = serverDB.getTutors();

    // Attach student & tutor details to profiles
    const enriched = profiles.map((p) => {
      const student = serverDB.getStudentProfile(p.id);
      const tutor = tutors.find((t) => t.user_id === p.id || t.id === p.id);
      return {
        ...p,
        student,
        tutor,
      };
    });

    return NextResponse.json({
      success: true,
      users: enriched,
      tutors,
      total: enriched.length,
    });
  } catch (error) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
