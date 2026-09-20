'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { bookingService } from '@/services/bookingService';
import { tutorService } from '@/services/tutorService';
import { Booking, TutorProfile } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import {
  Video,
  Calendar,
  Search,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Film,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, studentProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedTutors, setRecommendedTutors] = useState<TutorProfile[]>([]);
  const [meetingCode, setMeetingCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      const studentId = user?.id || 'usr-stud-demo';
      const [bks, tuts] = await Promise.all([
        bookingService.getStudentBookings(studentId),
        tutorService.getTutors(),
      ]);
      setBookings(bks);
      setRecommendedTutors(tuts.tutors.slice(0, 3));
      setIsLoading(false);
    }
    loadDashboard();
  }, [user]);

  const upcomingClass = bookings.find((b) => b.status === 'confirmed');

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = meetingCode.trim();
    if (!cleanCode) return;
    if (cleanCode.startsWith('http://') || cleanCode.startsWith('https://')) {
      window.location.href = cleanCode;
      return;
    }
    if (cleanCode.startsWith('TP-') || cleanCode.length <= 10) {
      router.push(`/meet/${cleanCode}`);
    } else {
      router.push(`/classroom/${cleanCode}`);
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        {/* Welcome Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              {studentProfile?.class_level || 'Senior Secondary'} • {studentProfile?.board || 'CBSE'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              You have {bookings.filter((b) => b.status === 'confirmed').length} upcoming sessions scheduled this week.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/student/recordings">
              <Button variant="secondary" size="md" leftIcon={<Film className="h-4 w-4" />}>
                Recordings
              </Button>
            </Link>
            <Link href="/tutors">
              <Button variant="gradient" size="md" leftIcon={<Search className="h-4 w-4" />}>
                Find a Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Join With Meeting Code Card */}
        <div className="rounded-3xl border-2 border-indigo-500/20 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
                Have a Class Code?
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">
              Join Live Video Classroom Instantly
            </h3>
            <p className="text-xs text-slate-500">
              Paste your tutor&apos;s meeting code (e.g. <code className="font-mono text-indigo-600 font-bold">TP-99281</code>) or link to enter.
            </p>
          </div>

          <form onSubmit={handleJoinByCode} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. TP-99281 or room code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 w-full sm:w-56"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!meetingCode.trim()}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Join
            </Button>
          </form>
        </div>

        {/* Next Upcoming Live Class Hero */}
        {upcomingClass ? (
          <div className="rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-white to-white p-6 sm:p-8 shadow-md">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Next Upcoming Live Session
                </span>
              </div>
              <Badge variant="verified">Classroom Ready</Badge>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={upcomingClass.tutor?.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                  alt={upcomingClass.tutor?.user?.full_name || 'Tutor'}
                  className="h-16 w-16 rounded-2xl object-cover border border-indigo-200"
                />
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {upcomingClass.subject?.name} with {upcomingClass.tutor?.user?.full_name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {upcomingClass.notes || '1-on-1 Concept Review and Problem Solving'}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-700 flex-wrap">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(upcomingClass.scheduled_start)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      {upcomingClass.duration_minutes} Mins Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link href="/student/messages" className="w-1/2 md:w-auto">
                  <Button variant="outline" size="md" className="w-full" leftIcon={<MessageSquare className="h-4 w-4" />}>
                    Message Tutor
                  </Button>
                </Link>
                <Link href={`/classroom/room-${upcomingClass.meeting_id || upcomingClass.id || 'live'}`} className="w-1/2 md:w-auto">
                  <Button variant="gradient" size="md" className="w-full" leftIcon={<Video className="h-4 w-4" />}>
                    Enter Classroom
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3">
            <Calendar className="h-8 w-8 text-indigo-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Upcoming Classes Today</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to learn something new? Browse our verified tutors and schedule a session.
            </p>
            <Link href="/tutors">
              <Button variant="gradient" size="sm">
                Browse Tutors
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Classes</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Mentors</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">2</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours Learned</span>
            <p className="text-2xl font-black text-blue-600 mt-1">6.5 hrs</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satisfaction</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
          </div>
        </div>

        {/* Recent Bookings Roster */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Bookings</h3>
            <Link href="/student/bookings" className="text-xs font-bold text-indigo-600 hover:underline">
              View All ({bookings.length})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {bookings.slice(0, 3).map((bk) => (
              <div key={bk.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bk.tutor?.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt="Tutor"
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {bk.subject?.name} • {bk.tutor?.user?.full_name}
                    </span>
                    <span className="text-slate-400 mt-0.5 block">
                      {formatDate(bk.scheduled_start)} • {bk.duration_minutes} mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={bk.status === 'confirmed' ? 'verified' : bk.status === 'completed' ? 'default' : 'warning'}>
                    {bk.status.toUpperCase()}
                  </Badge>
                  <span className="font-bold text-slate-900 text-sm hidden sm:inline">
                    {formatCurrency(bk.subtotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Educators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Recommended Tutors for Your Curriculum
            </h3>
            <Link href="/tutors" className="text-xs font-bold text-indigo-600 hover:underline">
              Explore Directory
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedTutors.map((tutor) => (
              <div key={tutor.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tutor.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="Tutor"
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {tutor.user?.full_name}
                    </span>
                    <span className="text-[11px] text-slate-400 block line-clamp-1">
                      {tutor.headline}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900">{formatCurrency(tutor.hourly_rate)}/hr</span>
                  <Link href={`/tutors/${tutor.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
