'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { TutorCard } from '@/components/tutors/TutorCard';
import { BookingModal } from '@/components/tutors/BookingModal';
import { tutorService } from '@/services/tutorService';
import { TutorProfile, Subject, Board, ClassLevel } from '@/lib/types';
import {
  Search,
  CheckCircle2,
  Calendar,
  Video,
  ShieldCheck,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  GraduationCap,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);

  // Search Bar State
  const [searchSubject, setSearchSubject] = useState('');
  const [searchClass, setSearchClass] = useState('');
  const [searchBoard, setSearchBoard] = useState('');

  // Booking Modal
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState<TutorProfile | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [resTutors, resSubs, resLvls, resBoards] = await Promise.all([
        tutorService.getTutors(),
        tutorService.getSubjects(),
        tutorService.getClassLevels(),
        tutorService.getBoards(),
      ]);
      setTutors(resTutors.tutors.slice(0, 3)); // Featured 3
      setSubjects(resSubs);
      setClassLevels(resLvls);
      setBoards(resBoards);
    }
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchSubject) params.set('subject', searchSubject);
    if (searchClass) params.set('class_level', searchClass);
    if (searchBoard) params.set('board', searchBoard);
    router.push(`/tutors?${params.toString()}`);
  };

  const faqs = [
    {
      q: 'How does Tutor Plug verify educators?',
      a: 'Every educator on Tutor Plug undergoes a strict 3-tier verification: identity & phone verification, academic credentials & degree audit, and a live pedagogical demo class evaluation before receiving the Verified Mentor badge.',
    },
    {
      q: 'Can I choose my own schedule and timing?',
      a: 'Yes! Tutors publish their real-time weekly availability. You can book classes at any slot that works for you, whether weekday evenings or weekend mornings.',
    },
    {
      q: 'How do 1-on-1 classes take place?',
      a: 'Classes are conducted right through Tutor Plug. When class time arrives, simply enter your Student Dashboard and click "Launch Classroom" to connect with your tutor in high-definition video and interactive whiteboard.',
    },
    {
      q: 'What is the refund and cancellation policy?',
      a: 'Classes can be rescheduled or cancelled up to 6 hours before the scheduled start time with a 100% refund credited back to your account.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>India&apos;s Premium 1-on-1 Online Tutoring Platform</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Find the right tutor. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Learn better.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect 1-on-1 with verified mentors from IITs, AIIMS, and top global institutions. Personalized learning for CBSE, ICSE, IB, and competitive exams.
            </p>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tutors" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Find a Tutor
                </Button>
              </Link>
              <Link href="/become-a-tutor" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Become a Tutor
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% Verified Teachers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>4.95/5 Average Rating</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-indigo-500" />
                <span>Zero Risk Trial Guarantee</span>
              </div>
            </div>
          </div>

          {/* Interactive Search Bar Widget */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl shadow-indigo-100/50 border border-slate-200/90">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-end">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <select
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Class/Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class / Grade
                </label>
                <select
                  value={searchClass}
                  onChange={(e) => setSearchClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Grades</option>
                  {classLevels.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Board */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Board
                </label>
                <select
                  value={searchBoard}
                  onChange={(e) => setSearchBoard(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Boards</option>
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <div>
                <Button variant="gradient" size="md" className="w-full h-10.5" leftIcon={<Search className="h-4 w-4" />}>
                  Find Tutors
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* How Tutor Plug Works */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simple 4-Step Process
            </h2>
            <p className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
              How Tutor Plug Works
            </p>
            <p className="mt-3 text-sm text-slate-500">
              From choosing your mentor to mastering complex chapters in 1-on-1 virtual classrooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Find a Tutor',
                desc: 'Filter verified tutors by subject, board, grade, price range, and language.',
                icon: <Search className="h-6 w-6 text-indigo-600" />,
              },
              {
                step: '02',
                title: 'Choose a Slot',
                desc: "Check the tutor's real-time weekly schedule and pick an exact time that works for you.",
                icon: <Calendar className="h-6 w-6 text-blue-600" />,
              },
              {
                step: '03',
                title: 'Book a Class',
                desc: 'Confirm your booking with transparent pricing and zero hidden fees.',
                icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
              },
              {
                step: '04',
                title: 'Learn Online',
                desc: 'Enter your interactive 1-on-1 classroom directly from your Student Dashboard.',
                icon: <Video className="h-6 w-6 text-purple-600" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {item.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-200">{item.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Subjects Grid */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Explore Curriculum
              </h2>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Popular Subjects & Topics
              </p>
            </div>
            <Link href="/tutors" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
              <span>View all subjects</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/tutors?subject=${sub.id}`}
                className="group rounded-2xl border border-slate-200/80 p-5 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {sub.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vetted Tutors Showcase */}
      <section className="py-16 sm:py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Top Rated Educators
              </h2>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Learn from Verified Mentors
              </p>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Alumni from IIT Bombay, AIIMS, BITS Pilani, and certified Cambridge educators.
              </p>
            </div>
            <Link href="/tutors">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Browse Verified Tutors
              </Button>
            </Link>
          </div>

          {tutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  onBookNow={(t) => {
                    setSelectedTutorForBooking(t);
                    setIsBookingOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Are You a Qualified Educator?</h3>
              <p className="text-sm text-slate-500">
                We are currently onboarding top educators. Apply today to teach students 1-on-1 and earn on your schedule.
              </p>
              <Link href="/become-a-tutor">
                <Button variant="gradient" size="md">
                  Apply to Teach on Tutor Plug
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Become a Tutor Callout */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Join our educator network
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                Teach on your terms. <br />
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Earn up to ₹80,000+/month.
                </span>
              </h2>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-lg">
                Set your own hourly tuition rates, define your weekly schedule, and teach students across India and globally through Tutor Plug&apos;s seamless classroom ecosystem.
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Direct Weekly Payouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Integrated Virtual Classroom</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Zero Upfront Listing Cost</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Link href="/become-a-tutor">
                  <Button variant="gradient" size="lg">
                    Apply to Teach
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="border-slate-700 text-white hover:bg-slate-800">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
              <h3 className="text-base font-bold text-white">Why Tutors Choose Tutor Plug</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                  <p className="text-2xl font-black text-indigo-400">75%</p>
                  <p className="text-xs text-slate-400 mt-1">Guaranteed Tutor Payout</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                  <p className="text-2xl font-black text-blue-400">100%</p>
                  <p className="text-xs text-slate-400 mt-1">Scheduling Flexibility</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                  <p className="text-2xl font-black text-emerald-400">Zero</p>
                  <p className="text-xs text-slate-400 mt-1">Marketing Cost</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                  <p className="text-2xl font-black text-purple-400">24/7</p>
                  <p className="text-xs text-slate-400 mt-1">Dedicated Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Questions & Answers
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-900 hover:bg-slate-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-90 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Booking Modal */}
      <BookingModal
        tutor={selectedTutorForBooking}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedTutorForBooking(null);
        }}
      />
    </div>
  );
}
