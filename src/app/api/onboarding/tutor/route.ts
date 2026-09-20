import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { INITIAL_SUBJECTS, INITIAL_BOARDS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      headline,
      degree,
      institution,
      experience_years,
      hourly_rate,
      bio,
      teaching_methodology,
      selectedSubjects,
      selectedBoards,
      profile_completion_percentage,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Map subject names to subject objects
    const subjects = (selectedSubjects || []).map((name: string) => {
      const match = INITIAL_SUBJECTS.find((s) => s.name === name);
      return match || { id: `sub-${Date.now()}`, name, slug: name.toLowerCase().replace(/\s+/g, '-') };
    });

    const boards = (selectedBoards || []).map((name: string) => {
      const match = INITIAL_BOARDS.find((b) => b.name === name);
      return match || { id: `brd-${Date.now()}`, name };
    });

    // Save genuine tutor profile to serverDB with unverified status
    const tutor = serverDB.saveTutorProfile(userId, {
      headline,
      degree,
      institution,
      qualifications: `${degree} from ${institution}`,
      experience_years: Number(experience_years) || 0,
      hourly_rate: Number(hourly_rate) || 1000,
      bio,
      teaching_methodology,
      subjects,
      boards,
      profile_completion_percentage: Number(profile_completion_percentage) || 75,
      verification_status: 'unverified', // Starts in unverified pending review
    });

    return NextResponse.json({
      success: true,
      tutor,
      message: 'Tutor application successfully saved in database. Awaiting administrative verification.',
    });
  } catch (error) {
    console.error('Tutor Application Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
