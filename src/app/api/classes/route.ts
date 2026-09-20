import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    let classes = serverDB.getClasses();

    if (status) {
      classes = classes.filter((c) => c.status === status);
    }
    if (teacherId) {
      classes = classes.filter((c) => c.teacher_id === teacherId);
    }
    if (studentId) {
      classes = classes.filter((c) => c.student_ids.includes(studentId));
    }
    if (search) {
      classes = classes.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.subject.toLowerCase().includes(search) ||
          c.meeting_code.toLowerCase().includes(search) ||
          c.teacher?.full_name.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Classes GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subject,
      teacher_id,
      student_ids,
      scheduled_start,
      duration_minutes = 60,
      recurring = false,
      recording_mandatory = true,
      student_screen_share_allowed = true,
      notes = '',
      created_by,
    } = body;

    if (!title || !subject) {
      return NextResponse.json({ success: false, error: 'Title and subject are required' }, { status: 400 });
    }

    const newClass = serverDB.createClass({
      title,
      subject,
      teacher_id: teacher_id || 'usr-1788795018002-quazl',
      student_ids: student_ids && student_ids.length > 0 ? student_ids : ['usr-student-main'],
      created_by: created_by || teacher_id || 'admin',
      status: 'scheduled',
      scheduled_start: scheduled_start || new Date().toISOString(),
      duration_minutes,
      recurring,
      recording_mandatory,
      student_screen_share_allowed,
      notes,
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error) {
    console.error('Classes POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create class' }, { status: 500 });
  }
}
