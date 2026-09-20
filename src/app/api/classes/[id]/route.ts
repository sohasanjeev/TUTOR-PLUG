import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Class ID is required' }, { status: 400 });
    }

    let classInfo = serverDB.getClassById(id);
    if (!classInfo) {
      classInfo = serverDB.getClassByMeetingCode(id);
    }

    if (!classInfo) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    // Associated meeting
    const meeting =
      serverDB.getMeetingByCode(classInfo.meeting_code) ||
      serverDB.getMeetings().find((m) => m.class_id === classInfo?.id);

    // Attendance
    const attendance = serverDB.getAttendanceForClass(classInfo.id);

    // Chat messages
    const chatMessages = serverDB.getAllChatMessages().filter(
      (m) => m.class_id === classInfo?.id || (meeting && m.meeting_id === meeting.id)
    );

    // Shared files (from chat messages with attachments)
    const sharedFiles = chatMessages
      .filter((m) => Boolean(m.attachment_url))
      .map((m) => ({
        url: m.attachment_url,
        type: m.attachment_type || m.message_type,
        name: m.attachment_name || 'Class Attachment',
        size: m.attachment_size,
        senderName: m.sender_name,
        timestamp: m.created_at,
      }));

    // Associated recordings
    const recordings = serverDB
      .getRecordings()
      .filter((r) => r.class_id === classInfo?.id || (meeting && r.meeting_id === meeting.id));

    // Associated policy violations
    const violations = serverDB
      .getPolicyViolations()
      .filter((v) => v.class_id === classInfo?.id || (meeting && v.meeting_id === meeting.id));

    return NextResponse.json({
      success: true,
      classInfo,
      meeting,
      attendance,
      chatMessages,
      sharedFiles,
      recordings,
      violations,
    });
  } catch (error) {
    console.error('Class details GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve class details' }, { status: 500 });
  }
}
