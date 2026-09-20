import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, fromPeer, toPeer, data } = body;

    if (!roomId || !fromPeer || !data) {
      return NextResponse.json({ success: false, error: 'Missing required signaling fields' }, { status: 400 });
    }

    serverDB.addSignal(roomId, fromPeer, toPeer, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signaling POST error:', error);
    return NextResponse.json({ success: false, error: 'Signaling failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const peerId = searchParams.get('peerId');

    if (!roomId || !peerId) {
      return NextResponse.json({ success: false, error: 'roomId and peerId are required' }, { status: 400 });
    }

    const signals = serverDB.getSignals(roomId, peerId);
    return NextResponse.json({ success: true, signals });
  } catch (error) {
    console.error('Signaling GET error:', error);
    return NextResponse.json({ success: false, error: 'Signaling fetch failed' }, { status: 500 });
  }
}
