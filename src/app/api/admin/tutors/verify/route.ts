import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tutorId, status } = body;

    if (!tutorId || !status) {
      return NextResponse.json(
        { success: false, message: 'Tutor ID and Status are required.' },
        { status: 400 }
      );
    }

    if (!['verified', 'unverified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be verified, unverified, or rejected.' },
        { status: 400 }
      );
    }

    const updated = serverDB.updateTutorVerification(tutorId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Tutor not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tutor: updated,
      message: `Tutor verification status updated to ${status}.`,
    });
  } catch (error) {
    console.error('Admin Verify API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
