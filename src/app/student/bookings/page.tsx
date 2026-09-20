'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useAuth } from '@/lib/auth-context';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Calendar, Clock, Video, MessageSquare, Search, ChevronRight } from 'lucide-react';

export default function StudentBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await bookingService.getStudentBookings(user?.id || 'usr-stud-demo');
      setBookings(data);
      setIsLoading(false);
    }
    load();
  }, [user]);

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Class Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your upcoming 1-on-1 sessions, reschedules, and class history.
            </p>
          </div>

          <Link href="/tutors">
            <Button variant="gradient" size="sm" leftIcon={<Search className="h-4 w-4" />}>
              Book Another Class
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2">
          <Tabs
            variant="pills"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'all', label: 'All Bookings', count: bookings.length },
              { id: 'upcoming', label: 'Upcoming', count: bookings.filter((b) => b.status === 'confirmed').length },
              { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
              { id: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
            ]}
          />
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.tutor?.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt="Tutor"
                  className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">
                      {b.subject?.name} with {b.tutor?.user?.full_name}
                    </span>
                    <Badge variant={b.status === 'confirmed' ? 'verified' : b.status === 'completed' ? 'default' : 'warning'}>
                      {b.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Booking ID: <span className="font-mono text-slate-700">{b.id}</span> • Fee: <span className="font-bold text-slate-800">{formatCurrency(b.subtotal)}</span>
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                    <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(b.scheduled_start)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {b.duration_minutes} Mins Duration
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {b.status === 'confirmed' ? (
                  <>
                    <Link href={`/classroom/room-${b.meeting_id || b.id || 'live'}`} className="w-1/2 md:w-auto">
                      <Button variant="gradient" size="sm" className="w-full" leftIcon={<Video className="h-3.5 w-3.5" />}>
                        Join Classroom
                      </Button>
                    </Link>
                    <Link href="/student/messages" className="w-1/2 md:w-auto">
                      <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>
                        Chat
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href={`/tutors/${b.tutor_id}`}>
                    <Button variant="outline" size="sm">
                      Rebook Tutor
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No bookings found under &quot;{activeTab}&quot;.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
