'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, Video, Clock } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          setBookings([]);
        }
      } catch {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Global Bookings Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete log of all scheduled and completed tutoring sessions across Tutor Plug.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Total Recorded Sessions ({bookings.length})</h3>
            <span className="text-xs text-slate-400">Database Table: `bookings`</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-6 py-3.5">Subject & Tutor</th>
                  <th className="px-6 py-3.5">Scheduled Time</th>
                  <th className="px-6 py-3.5">Subtotal</th>
                  <th className="px-6 py-3.5">Platform Fee (25%)</th>
                  <th className="px-6 py-3.5 font-bold text-emerald-700">Tutor Take-Home</th>
                  <th className="px-6 py-3.5">Meeting ID</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                      No tutoring session bookings recorded in the system yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {b.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{b.subject?.name}</span>
                      <span className="text-[11px] text-slate-500 block">Tutor: {b.tutor?.user?.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(b.scheduled_start)} • {b.duration_minutes}m
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(b.subtotal)}
                    </td>
                    <td className="px-6 py-4 text-indigo-600 font-semibold">
                      {formatCurrency(b.platform_commission)}
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-600">
                      {formatCurrency(b.tutor_earning)}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                      {b.meeting_id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={b.status === 'confirmed' ? 'verified' : 'default'}>
                        {b.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
