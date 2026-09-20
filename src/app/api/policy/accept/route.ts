import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, version = '1.0' } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const acceptance = serverDB.acceptPolicy(userId, (role as UserRole) || 'student', version);
    return NextResponse.json({ success: true, acceptance });
  } catch (error) {
    console.error('Policy accept error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record policy acceptance' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const hasAccepted = serverDB.hasAcceptedPolicy(userId);
    return NextResponse.json({ success: true, hasAccepted });
  } catch (error) {
    console.error('Policy check error:', error);
    return NextResponse.json({ success: false, error: 'Failed to check policy status' }, { status: 500 });
  }
}
