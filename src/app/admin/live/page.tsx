'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ClassModel } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Radio,
  Video,
  Clock,
  Users,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/classes?status=live');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes || []);
      }
    } catch (e) {
      console.error('Failed to load live classes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Live Classrooms Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Live Classes Monitor 📡
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authorized admin overview of currently active sessions across Tutor Plug.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>
        </div>

        {/* Live Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                {/* Live Badge & Room Code */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                    <span>LIVE NOW</span>
                  </span>
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {cls.meeting_code}
                  </span>
                </div>

                {/* Class Title & Subject */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cls.title}
                  </h3>
                  <span className="text-xs font-semibold text-indigo-600 mt-0.5 block">
                    {cls.subject}
                  </span>
                </div>

                {/* Teacher & Student Info */}
                <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Teacher:</span>
                    <span className="font-bold text-slate-900">{cls.teacher?.full_name || 'Assigned Tutor'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Student(s):</span>
                    <span className="font-semibold text-slate-800">
                      {cls.students && cls.students.length > 0
                        ? cls.students.map((s) => s.full_name).join(', ')
                        : 'Enrolled Students'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Started:</span>
                    <span className="font-mono">{formatDate(cls.scheduled_start)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recording:</span>
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                      ● REC (Mandatory)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link href={`/admin/classes/${cls.id}`} className="w-1/2">
                  <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                    View Session
                  </Button>
                </Link>
                <Link href={`/classroom/${cls.meeting_code}`} target="_blank" className="w-1/2">
                  <Button variant="gradient" size="sm" className="w-full text-xs" leftIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                    Enter Room
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {classes.length === 0 && !isLoading && (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-3">
              <Radio className="h-10 w-10 text-slate-300 mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">No Classes Live At This Moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When a student or teacher opens an active classroom session, it will automatically appear on this live monitoring board.
              </p>
              <Link href="/admin/classes">
                <Button variant="outline" size="sm">
                  View Scheduled Classes
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
