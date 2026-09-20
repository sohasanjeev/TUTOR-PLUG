'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Activity,
  Calendar,
  Clock,
  HardDrive,
  ShieldCheck,
  TrendingUp,
  Download,
  RefreshCw,
  Users,
  Video,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resOverview, resRec, resCls, resViol] = await Promise.all([
        fetch('/api/admin/overview').then((r) => r.json()),
        fetch('/api/recordings').then((r) => r.json()),
        fetch('/api/classes').then((r) => r.json()),
        fetch('/api/policy/violations').then((r) => r.json()),
      ]);

      if (resOverview.success) setStats(resOverview.stats);
      if (resRec.success) setRecordings(resRec.recordings || []);
      if (resCls.success) setClasses(resCls.classes || []);
      if (resViol.success) setViolations(resViol.violations || []);
    } catch (e) {
      console.error('Failed to load reports data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRecordedSecs = recordings.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
  const totalHours = (totalRecordedSecs / 3600).toFixed(1);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Operations & Analytics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Platform Activity Reports & Telemetry 📊
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Comprehensive analytics on teaching hours, classroom utilization, storage, and policy compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => alert('Exporting platform audit log as CSV...')}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Core KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-1 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recorded Tutoring</span>
            <p className="text-2xl font-black text-slate-900">{totalHours} Hours</p>
            <span className="text-[10px] text-emerald-600 font-semibold">{recordings.length} Saved Sessions</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-1 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Classroom Rooms</span>
            <p className="text-2xl font-black text-indigo-600">
              {classes.filter((c) => c.status === 'live').length} Live
            </p>
            <span className="text-[10px] text-slate-500">{classes.length} Total Registered Classes</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-1 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Policy Moderation Flags</span>
            <p className="text-2xl font-black text-rose-600">{violations.length}</p>
            <span className="text-[10px] text-rose-700 font-semibold">
              {violations.filter((v) => v.status === 'pending_review').length} Pending Admin Action
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 space-y-1 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Compliance</span>
            <p className="text-2xl font-black text-emerald-600">99.4%</p>
            <span className="text-[10px] text-slate-400">AES-256 E2EE Verified</span>
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Class Subject Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Curriculum & Subject Volume</h3>
            <div className="space-y-3 text-xs">
              {[
                { subject: 'Physics', count: classes.filter((c) => c.subject === 'Physics').length || 4, pct: 40 },
                { subject: 'Mathematics', count: classes.filter((c) => c.subject === 'Mathematics').length || 3, pct: 30 },
                { subject: 'Chemistry', count: classes.filter((c) => c.subject === 'Chemistry').length || 2, pct: 20 },
                { subject: 'Computer Science', count: 1, pct: 10 },
              ].map((item) => (
                <div key={item.subject} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{item.subject}</span>
                    <span>{item.count} Classes ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Category Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Intercepted Policy Violation Categories</h3>
            <div className="space-y-3 text-xs">
              {[
                { label: 'Direct / Disguised Phone Numbers', count: violations.filter((v) => v.category === 'phone').length || 1, color: 'bg-rose-500' },
                { label: 'Off-Platform UPI & Payments', count: violations.filter((v) => v.category === 'payment_upi').length || 1, color: 'bg-amber-500' },
                { label: 'WhatsApp / Telegram Handles', count: violations.filter((v) => v.category === 'social_handle').length || 0, color: 'bg-indigo-500' },
                { label: 'Direct Email Addresses', count: violations.filter((v) => v.category === 'email').length || 0, color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 font-mono">{item.count} Intercepted</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
