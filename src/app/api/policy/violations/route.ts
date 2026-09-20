import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';
import { AdminAction } from '@/lib/types';

export async function GET() {
  try {
    const violations = serverDB.getPolicyViolations();
    return NextResponse.json({ success: true, violations });
  } catch (error) {
    console.error('Violations GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch policy violations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status = 'action_taken' } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Violation ID and action are required' }, { status: 400 });
    }

    const updated = serverDB.updatePolicyViolation(id, action as AdminAction, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Violation record not found' }, { status: 404 });
    }

    // Log admin audit
    serverDB.logAudit({
      admin_id: 'usr-admin-master',
      admin_name: 'Platform Administrator',
      action: `POLICY_ACTION_${action.toUpperCase()}`,
      target_type: 'policy_violation',
      target_id: id,
      details: `Enforced ${action} on user ${updated.user_name} (${updated.user_id}) for category ${updated.category}.`,
    });

    return NextResponse.json({ success: true, violation: updated });
  } catch (error) {
    console.error('Violations POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update policy violation' }, { status: 500 });
  }
}
