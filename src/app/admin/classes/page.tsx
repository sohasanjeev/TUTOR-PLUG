'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClassModel, Profile, TutorProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  Plus,
  Search,
  Video,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'live' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Create Class
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('Physics');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('18:00');
  const [formDuration, setFormDuration] = useState(60);
  const [formRecurring, setFormRecurring] = useState(false);
  const [formRecordingMandatory, setFormRecordingMandatory] = useState(true);
  const [formStudentScreenShare, setFormStudentScreenShare] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resClasses, resUsers] = await Promise.all([
        fetch('/api/classes').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
      ]);

      if (resClasses.success) {
        setClasses(resClasses.classes || []);
      }
      if (resUsers.success) {
        setTutors(resUsers.tutors || []);
        setStudents((resUsers.users || []).filter((u: Profile) => u.role === 'student'));
        if (resUsers.tutors && resUsers.tutors.length > 0 && !formTeacherId) {
          setFormTeacherId(resUsers.tutors[0].user_id);
        }
        if (resUsers.users && !formStudentId) {
          const firstStud = resUsers.users.find((u: Profile) => u.role === 'student');
          if (firstStud) setFormStudentId(firstStud.id);
        }
      }
    } catch (e) {
      console.error('Failed to load classes data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const scheduledDateTime = formDate
        ? new Date(`${formDate}T${formTime || '18:00'}:00`).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();

      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          subject: formSubject,
          teacher_id: formTeacherId,
          student_ids: formStudentId ? [formStudentId] : [],
          scheduled_start: scheduledDateTime,
          duration_minutes: formDuration,
          recurring: formRecurring,
          recording_mandatory: formRecordingMandatory,
          student_screen_share_allowed: formStudentScreenShare,
          notes: formNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormTitle('');
        setFormNotes('');
        loadData();
      }
    } catch (err) {
      console.error('Failed to create class:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = classes.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.meeting_code.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher?.full_name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Class Schedules & Meeting Rooms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create, view, and administer all 1-on-1 and group classes across Tutor Plug.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              variant="gradient"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Schedule New Class
            </Button>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/90 text-xs">
            {(['all', 'live', 'scheduled', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'live' ? '● Live' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by class, subject, tutor, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Classes Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Class / Subject</th>
                  <th className="px-6 py-3.5">Room Code</th>
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Enrolled Student</th>
                  <th className="px-6 py-3.5">Scheduled Time</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">{cls.title}</span>
                      <span className="text-[11px] text-indigo-600 font-semibold block">{cls.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-xs">
                        {cls.meeting_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {cls.teacher?.full_name || 'Assigned Tutor'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {cls.students && cls.students.length > 0
                        ? cls.students.map((s) => s.full_name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-medium text-slate-800">{formatDate(cls.scheduled_start)}</span>
                      <span className="text-[10px] text-slate-400 block">{cls.duration_minutes} Minutes</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cls.status === 'live'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                            : cls.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/admin/classes/${cls.id}`}>
                          <button className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </button>
                        </Link>
                        <Link href={`/classroom/${cls.meeting_code}`} target="_blank">
                          <button className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                            <ExternalLink className="h-3 w-3" />
                            <span>Join</span>
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      No classes found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule New Class Modal (Section 16) */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Video className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-black text-slate-900">Schedule Tutoring Class</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics — Kinematics & Laws of Motion"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject</label>
                    <select
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English Literature">English Literature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Teacher</label>
                    <select
                      value={formTeacherId}
                      onChange={(e) => setFormTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {tutors.map((t) => (
                        <option key={t.id} value={t.user_id}>
                          {t.user?.full_name || 'Tutor'} ({t.qualifications || 'Verified'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Student</label>
                    <select
                      value={formStudentId}
                      onChange={(e) => setFormStudentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name} ({s.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expected Duration</label>
                    <select
                      value={formDuration}
                      onChange={(e) => setFormDuration(parseInt(e.target.value, 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                      <option value={120}>120 Minutes (2 Hours)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Permissions & Policies */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRecordingMandatory}
                      onChange={(e) => setFormRecordingMandatory(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-semibold">
                      Mandatory Class Recording (Recommended for safety & quality)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formStudentScreenShare}
                      onChange={(e) => setFormStudentScreenShare(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-semibold">
                      Allow Student Screen Sharing in this session
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 font-semibold">
                      Recurring Weekly Tutoring Class
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Curriculum Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Chapter, homework review topics, or student doubts..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button type="button" variant="secondary" size="md" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" size="md" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Room...' : 'Create & Generate Link'}
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
