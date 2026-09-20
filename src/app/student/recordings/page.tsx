'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecordingRecord } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  Video,
  Play,
  Pause,
  Download,
  Search,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  Maximize2,
  BookOpen,
  User,
  Film,
} from 'lucide-react';

export default function StudentRecordingsPage() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Watch Modal State
  const [activeRecording, setActiveRecording] = useState<RecordingRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      // Fetch recordings for the current student
      const url = user?.id ? `/api/recordings?studentId=${encodeURIComponent(user.id)}` : '/api/recordings';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      console.error('Failed to load student recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, [user?.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatDuration = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const filtered = recordings.filter((r) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      r.title.toLowerCase().includes(query) ||
      r.teacher?.full_name.toLowerCase().includes(query) ||
      r.class_info?.subject.toLowerCase().includes(query) ||
      r.meeting_id.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Revision & Review
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Class Recordings 🎥
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Watch past tutoring sessions, review homework solutions, and replay lessons anytime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadRecordings}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
              {filtered.length} Available Recordings
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by class title, subject, teacher name or room code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-hidden text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Recordings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <Film className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No recordings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {search
                ? 'No recorded sessions match your search query.'
                : 'Your recorded tutoring sessions will automatically appear here once classes conclude.'}
            </p>
            <div className="mt-6">
              <Link href="/student/classes">
                <Button variant="outline" size="sm">
                  Go to My Classes
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((recording) => (
              <div
                key={recording.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="h-40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="flex items-center justify-between z-10">
                      <Badge variant="purple" size="sm">
                        {recording.class_info?.subject || 'Class'}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded-md">
                        {formatDuration(recording.duration_seconds)}
                      </span>
                    </div>

                    <div className="z-10 flex items-center justify-center">
                      <button
                        onClick={() => {
                          setActiveRecording(recording);
                          setIsPlaying(true);
                        }}
                        className="h-12 w-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md flex items-center justify-center transition-all group-hover:scale-110 shadow-lg cursor-pointer"
                        title="Play Video"
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between z-10 text-[11px] text-slate-300">
                      <span className="font-mono text-slate-400">{recording.meeting_id}</span>
                      <span>{formatBytes(recording.file_size)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                      {recording.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Teacher: <strong>{recording.teacher?.full_name || 'Tutor'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(recording.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs gap-1.5"
                    onClick={() => {
                      setActiveRecording(recording);
                      setIsPlaying(true);
                    }}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Watch Lesson
                  </Button>

                  <a
                    href={`/api/recordings/stream?id=${encodeURIComponent(recording.id)}`}
                    download={`${recording.title.replace(/\s+/g, '_')}.mp4`}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Download Video File"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {activeRecording && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">
              {/* Modal Top Bar */}
              <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {activeRecording.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Taught by {activeRecording.teacher?.full_name} • {formatDate(activeRecording.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveRecording(null);
                      setIsPlaying(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Video Player Surface */}
              <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src={`/api/recordings/stream?id=${encodeURIComponent(activeRecording.id)}`}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              {/* Modal Bottom Controls */}
              <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackSpeed(rate);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = rate;
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          playbackSpeed === rate
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`/api/recordings/stream?id=${encodeURIComponent(activeRecording.id)}`}
                    download={`${activeRecording.title.replace(/\s+/g, '_')}.mp4`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Class
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
