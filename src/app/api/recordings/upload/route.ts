import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { serverDB } from '@/lib/server-db';

const RECORDINGS_DIR = path.join(process.cwd(), 'data', 'recordings');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const meetingId = (formData.get('meetingId') as string) || 'mtg-rec';
    const classId = (formData.get('classId') as string) || meetingId;
    const teacherId = (formData.get('teacherId') as string) || 'usr-1788795018002-quazl';
    const studentId = (formData.get('studentId') as string) || 'usr-student-main';
    const durationSeconds = parseInt((formData.get('durationSeconds') as string) || '0', 10);
    const title = (formData.get('title') as string) || 'Live Tutoring Class Session';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No video recording file provided' }, { status: 400 });
    }

    if (!fs.existsSync(RECORDINGS_DIR)) {
      fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    }

    const recId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const filename = `${recId}.webm`;
    const relativePath = path.join('recordings', filename);
    const fullPath = path.join(RECORDINGS_DIR, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(fullPath, buffer);

    const startedAt = new Date(Date.now() - durationSeconds * 1000).toISOString();
    const endedAt = new Date().toISOString();

    const recording = serverDB.saveRecording({
      meeting_id: meetingId,
      class_id: classId,
      teacher_id: teacherId,
      student_id: studentId,
      title,
      storage_path: relativePath,
      file_url: `/api/recordings/stream?id=${recId}`,
      file_size: file.size,
      duration_seconds: durationSeconds || 60,
      started_at: startedAt,
      ended_at: endedAt,
      status: 'available',
      retention_days: 90,
    });

    return NextResponse.json({
      success: true,
      recording,
    });
  } catch (error) {
    console.error('Recording upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload and index class recording' }, { status: 500 });
  }
}
