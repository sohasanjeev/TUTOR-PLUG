'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PolicyViolation, AdminAction } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserX,
  MessageSquareOff,
  BellRing,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function AdminPolicyViolationsPage() {
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_review' | 'action_taken' | 'dismissed'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadViolations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/policy/violations');
      const data = await res.json();
      if (data.success) {
        setViolations(data.violations || []);
      }
    } catch (err) {
      console.error('Failed to load violations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadViolations();
  }, []);

  const handleAction = async (id: string, action: AdminAction, status: 'action_taken' | 'dismissed') => {
    try {
      const res = await fetch('/api/policy/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, status }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Successfully applied action: ${action.replace('_', ' ').toUpperCase()}`);
        setTimeout(() => setActionSuccess(null), 3000);
        loadViolations();
      }
    } catch (err) {
      console.error('Failed to update violation:', err);
    }
  };

  const filtered = violations.filter((v) => {
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.user_name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.message_snippet.toLowerCase().includes(q) ||
      v.meeting_id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-rose-900/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                Automated Policy Moderation Layer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Policy Violations & Contact Sharing Audit 🛡️
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Intercepted phone numbers, WhatsApp, Telegram, Instagram handles, and off-platform payment attempts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadViolations}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 rounded-2xl bg-rose-900/60 border border-rose-500/40 text-xs font-bold text-rose-300">
              {violations.filter((v) => v.status === 'pending_review').length} Pending Action
            </div>
          </div>
        </div>

        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/90 text-xs">
            {(['all', 'pending_review', 'action_taken', 'dismissed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer capitalize ${
                  filterStatus === st ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'pending_review' ? 'Needs Review' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, snippet, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Violations Queue Cards */}
        <div className="space-y-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {v.user_name}{' '}
                      <span className="text-xs font-normal text-slate-400">({v.user_role})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Class Room: {v.meeting_id} • User ID: {v.user_id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                    Category: {v.category.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Confidence: {Math.round(v.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Detected Snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">Flagged Message Content:</span>
                <p className="font-mono text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 text-xs select-all">
                  &quot;{v.message_snippet}&quot;
                </p>
              </div>

              {/* Status & One-Click Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 text-xs">
                <div className="flex items-center gap-3 text-slate-500">
                  <span>Detected: {formatDate(v.created_at)}</span>
                  <span>•</span>
                  <span>
                    Status:{' '}
                    <strong className="capitalize text-slate-800">
                      {v.status.replace('_', ' ')}
                    </strong>
                  </span>
                  {v.admin_action !== 'none' && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-rose-600 uppercase">
                        Action: {v.admin_action}
                      </span>
                    </>
                  )}
                </div>

                {/* Admin Enforcement Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAction(v.id, 'warned', 'action_taken')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-amber-200 cursor-pointer"
                  >
                    <BellRing className="h-3.5 w-3.5" />
                    <span>Warn User</span>
                  </button>

                  <button
                    onClick={() => handleAction(v.id, 'messaging_restricted', 'action_taken')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200 cursor-pointer"
                  >
                    <MessageSquareOff className="h-3.5 w-3.5" />
                    <span>Restrict Chat</span>
                  </button>

                  <button
                    onClick={() => handleAction(v.id, 'suspended', 'action_taken')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Suspend Account</span>
                  </button>

                  <button
                    onClick={() => handleAction(v.id, 'none', 'dismissed')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Dismiss Flag
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Policy Violations Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All teacher and student communications comply with Tutor Plug guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
