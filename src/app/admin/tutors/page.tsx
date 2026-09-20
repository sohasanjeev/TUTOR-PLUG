'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { TutorProfile } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Check, X, Search, Clock, Award, RefreshCw } from 'lucide-react';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadTutors() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.tutors) {
        setTutors(data.tutors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTutors();
  }, []);

  const handleStatusChange = async (tutorId: string, status: 'verified' | 'rejected' | 'unverified') => {
    try {
      await fetch('/api/admin/tutors/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, status }),
      });
      loadTutors();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tutors.filter((t) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'verified'
        ? t.verification_status === 'verified'
        : activeTab === 'unverified'
        ? t.verification_status === 'unverified'
        : t.verification_status === 'rejected';

    const matchesSearch =
      !search ||
      t.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.qualifications?.toLowerCase().includes(search.toLowerCase()) ||
      t.degree?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Tutor Credential Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify degrees, adjust educator status, and manage academic credentials in the database.
            </p>
          </div>

          <button
            onClick={loadTutors}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Tutors</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs
              variant="pills"
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={[
                { id: 'all', label: 'All Applicants', count: tutors.length },
                { id: 'verified', label: 'Verified', count: tutors.filter((t) => t.verification_status === 'verified').length },
                { id: 'unverified', label: 'Pending Review', count: tutors.filter((t) => t.verification_status === 'unverified').length },
                { id: 'rejected', label: 'Rejected', count: tutors.filter((t) => t.verification_status === 'rejected').length },
              ]}
            />

            <input
              type="text"
              placeholder="Search tutor name or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Tutors Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Educator</th>
                  <th className="px-6 py-3.5">College & Degree</th>
                  <th className="px-6 py-3.5">Experience</th>
                  <th className="px-6 py-3.5">Hourly Fee</th>
                  <th className="px-6 py-3.5">Verification Status</th>
                  <th className="px-6 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((t) => (
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
                          {t.user?.full_name || 'Applicant'}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">{t.user?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 block">{t.degree || t.qualifications}</span>
                      <span className="text-[11px] text-slate-500 block">{t.institution}</span>
                    </td>
                    <td className="px-6 py-4">
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
                            onClick={() => handleStatusChange(t.id, 'verified')}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(t.id, 'unverified')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Set Pending
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(t.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
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
