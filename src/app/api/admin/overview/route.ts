import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET() {
  try {
    const stats = serverDB.getStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Admin Overview API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
