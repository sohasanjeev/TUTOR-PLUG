'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { ClassModel } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Video,
  Mic,
  MonitorUp,
  FileText,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Search,
  ArrowRight,
  Copy,
  Check,
  Film,
  Radio,
} from 'lucide-react';

export default function StudentClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [meetingCode, setMeetingCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const studentId = user?.id || '';
      const url = studentId ? `/api/classes?studentId=${encodeURIComponent(studentId)}` : '/api/classes';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user?.id]);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = meetingCode.trim();
    if (!cleanCode) return;

    if (cleanCode.startsWith('http://') || cleanCode.startsWith('https://')) {
      window.location.href = cleanCode;
      return;
    }

    if (cleanCode.startsWith('TP-') || cleanCode.length <= 10) {
      router.push(`/meet/${cleanCode}`);
    } else {
      router.push(`/classroom/${cleanCode}`);
    }
  };

  const handleCopyLink = (classItem: ClassModel) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tutorplug.com';
    const link = `${origin}/meet/${classItem.meeting_code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(classItem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const liveClasses = classes.filter((c) => c.status === 'live');
  const upcomingClasses = classes.filter((c) => c.status === 'scheduled');
  const pastClasses = classes.filter((c) => c.status === 'completed' || c.status === 'ended');

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Live Video Classrooms
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Virtual Classroom Hub 🎓
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join live classes with your verified tutors, test your hardware, or enter with a meeting code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/recordings">
              <Button variant="outline" size="sm" leftIcon={<Film className="h-4 w-4" />}>
                Class Recordings
              </Button>
            </Link>
            <Link href="/classroom/device-test-room">
              <Button variant="secondary" size="sm" leftIcon={<Video className="h-4 w-4" />}>
                Test Audio & Video
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Join With Meeting Code Card */}
        <div className="rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/80 via-white to-white p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Instant Room Access
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Join a Classroom with Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 mb-4">
              Enter the meeting room code shared by your tutor (e.g., <code className="bg-white px-2 py-0.5 rounded-md border border-indigo-200 font-mono text-indigo-600 font-bold">TP-99281</code>) or a full meeting link.
            </p>

            <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter room code (e.g. TP-99281) or URL"
                className="flex-1 px-4 py-3 rounded-2xl border border-indigo-200 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
              <Button
                type="submit"
                variant="gradient"
                size="md"
                className="px-6 shrink-0"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                disabled={!meetingCode.trim()}
              >
                Enter Classroom
              </Button>
            </form>
          </div>
        </div>

        {/* Live Classes Banner if Any */}
        {liveClasses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Live Now (In Progress)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 rounded-3xl border-2 border-rose-400/50 bg-rose-50/30 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                        <Radio className="h-3.5 w-3.5" />
                        LIVE NOW
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-semibold">
                        {cls.meeting_code}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{cls.title}</h3>
                    <p className="text-xs text-slate-600">
                      Subject: <strong>{cls.subject}</strong> • Tutor: <strong>{cls.teacher?.full_name || 'Assigned Tutor'}</strong>
                    </p>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between gap-3 border-t border-rose-100">
                    <button
                      onClick={() => handleCopyLink(cls)}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {copiedId === cls.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedId === cls.id ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <Link href={`/meet/${cls.meeting_code}`}>
                      <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                        Join Live Class
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Upcoming Classes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Scheduled Classes ({upcomingClasses.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No scheduled classes right now</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When you book lessons with tutors, your upcoming live video classes will appear right here.
              </p>
              <div className="mt-4">
                <Link href="/tutors">
                  <Button variant="gradient" size="sm">
                    Book a Tutor
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="blue" size="sm">{cls.subject}</Badge>
                      <span className="text-xs font-mono text-slate-500">{cls.meeting_code}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{cls.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Tutor: <strong className="text-slate-700">{cls.teacher?.full_name || 'Tutor'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        {formatDate(cls.scheduled_start)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {cls.duration_minutes} mins
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(cls)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                      title="Copy Link"
                    >
                      {copiedId === cls.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>

                    <Link href={`/meet/${cls.meeting_code}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        Enter Classroom
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classroom Hardware Readiness Checklist */}
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tutor Plug Classroom Features & Device Check
              </h3>
              <p className="text-xs text-slate-500">
                Our classrooms run in high-definition WebRTC with integrated security and recording.
              </p>
            </div>
            <Link href="/classroom/device-test-room">
              <Button variant="outline" size="sm">
                Run Pre-Flight Test
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-600">
                <Video className="h-4 w-4" />
                <span>Unlimited Meeting Duration</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                No 40-minute cutoffs. Classes run as long as required for complete concept mastery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-600">
                <MonitorUp className="h-4 w-4" />
                <span>Screen Share & Smart Canvas</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Collaborative digital whiteboard with multi-color pens, eraser, and snapshot export.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Policy Protected Chat</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Safe sharing of PDFs, images, and homework files with automated moderation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
