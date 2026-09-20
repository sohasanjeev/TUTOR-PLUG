import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET() {
  try {
    const policySettings = serverDB.getPlatformPolicySettings();
    return NextResponse.json({ success: true, policySettings });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = serverDB.updatePlatformPolicySettings(body);
    return NextResponse.json({ success: true, policySettings: updated });
  } catch (err) {
    console.error('Settings POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
