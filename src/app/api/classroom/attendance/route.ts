import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, meetingId, classId, user } = body;

    if (!meetingId || !user || !user.id) {
      return NextResponse.json({ success: false, error: 'Missing required attendance fields' }, { status: 400 });
    }

    if (action === 'join') {
      const record = serverDB.logAttendanceJoin(meetingId, classId || meetingId, {
        id: user.id,
        name: user.full_name || user.name || 'Participant',
        role: (user.role as UserRole) || 'student',
      });
      return NextResponse.json({ success: true, record });
    }

    if (action === 'heartbeat') {
      serverDB.logAttendanceHeartbeat(meetingId, user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'leave') {
      const record = serverDB.logAttendanceLeave(meetingId, user.id);
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ success: false, error: 'Unknown attendance action' }, { status: 400 });
  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json({ success: false, error: 'Attendance operation failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');
    const classId = searchParams.get('classId');

    if (meetingId) {
      const records = serverDB.getAttendanceForMeeting(meetingId);
      return NextResponse.json({ success: true, records });
    }

    if (classId) {
      const records = serverDB.getAttendanceForClass(classId);
      return NextResponse.json({ success: true, records });
    }

    const records = serverDB.getAllAttendance();
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve attendance' }, { status: 500 });
  }
}
