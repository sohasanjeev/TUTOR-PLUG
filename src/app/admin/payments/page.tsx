'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await paymentService.getAllPayments();
      setPayments(data);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Financial Ledger & Payment Gateway Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconciliation of gateway charges, platform commission retention, and tutor payouts.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Gateway Transactions ({payments.length})</h3>
            <span className="text-xs text-slate-400">Database Table: `payments`</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Gateway Transaction ID</th>
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Total Collected</th>
                  <th className="px-6 py-3.5 text-indigo-700">Platform Fee (25%)</th>
                  <th className="px-6 py-3.5 text-emerald-700">Tutor Disbursed (75%)</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                      No payment gateway transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {p.transaction_id || p.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {p.booking_id}
                    </td>
                    <td className="px-6 py-4">
                      {p.payment_provider}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      {formatCurrency(p.platform_fee)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {formatCurrency(p.tutor_amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(p.paid_at || p.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="verified">{p.status.toUpperCase()}</Badge>
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
