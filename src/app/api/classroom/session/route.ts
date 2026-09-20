import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeOrId = searchParams.get('roomId') || searchParams.get('code');
    const userId = searchParams.get('userId');

    if (!codeOrId) {
      return NextResponse.json({ success: false, error: 'Room ID or meeting code is required' }, { status: 400 });
    }

    // Try finding by meeting code or class id
    let classInfo = serverDB.getClassByMeetingCode(codeOrId);
    if (!classInfo) {
      classInfo = serverDB.getClassById(codeOrId);
    }

    // If not found, create or return a flexible ad-hoc room configuration
    if (!classInfo) {
      classInfo = serverDB.createClass({
        title: `Tutoring Room ${codeOrId}`,
        subject: 'General Tutoring',
        meeting_code: codeOrId.toUpperCase(),
        status: 'live',
        student_screen_share_allowed: true,
        recording_mandatory: true,
      });
    }

    // Get active meeting session or start one
    let meeting = serverDB.getMeetingByCode(classInfo.meeting_code);
    if (!meeting || meeting.status !== 'active') {
      meeting = serverDB.startMeeting(classInfo.id, classInfo.meeting_code);
    }

    // Check policy acceptance if user ID provided
    const hasAcceptedPolicy = userId ? serverDB.hasAcceptedPolicy(userId) : true;
    const settings = serverDB.getPlatformPolicySettings();

    return NextResponse.json({
      success: true,
      classInfo,
      meeting,
      hasAcceptedPolicy,
      settings,
    });
  } catch (error) {
    console.error('Session route error:', error);
    return NextResponse.json({ success: false, error: 'Failed to initialize session' }, { status: 500 });
  }
}
