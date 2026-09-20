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
  Clock,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  MonitorUp,
  Info,
  Plus,
  Copy,
  Check,
  Film,
  Radio,
  X,
  ExternalLink,
} from 'lucide-react';

export default function TutorClassesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    scheduled_start: '',
    duration_minutes: 60,
    recording_mandatory: true,
    student_screen_share_allowed: true,
    notes: '',
  });

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const tutorId = user?.id || '';
      const url = tutorId ? `/api/classes?teacherId=${encodeURIComponent(tutorId)}` : '/api/classes';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Failed to load tutor classes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [user?.id]);

  const handleCopyLink = (cls: ClassModel) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tutorplug.com';
    const link = `${origin}/meet/${cls.meeting_code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(cls.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teacher_id: user?.id || 'usr-1788795018002-quazl',
          created_by: user?.id || 'tutor',
          scheduled_start: formData.scheduled_start
            ? new Date(formData.scheduled_start).toISOString()
            : new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowScheduleModal(false);
        setFormData({
          title: '',
          subject: 'Mathematics',
          scheduled_start: '',
          duration_minutes: 60,
          recording_mandatory: true,
          student_screen_share_allowed: true,
          notes: '',
        });
        loadClasses();
      }
    } catch (err) {
      console.error('Failed to schedule class:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const liveClasses = classes.filter((c) => c.status === 'live');
  const upcomingClasses = classes.filter((c) => c.status === 'scheduled');
  const pastClasses = classes.filter((c) => c.status === 'completed' || c.status === 'ended');

  return (
    <DashboardLayout role="tutor">
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Live Teaching Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Teaching Sessions & Classrooms 👨‍🏫
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Schedule interactive video classes with unlimited duration, smart whiteboard, and recording controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/tutor/recordings">
              <Button variant="outline" size="sm" leftIcon={<Film className="h-4 w-4" />}>
                Recordings Archive
              </Button>
            </Link>
            <Button
              variant="gradient"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowScheduleModal(true)}
            >
              Schedule New Class
            </Button>
          </div>
        </div>

        {/* Live Classes In Progress */}
        {liveClasses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Your Live Classes (In Progress)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-6 rounded-3xl border-2 border-rose-400/50 bg-rose-50/40 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                        <Radio className="h-3.5 w-3.5" />
                        LIVE STREAMING
                      </span>
                      <span className="text-xs font-mono text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg font-bold border border-rose-200">
                        {cls.meeting_code}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900">{cls.title}</h3>
                    <p className="text-xs text-slate-600">
                      Subject: <strong>{cls.subject}</strong> • Room ID: <code className="font-mono">{cls.id}</code>
                    </p>
                  </div>

                  <div className="pt-4 mt-3 flex items-center justify-between gap-3 border-t border-rose-200/60">
                    <button
                      onClick={() => handleCopyLink(cls)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      {copiedId === cls.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedId === cls.id ? 'Copied Link' : 'Copy Student Link'}</span>
                    </button>

                    <Link href={`/classroom/${cls.id}`}>
                      <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
                        <Video className="h-4 w-4" />
                        Re-Enter Classroom
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
              Scheduled Sessions ({upcomingClasses.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-52 rounded-3xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : upcomingClasses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 p-8">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No scheduled sessions</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You can create an instant or scheduled tutoring class by clicking below.
              </p>
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={() => setShowScheduleModal(true)}>
                  Schedule Your First Class
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="blue" size="sm">{cls.subject}</Badge>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cls.meeting_code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{cls.title}</h3>
                      {cls.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cls.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
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
                      title="Copy Student Link"
                    >
                      {copiedId === cls.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>

                    <Link href={`/classroom/${cls.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white">
                        Start / Enter Room
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Schedule New Class</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure room options, subject, and student permissions.
                  </p>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thermodynamics & Heat Transfer (JEE Adv)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                    <select
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={45}>45 mins</option>
                      <option value={60}>60 mins</option>
                      <option value={90}>90 mins</option>
                      <option value={120}>120 mins</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date & Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_start}
                    onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Notes & Agenda</label>
                  <textarea
                    rows={2}
                    placeholder="Topics covered, homework review, problem sheets..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recording_mandatory}
                      onChange={(e) => setFormData({ ...formData, recording_mandatory: e.target.checked })}
                      className="rounded-sm text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Mandatory Class Recording (Platform policy compliance)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.student_screen_share_allowed}
                      onChange={(e) => setFormData({ ...formData, student_screen_share_allowed: e.target.checked })}
                      className="rounded-sm text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Allow Student Screen Sharing</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Class...' : 'Schedule & Generate Code'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
