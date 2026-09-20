import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { calculateCommission } from '@/lib/utils';
import { Booking } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const tutorId = searchParams.get('tutor_id');

    let bookings = serverDB.getBookings();

    if (studentId) {
      bookings = bookings.filter((b) => b.student_id === studentId);
    }
    if (tutorId) {
      bookings = bookings.filter((b) => b.tutor_id === tutorId);
    }

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Bookings GET API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      tutorId,
      subjectId,
      scheduledStart,
      scheduledEnd,
      durationMinutes,
      notes,
    } = body;

    if (!studentId || !tutorId) {
      return NextResponse.json(
        { success: false, message: 'Student ID and Tutor ID are required.' },
        { status: 400 }
      );
    }

    const tutor = serverDB.getTutorById(tutorId);
    const rate = tutor ? tutor.hourly_rate : 1000;
    const duration = Number(durationMinutes) || 60;
    const subtotal = Math.round((rate * duration) / 60);
    const { platformFee, tutorEarning } = calculateCommission(subtotal, 25);

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      student_id: studentId,
      tutor_id: tutorId,
      subject_id: subjectId || 'sub-1',
      scheduled_start: scheduledStart || new Date().toISOString(),
      scheduled_end: scheduledEnd || new Date(Date.now() + duration * 60000).toISOString(),
      duration_minutes: duration,
      hourly_rate: rate,
      subtotal,
      platform_commission: platformFee,
      tutor_earning: tutorEarning,
      currency: 'INR',
      status: 'confirmed',
      meeting_id: `tp-meet-${Math.random().toString(36).substring(2, 8)}`,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tutor: tutor || undefined,
    };

    serverDB.createBooking(newBooking);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: 'Booking created and saved in database.',
    });
  } catch (error) {
    console.error('Booking POST API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
