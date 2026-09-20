import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    let recordings = serverDB.getRecordings();

    if (teacherId) {
      recordings = recordings.filter((r) => r.teacher_id === teacherId);
    }
    if (studentId) {
      recordings = recordings.filter((r) => r.student_id === studentId);
    }
    if (classId) {
      recordings = recordings.filter((r) => r.class_id === classId);
    }
    if (search) {
      recordings = recordings.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.teacher?.full_name.toLowerCase().includes(search) ||
          r.student?.full_name.toLowerCase().includes(search) ||
          r.class_info?.subject.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, recordings });
  } catch (error) {
    console.error('Recordings GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recordings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Recording ID is required' }, { status: 400 });
    }

    const deleted = serverDB.deleteRecording(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Recording not found or could not be removed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Recordings DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete recording' }, { status: 500 });
  }
}
