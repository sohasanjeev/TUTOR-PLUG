'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RecordingRecord } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Video,
  Play,
  Pause,
  Download,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  Maximize2,
  HardDrive,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export default function AdminRecordingsPage() {
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Watch Modal State
  const [activeRecording, setActiveRecording] = useState<RecordingRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      if (data.success) {
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      console.error('Failed to load recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const handleDeleteRecording = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this official class recording according to retention policy?')) {
      try {
        await fetch(`/api/recordings?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        loadRecordings();
      } catch (err) {
        console.error('Failed to delete recording:', err);
      }
    }
  };

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
    const matchesSearch =
      !query ||
      r.title.toLowerCase().includes(query) ||
      r.teacher?.full_name.toLowerCase().includes(query) ||
      r.student?.full_name.toLowerCase().includes(query) ||
      r.class_info?.subject.toLowerCase().includes(query) ||
      r.meeting_id.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      return new Date(r.created_at).toDateString() === today;
    }
    if (dateFilter === '7days') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      return new Date(r.created_at).getTime() >= sevenDaysAgo;
    }
    if (dateFilter === '30days') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000;
      return new Date(r.created_at).getTime() >= thirtyDaysAgo;
    }
    return true;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Encrypted Object Storage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Class Recordings Repository 🎥
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All tutoring sessions recorded under platform safety, dispute resolution, and retention policy.
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
              {recordings.length} Recorded Sessions
            </div>
          </div>
        </div>

        {/* Search & Date Range Filters (Section 24) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/90 text-xs">
            {(['all', 'today', '7days', '30days'] as const).map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                  dateFilter === df ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {df === '7days' ? 'Last 7 Days' : df === '30days' ? 'Last 30 Days' : df}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by teacher, student, subject, room ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dedicated Recordings Table (Section 13) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Class / Subject</th>
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">File Size</th>
                  <th className="px-6 py-3.5 text-right">Recording Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {formatDate(rec.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">{rec.title}</span>
                      <span className="text-[11px] text-indigo-600 font-semibold block">
                        {rec.class_info?.subject || 'Academic Tutoring'} • Room {rec.meeting_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {rec.teacher?.full_name || 'Dr. Arjun Sharma'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {rec.student?.full_name || 'Rohan Mehta'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDuration(rec.duration_seconds)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {formatBytes(rec.file_size)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setActiveRecording(rec)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Watch</span>
                        </button>

                        <a
                          href={`/api/recordings/stream?id=${rec.id}`}
                          download={`${rec.title}.webm`}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          title="Download recording"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>

                        <button
                          onClick={() => handleDeleteRecording(rec.id)}
                          className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete from storage (Retention Policy)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No recordings found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Video Player Modal (Play, Seek, Fullscreen, Speed) */}
        {activeRecording && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 max-w-4xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-white animate-fadeIn max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">{activeRecording.title}</h3>
                  <p className="text-xs text-slate-400">
                    Instructor: {activeRecording.teacher?.full_name} • Student: {activeRecording.student?.full_name} • Room {activeRecording.meeting_id}
                  </p>
                </div>
                <button
                  onClick={() => setActiveRecording(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Video Player Box */}
              <div className="relative rounded-2xl bg-black overflow-hidden aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
                <video
                  ref={videoRef}
                  src={`/api/recordings/stream?id=${activeRecording.id}`}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Controls & Speed Selector */}
              <div className="flex items-center justify-between gap-3 text-xs pt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        if (videoRef.current) videoRef.current.playbackRate = s;
                      }}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                        playbackSpeed === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/recordings/stream?id=${activeRecording.id}`}
                    download={`${activeRecording.title}.webm`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </a>
                  <button
                    onClick={() => setActiveRecording(null)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
