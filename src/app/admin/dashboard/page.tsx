'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TutorProfile, Profile } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Calendar,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  RefreshCw,
  Radio,
  Film,
  MessageSquare,
  AlertTriangle,
  Video,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalTutors: number;
    verifiedTutors: number;
    pendingTutors: number;
    totalBookings: number;
    grossVolume: number;
    platformCommission: number;
    totalLiveClasses?: number;
    totalRecordedSessions?: number;
    totalRecordedSeconds?: number;
    pendingViolations?: number;
    recentUsers?: Profile[];
  } | null>(null);

  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [resOverview, resUsers] = await Promise.all([
        fetch('/api/admin/overview').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
      ]);

      if (resOverview.success) {
        setStats(resOverview.stats);
      }
      if (resUsers.success) {
        setTutors(resUsers.tutors || []);
        setRecentUsers(resUsers.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveTutor = async (tutorId: string) => {
    try {
      await fetch('/api/admin/tutors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, status: 'verified' }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectTutor = async (tutorId: string) => {
    try {
      await fetch('/api/admin/tutors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, status: 'rejected' }),
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Admin Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                Live Server Database Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Real-Time Platform Administration 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Showing genuine registered students, tutor applicants, and database activity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Live DB</span>
            </button>
            <Link href="/admin/settings">
              <Button variant="secondary" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Live KPI Metrics from Database */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Registered Users
            </span>
            <p className="text-2xl font-black text-slate-900">
              {recentUsers.length}
            </p>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Stored in database
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Teacher Applicants
            </span>
            <p className="text-2xl font-black text-blue-600">
              {tutors.length}
            </p>
            <span className="text-[10px] text-slate-500">
              {stats?.verifiedTutors || tutors.filter((t) => t.verification_status === 'verified').length} verified
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Verification
            </span>
            <p className="text-2xl font-black text-amber-600">
              {tutors.filter((t) => t.verification_status === 'unverified').length}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold">
              Needs your approval
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Class Bookings
            </span>
            <p className="text-2xl font-black text-emerald-600">
              {stats?.totalBookings || 0}
            </p>
            <span className="text-[10px] text-slate-400">Recorded sessions</span>
          </div>
        </div>

        {/* Live Classroom Operations & Policy Suite Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Classroom Operations & Compliance Command Center
              </h2>
              <p className="text-xs text-slate-500">
                Real-time WebRTC sessions, recording vaults, transcripts, and contact-interception monitoring.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Active Monitoring
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Monitor Card */}
            <div className="bg-gradient-to-br from-rose-500/10 via-white to-white rounded-3xl border-2 border-rose-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-rose-500 text-white">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full uppercase">
                    Live Telemetry
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">Live Classes Monitor</h3>
                <p className="text-xs text-slate-500">
                  {stats?.totalLiveClasses || 0} active video rooms running right now.
                </p>
              </div>

              <Link href="/admin/live">
                <Button variant="outline" size="sm" className="w-full text-xs border-rose-200 text-rose-700 hover:bg-rose-50">
                  Open Live Console
                </Button>
              </Link>
            </div>

            {/* Recordings Vault Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-white to-white rounded-3xl border-2 border-indigo-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-indigo-600 text-white">
                    <Film className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    Object Storage
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">Recordings Vault</h3>
                <p className="text-xs text-slate-500">
                  {stats?.totalRecordedSessions || 0} sessions securely recorded & stored.
                </p>
              </div>

              <Link href="/admin/recordings">
                <Button variant="outline" size="sm" className="w-full text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  Browse Recordings
                </Button>
              </Link>
            </div>

            {/* Policy Violations Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-white to-white rounded-3xl border-2 border-amber-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Moderation
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">Policy Violations</h3>
                <p className="text-xs text-slate-500">
                  {stats?.pendingViolations || 0} off-platform contact attempts intercepted.
                </p>
              </div>

              <Link href="/admin/policy-violations">
                <Button variant="outline" size="sm" className="w-full text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                  Review Incidents
                </Button>
              </Link>
            </div>

            {/* Class Schedule & Rooms */}
            <div className="bg-gradient-to-br from-blue-500/10 via-white to-white rounded-3xl border-2 border-blue-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-blue-600 text-white">
                    <Video className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Classrooms
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">Class Scheduling</h3>
                <p className="text-xs text-slate-500">
                  Manage meeting IDs, attendance logs, and student permissions.
                </p>
              </div>

              <Link href="/admin/classes">
                <Button variant="outline" size="sm" className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                  Manage Classes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Real Tutor Applications Verification Queue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Educator Applications & Credential Audit
              </h3>
              <p className="text-xs text-slate-500">
                Live list of teachers who applied to Tutor Plug. Approve them to display them on the public marketplace.
              </p>
            </div>
            <Link href="/admin/tutors" className="text-xs font-bold text-indigo-600 hover:underline">
              Full Tutors Directory ({tutors.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Educator</th>
                  <th className="px-6 py-3.5">Qualifications & Degree</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Hourly Fee</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tutors.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                        alt="Tutor"
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {t.user?.full_name || 'Tutor Applicant'}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">{t.user?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">{t.degree || t.qualifications}</span>
                      <span className="text-[11px] text-slate-500 block">{t.institution}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {t.experience_years} Years
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(t.hourly_rate)}/hr
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.verification_status === 'verified' ? 'verified' : t.verification_status === 'rejected' ? 'danger' : 'warning'}>
                        {t.verification_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {t.verification_status !== 'verified' ? (
                          <button
                            onClick={() => handleApproveTutor(t.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRejectTutor(t.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Registrations Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                All User Accounts in Database
              </h3>
              <p className="text-xs text-slate-500">
                Every person who creates an account on Tutor Plug appears here immediately.
              </p>
            </div>
            <Link href="/admin/students" className="text-xs font-bold text-indigo-600 hover:underline">
              View Students
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">User ID</th>
                  <th className="px-6 py-3.5">Full Name</th>
                  <th className="px-6 py-3.5">Registered Phone</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Registration Time</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                      {u.id}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {u.full_name}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {u.phone}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'tutor' ? 'bg-blue-100 text-blue-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="verified">{u.status.toUpperCase()}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
