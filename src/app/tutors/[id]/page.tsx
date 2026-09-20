'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { BookingModal } from '@/components/tutors/BookingModal';
import { tutorService } from '@/services/tutorService';
import { TutorProfile } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  GraduationCap,
  Clock,
  Globe,
  Calendar,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function TutorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params?.id as string;

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function loadTutor() {
      setIsLoading(true);
      const data = await tutorService.getTutorById(tutorId);
      setTutor(data);
      setIsLoading(false);
    }
    if (tutorId) {
      loadTutor();
    }
  }, [tutorId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PublicNavbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-slate-500 font-medium">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PublicNavbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tutor Not Found</h2>
          <p className="text-sm text-slate-500">
            We couldn&apos;t find the tutor profile you requested.
          </p>
          <Link href="/tutors">
            <Button variant="gradient">Back to Tutors</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = tutor.user;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <Link
            href="/tutors"
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Tutor Directory</span>
          </Link>
          <div className="text-slate-400 hidden sm:block">
            <span>Home</span> / <span>Tutors</span> / <span className="text-slate-800 font-semibold">{user?.full_name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Profile Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Hero Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={user?.full_name || 'Tutor'}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  {tutor.verification_status === 'verified' && (
                    <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {user?.full_name}
                    </h1>
                    {tutor.verification_status === 'verified' && (
                      <Badge variant="verified" size="md">
                        Verified Educator
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-indigo-600">
                    {tutor.degree} • {tutor.institution}
                  </p>

                  <div className="flex items-center gap-4 pt-1 text-xs text-slate-600 flex-wrap">
                    <StarRating rating={tutor.average_rating} totalReviews={tutor.total_reviews} size="md" />
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {tutor.experience_years} Years Teaching
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">
                      {tutor.total_classes_taught}+ Classes Taught
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 mb-1">About the Mentor</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {tutor.bio}
                </p>
              </div>
            </div>

            {/* Teaching Methodology & Approach */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span>Teaching Methodology & Pedagogy</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {tutor.teaching_methodology}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block">Doubt Solving</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Dedicated live concept drills</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block">Curated Materials</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">NCERT & past papers</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block">Progress Reports</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Performance analysis for parents</span>
                </div>
              </div>
            </div>

            {/* Subjects, Boards & Classes */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900">Expertise & Curriculum</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    Subjects Taught
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects?.map((s) => (
                      <span key={s.id} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    Boards Covered
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.boards?.map((b) => (
                      <span key={b.id} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {b.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.languages?.map((l) => (
                      <span key={l} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Availability Schedule */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Weekly Class Availability</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                {tutor.availability?.map((av) => (
                  <div key={av.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="font-bold text-slate-800 block text-xs">
                      {daysOfWeek[av.day_of_week]}
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
                      {av.start_time} - {av.end_time}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">IST</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Reviews */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Student & Parent Reviews ({tutor.total_reviews})
                </h2>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={tutor.average_rating} size="sm" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: 'Kunal Sharma (Class 12, CBSE)',
                    rating: 5,
                    date: '2 weeks ago',
                    comment:
                      'Sir transformed my confidence in Calculus. His breakdown of graphical integration and limits made problems that used to take 10 minutes doable in 2 minutes!',
                  },
                  {
                    name: 'Dr. Sunita Patel (Parent)',
                    rating: 5,
                    date: '1 month ago',
                    comment:
                      'Very punctual, professional, and patient. Provides regular feedback on test performance. Highly recommended!',
                  },
                ].map((rev, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rev.name}</span>
                      <span className="text-slate-400 text-[11px]">{rev.date}</span>
                    </div>
                    <StarRating rating={rev.rating} size="sm" showNumber={false} />
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sticky Booking Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Hourly Rate
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {formatCurrency(tutor.hourly_rate)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ 60 min</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => setIsBookingOpen(true)}
                >
                  Book a 1-on-1 Class
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  leftIcon={<MessageSquare className="h-4 w-4 text-indigo-600" />}
                  onClick={() => router.push('/student/messages')}
                >
                  Message Tutor
                </Button>
              </div>

              {/* Guarantees */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Free cancellation up to 6 hrs prior</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Interactive Live Classroom included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Booking Modal */}
      <BookingModal
        tutor={tutor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
