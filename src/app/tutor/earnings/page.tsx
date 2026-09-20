'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  CreditCard,
  Clock,
} from 'lucide-react';

export default function TutorEarningsPage() {
  const { user, tutorProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const bks = await bookingService.getTutorBookings(user?.id || 'usr-tut-1');
      setBookings(bks);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const grossTuition = bookings.reduce((sum, b) => sum + b.subtotal, 0);
  const platformFeeTotal = bookings.reduce((sum, b) => sum + b.platform_commission, 0);
  const netEarningsTotal = bookings.reduce((sum, b) => sum + b.tutor_earning, 0);

  return (
    <DashboardLayout role="tutor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Earnings & Payouts Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your gross bookings, transparent platform fee deductions, and weekly bank settlements.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-sm space-y-1">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Net Take-Home Earnings (75%)
            </span>
            <p className="text-3xl font-black">{formatCurrency(netEarningsTotal)}</p>
            <span className="text-[11px] text-slate-300 block pt-1">
              Disbursed automatically every Monday
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Gross Tuition Volume
            </span>
            <p className="text-3xl font-black text-slate-900">{formatCurrency(grossTuition)}</p>
            <span className="text-[11px] text-slate-400 block pt-1">
              From {bookings.length} completed & confirmed classes
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Platform & Tech Commission (25%)
            </span>
            <p className="text-3xl font-black text-slate-700">{formatCurrency(platformFeeTotal)}</p>
            <span className="text-[11px] text-slate-400 block pt-1">
              Covers student matching, classroom video, and billing
            </span>
          </div>
        </div>

        {/* Bank Account Verification & Settlement Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Connected Payout Account</h3>
                <Badge variant="verified">Active & Verified</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                HDFC Bank Ltd • Account ending in •••• 8842 (IFSC: HDFC0001092)
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm">
            Update Bank Details
          </Button>
        </div>

        {/* Breakdown of Classes & Net Payout Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Per-Class Earnings Breakdown</h3>
              <p className="text-xs text-slate-400">Class tuition minus transparent 25% platform fee</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">Live Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Class / Subject</th>
                  <th className="px-5 py-3.5">Scheduled Date</th>
                  <th className="px-5 py-3.5">Class Rate</th>
                  <th className="px-5 py-3.5">Platform Fee (25%)</th>
                  <th className="px-5 py-3.5 font-bold text-slate-900">Your Take-Home (75%)</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {b.subject?.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(b.scheduled_start)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {formatCurrency(b.subtotal)}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      - {formatCurrency(b.platform_commission)}
                    </td>
                    <td className="px-5 py-4 font-black text-emerald-600 text-sm">
                      + {formatCurrency(b.tutor_earning)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={b.status === 'confirmed' ? 'verified' : 'default'}>
                        {b.status === 'confirmed' ? 'SETTLED' : 'COMPLETED'}
                      </Badge>
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
