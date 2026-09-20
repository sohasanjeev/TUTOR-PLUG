import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { analyzeMessage } from '@/lib/moderation';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ success: false, error: 'meetingId is required' }, { status: 400 });
    }

    const messages = serverDB.getChatMessages(meetingId);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      meetingId,
      classId,
      senderId,
      senderName,
      senderRole,
      message,
      messageType = 'text',
      attachmentUrl,
      attachmentType,
      attachmentSize,
      attachmentName,
    } = body;

    if (!meetingId || !senderId || (!message && !attachmentUrl)) {
      return NextResponse.json({ success: false, error: 'Missing required chat fields' }, { status: 400 });
    }

    const settings = serverDB.getPlatformPolicySettings();

    // Run moderation analysis on text messages
    let moderationStatus: 'clean' | 'flagged' | 'blocked' = 'clean';
    let policyAlert: string | undefined;

    if (messageType === 'text' && message) {
      const moderationResult = analyzeMessage(message, {
        sensitivity: settings.moderation_sensitivity,
        autoBlock: settings.auto_block_contact_info,
      });

      if (moderationResult.isViolation) {
        // Log violation for Admin Review Queue
        serverDB.logPolicyViolation({
          meeting_id: meetingId,
          class_id: classId || meetingId,
          user_id: senderId,
          user_name: senderName || 'User',
          user_role: (senderRole as UserRole) || 'student',
          message_id: `temp-${Date.now()}`,
          message_snippet: moderationResult.matchedSnippet || message.substring(0, 100),
          category: moderationResult.category || 'off_platform',
          confidence: moderationResult.confidence,
          status: 'pending_review',
          admin_action: 'none',
        });

        if (moderationResult.action === 'block') {
          return NextResponse.json(
            {
              success: false,
              blocked: true,
              category: moderationResult.category,
              error:
                'This message appears to contain personal contact information or an off-platform payment request. Tutor Plug platform policy requires all tutoring communication to stay within the classroom.',
            },
            { status: 422 }
          );
        } else {
          moderationStatus = 'flagged';
          policyAlert = 'Flagged for admin moderation review.';
        }
      }
    }

    const savedMsg = serverDB.saveChatMessage({
      meeting_id: meetingId,
      class_id: classId || meetingId,
      sender_id: senderId,
      sender_name: senderName || 'User',
      sender_role: (senderRole as UserRole) || 'student',
      message: message || '',
      message_type: messageType,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_size: attachmentSize,
      attachment_name: attachmentName,
      moderation_status: moderationStatus,
    });

    return NextResponse.json({
      success: true,
      message: savedMsg,
      policyAlert,
    });
  } catch (error) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
