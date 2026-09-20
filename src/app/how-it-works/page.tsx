import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Search, Calendar, Video, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, Star, CreditCard } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-indigo-50/60 to-white py-14 sm:py-20 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Transparent & Simple
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            How Tutor Plug Works
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Everything you need to know about discovering expert educators, scheduling classes, and mastering your syllabus online.
          </p>
        </div>
      </section>

      {/* Dual Journey: For Students & For Tutors */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Student Flow */}
        <div className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold uppercase text-indigo-600 tracking-wider">Student Journey</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">For Students & Parents</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Search & Compare',
                desc: 'Filter by your exact grade (Class 6-12), board (CBSE/ICSE/IB), and subject. Inspect verified degrees and student ratings.',
              },
              {
                step: '2',
                title: 'Check Live Slots',
                desc: "Pick an available time directly from the tutor's weekly calendar that fits your schedule.",
              },
              {
                step: '3',
                title: 'Book with Zero Risk',
                desc: 'Schedule individual sessions or regular weekly mentorship with transparent hourly pricing.',
              },
              {
                step: '4',
                title: '1-on-1 Interactive Class',
                desc: 'Connect in real-time with your tutor via crystal-clear video, whiteboard, and digital notes.',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-sm">
                  {s.step}
                </span>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tutor Flow */}
        <div className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">Teacher Journey</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">For Educators & Subject Experts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Build Teaching Profile',
                desc: 'Upload your degree, teaching experience, preferred boards, and set your own hourly tuition rate.',
              },
              {
                step: '2',
                title: 'Fast Verification',
                desc: 'Our academic panel verifies your credentials to grant the official "Verified Mentor" badge.',
              },
              {
                step: '3',
                title: 'Set Your Availability',
                desc: 'Define exactly which days and hours you want to teach. Update anytime with 1 click.',
              },
              {
                step: '4',
                title: 'Weekly Direct Payouts',
                desc: 'Teach students, track earnings in your Tutor Dashboard, and receive automated payouts.',
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                  {s.step}
                </span>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
          <div>
            <h3 className="text-2xl font-black tracking-tight">Ready to start learning?</h3>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
              Find the perfect verified tutor today with our zero-risk trial guarantee.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/tutors">
              <Button variant="secondary" size="lg" className="text-indigo-700 bg-white hover:bg-indigo-50">
                Find a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
