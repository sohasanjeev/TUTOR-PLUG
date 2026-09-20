'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Profile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Users, GraduationCap, Calendar, RefreshCw } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        const studentOnly = data.users.filter((u: Profile) => u.role === 'student');
        setStudents(studentOnly);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Registered Students Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live database records of students registered on Tutor Plug.
            </p>
          </div>

          <button
            onClick={load}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Total Real Registered Students ({students.length})
            </h3>
            <span className="text-xs text-indigo-600 font-semibold">Live Database Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Mobile Phone</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Registered At</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {s.full_name}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {s.phone}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {s.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="verified">{s.status.toUpperCase()}</Badge>
                    </td>
                  </tr>
                ))}

                {students.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No students registered yet. New signups on `/register` will show up here instantly!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
