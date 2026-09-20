'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Users, MessageSquare, Video, Calendar, Mail, Phone } from 'lucide-react';

export default function TutorStudentsPage() {
  const students = [
    {
      id: 'stud-1',
      name: 'Rohan Mehta',
      class: 'Class 12 (Senior Secondary)',
      board: 'CBSE',
      subject: 'Mathematics (Calculus & JEE Prep)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
      totalClasses: 8,
      lastClass: 'Yesterday',
      goals: 'Aiming for 99+ in JEE Mathematics',
    },
    {
      id: 'stud-2',
      name: 'Aanya Verma',
      class: 'Class 11 (Senior Secondary)',
      board: 'ICSE / ISC',
      subject: 'Physics (Mechanics)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      totalClasses: 5,
      lastClass: '3 days ago',
      goals: 'Building strong conceptual clarity in Newtonian Mechanics',
    },
  ];

  return (
    <DashboardLayout role="tutor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Students
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Students currently learning with you through Tutor Plug.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{s.class} • {s.board}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{s.subject}</p>
                  </div>
                </div>

                <Badge variant="verified">{s.totalClasses} Sessions</Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-700 block">Learning Goals:</span>
                <p className="text-slate-500 text-[11px]">{s.goals}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Link href="/tutor/messages" className="w-1/2">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<MessageSquare className="h-3.5 w-3.5" />}>
                    Message
                  </Button>
                </Link>
                <Link href="/tutor/classes" className="w-1/2">
                  <Button variant="gradient" size="sm" className="w-full" leftIcon={<Video className="h-3.5 w-3.5" />}>
                    Schedule Class
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
