'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  Calendar,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function BecomeATutorPage() {
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [hourlyRate, setHourlyRate] = useState(1000);

  // 4 weeks per month, 75% tutor earnings
  const grossMonthly = hoursPerWeek * hourlyRate * 4;
  const netEarnings = Math.round(grossMonthly * 0.75);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white py-16 sm:py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-900/50 px-3.5 py-1 rounded-full border border-indigo-700/50">
            For Teachers, Professors & Academic Mentors
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Turn your academic passion into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              a thriving online teaching career
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join Tutor Plug to connect with motivated students, set your own hourly pricing, and teach using our integrated virtual classroom ecosystem.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding/tutor" className="w-full sm:w-auto">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start Teaching Application
              </Button>
            </Link>
            <Link href="#earnings" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800">
                Calculate Earnings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Earnings Calculator */}
      <section id="earnings" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Transparent Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Estimate Your Monthly Teaching Income
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Based on your custom hourly fee and weekly availability.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {/* Hours slider */}
              <div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-2">
                  <span>Hours per week:</span>
                  <span className="text-indigo-600 text-base">{hoursPerWeek} hrs</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={1}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>5 hrs (Part-time)</span>
                  <span>40 hrs (Full-time)</span>
                </div>
              </div>

              {/* Rate slider */}
              <div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-2">
                  <span>Your hourly rate:</span>
                  <span className="text-indigo-600 text-base">{formatCurrency(hourlyRate)}/hr</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={2500}
                  step={50}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹50/hr</span>
                  <span>₹2,500/hr</span>
                </div>
              </div>
            </div>

            {/* Income Display Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                Estimated Net Take-Home
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {formatCurrency(netEarnings)}
                <span className="text-xs font-normal text-slate-400 block mt-1">per month</span>
              </div>
              <p className="text-[11px] text-slate-300 pt-2 border-t border-slate-700/60 leading-relaxed">
                Tutor Plug charges an industry-low 25% platform & live classroom infrastructure fee. You keep 75% paid directly to your bank account weekly.
              </p>
              <div className="pt-2">
                <Link href="/onboarding/tutor">
                  <Button variant="gradient" size="sm" className="w-full">
                    Claim Your Educator Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why Educators Choose Tutor Plug
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Focus purely on teaching while we handle matching, scheduling, payment collection, and class delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Guaranteed Weekly Payments',
              desc: 'No more following up with parents for monthly tuition fees. All classes are pre-paid securely and disbursed automatically every Monday.',
              icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
            },
            {
              title: 'Full Schedule Autonomy',
              desc: 'You dictate your working hours. Block off vacation days or adjust evening slots in 1 click.',
              icon: <Calendar className="h-6 w-6 text-indigo-600" />,
            },
            {
              title: 'Built-in Virtual Classroom',
              desc: 'No need to juggle separate Zoom or Google Meet links. Students connect directly through your tutor dashboard.',
              icon: <Award className="h-6 w-6 text-blue-600" />,
            },
          ].map((b, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 w-fit border border-slate-100">{b.icon}</div>
              <h3 className="text-base font-bold text-slate-900">{b.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
