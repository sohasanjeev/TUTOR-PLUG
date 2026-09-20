import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, class_level, board, preferred_language, learning_goals } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required.' },
        { status: 400 }
      );
    }

    const student = serverDB.saveStudentProfile(userId, {
      class_level,
      board,
      preferred_language,
      learning_goals,
    });

    return NextResponse.json({
      success: true,
      student,
      message: 'Student profile saved in database.',
    });
  } catch (error) {
    console.error('Student Onboarding Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
