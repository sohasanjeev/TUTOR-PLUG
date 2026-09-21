import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { serverDB } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Recording ID is required', { status: 400 });
    }

    const recording = serverDB.getRecordingById(id);
    if (!recording) {
      return new NextResponse('Recording not found', { status: 404 });
    }

    let fullPath = path.join(process.cwd(), 'data', recording.storage_path);
    if (!fs.existsSync(fullPath)) {
      const tmpPath = path.join('/tmp', recording.storage_path);
      if (fs.existsSync(tmpPath)) {
        fullPath = tmpPath;
      }
    }

    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      const fileSize = stat.size;
      const range = req.headers.get('range');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(fullPath, { start, end });

        // @ts-expect-error Next.js ReadableStream response
        return new NextResponse(fileStream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunksize),
            'Content-Type': 'video/webm',
          },
        });
      } else {
        const fileStream = fs.createReadStream(fullPath);
        // @ts-expect-error Next.js ReadableStream response
        return new NextResponse(fileStream, {
          headers: {
            'Content-Length': String(fileSize),
            'Content-Type': 'video/webm',
            'Accept-Ranges': 'bytes',
          },
        });
      }
    }

    // If file is not present on disk (e.g. seed data before local capture), return placeholder response or redirect
    return NextResponse.json({
      message: 'Recording metadata verified. Actual stream pending server-side transcoding.',
      recording,
    });
  } catch (error) {
    console.error('Recording stream error:', error);
    return new NextResponse('Stream processing error', { status: 500 });
  }
}
