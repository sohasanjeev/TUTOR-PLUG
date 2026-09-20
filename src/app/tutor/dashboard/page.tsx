'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Film,
} from 'lucide-react';

export default function TutorDashboardPage() {
  const { user, tutorProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const tutorUserId = user?.id || 'usr-tut-1';
      const bks = await bookingService.getTutorBookings(tutorUserId);
      setBookings(bks);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const upcomingClasses = bookings.filter((b) => b.status === 'confirmed');
  const totalEarnings = bookings.reduce((sum, b) => sum + b.tutor_earning, 0);

  return (
    <DashboardLayout role="tutor">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="verified">
                {tutorProfile?.verification_status === 'verified' ? 'Verified Mentor' : 'Application In Review'}
              </Badge>
              <span className="text-xs text-blue-200">
                Hourly Rate: {formatCurrency(tutorProfile?.hourly_rate || 1200)}/hr
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tutor Studio: Welcome, {user?.full_name?.split(' ')[0] || 'Teacher'}! 🎓
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              You have {upcomingClasses.length} sessions booked by students this week.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/tutor/recordings">
              <Button variant="secondary" size="md" leftIcon={<Film className="h-4 w-4" />}>
                Recordings
              </Button>
            </Link>
            <Link href="/tutor/classes">
              <Button variant="gradient" size="md" leftIcon={<Video className="h-4 w-4" />}>
                Classes & Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Studio Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Earnings
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalEarnings)}</p>
            <span className="text-[10px] text-slate-400 font-medium">75% Net Tutor Payout</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Students
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">14</p>
            <span className="text-[10px] text-indigo-600 font-medium">+3 this month</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Classes Taught
            </span>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {tutorProfile?.total_classes_taught || 940}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">99.4% Attendance</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Profile Score
            </span>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {tutorProfile?.profile_completion_percentage || 100}%
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Verified Active</span>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Live Teaching Sessions</h3>
              <p className="text-xs text-slate-500">Students have booked these slots directly from your schedule.</p>
            </div>
            <Link href="/tutor/classes">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingClasses.map((bk) => (
              <div key={bk.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {bk.subject?.name} with Student Rohan Mehta
                    </span>
                    <span className="text-slate-500 mt-0.5 block">
                      {bk.notes || 'Curriculum revision & doubt clearance'}
                    </span>
                    <span className="text-indigo-600 font-medium mt-1 block">
                      {formatDate(bk.scheduled_start)} • {bk.duration_minutes} Mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400 block">Your Earning</span>
                    <span className="font-black text-slate-900 text-sm">
                      {formatCurrency(bk.tutor_earning)}
                    </span>
                  </div>
                  <Link href={`/classroom/room-${bk.meeting_id || bk.id || 'live'}`}>
                    <Button variant="gradient" size="sm" leftIcon={<Video className="h-4 w-4" />}>
                      Open Classroom
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {upcomingClasses.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No active classes scheduled for today. Make sure your availability slots are open!
              </div>
            )}
          </div>
        </div>

        {/* Quick Availability Banner */}
        <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-2xl border border-indigo-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Weekly Availability Planner</span>
            </h4>
            <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
              Keep your available teaching slots up to date so parents and students can book classes without delays.
            </p>
          </div>

          <Link href="/tutor/availability">
            <Button variant="outline" size="sm">
              Edit Weekly Schedule
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
