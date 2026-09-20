'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Download, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await paymentService.getStudentPayments(user?.id || 'usr-stud-demo');
      setPayments(data);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const totalSpent = payments.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.amount : 0), 0);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Payments & Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View your transaction receipts, tuition fees, and payment methods.
            </p>
          </div>
        </div>

        {/* Spend Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Tuition Invested
            </span>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(totalSpent)}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Successful Transactions
            </span>
            <p className="text-2xl font-black text-emerald-600">{payments.length}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Payment Security
            </span>
            <p className="text-sm font-bold text-indigo-600 flex items-center gap-1 mt-2">
              <ShieldCheck className="h-4 w-4" /> 256-Bit Encrypted
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <span className="text-xs text-slate-400 font-medium">Auto-generated tax invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Transaction Ref</th>
                  <th className="px-5 py-3.5">Tutor</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Tuition Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {p.transaction_id || p.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {p.tutor?.full_name || 'Tutor'}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(p.paid_at || p.created_at)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {p.payment_provider}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="verified">PAID</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => alert(`Downloading official PDF Invoice for ${p.transaction_id}`)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                        title="Download Invoice"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
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
