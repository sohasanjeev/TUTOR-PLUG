'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Clock, Calendar, Check, Save } from 'lucide-react';

export default function TutorAvailabilityPage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const slots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
  ];

  // Map of "Day-Slot" -> boolean
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>({
    'Monday-16:00 - 17:00': true,
    'Monday-17:00 - 18:00': true,
    'Monday-18:00 - 19:00': true,
    'Tuesday-16:00 - 17:00': true,
    'Tuesday-17:00 - 18:00': true,
    'Wednesday-16:00 - 17:00': true,
    'Wednesday-17:00 - 18:00': true,
    'Thursday-16:00 - 17:00': true,
    'Friday-16:00 - 17:00': true,
    'Friday-17:00 - 18:00': true,
    'Saturday-10:00 - 11:00': true,
    'Saturday-11:00 - 12:00': true,
    'Saturday-14:00 - 15:00': true,
    'Saturday-16:00 - 17:00': true,
    'Sunday-10:00 - 11:00': true,
    'Sunday-11:00 - 12:00': true,
  });

  const [isSaved, setIsSaved] = useState(false);

  const toggleSlot = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setActiveSlots((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout role="tutor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Weekly Availability Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click on slots to toggle when you are available for 1-on-1 tutoring sessions.
            </p>
          </div>

          <Button
            variant="gradient"
            size="md"
            onClick={handleSave}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Schedule
          </Button>
        </div>

        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Availability schedule updated and published to search directory!</span>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs overflow-x-auto">
          <div className="min-w-[700px] space-y-4">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-b-0">
                <div className="w-28 font-bold text-xs text-slate-800 shrink-0">
                  {day}
                </div>

                <div className="flex-1 flex flex-wrap gap-1.5">
                  {slots.map((slot) => {
                    const key = `${day}-${slot}`;
                    const isAvailable = !!activeSlots[key];
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(day, slot)}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer select-none ${
                          isAvailable
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm bg-indigo-600" />
            <span>Available for Student Booking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-sm bg-slate-100 border border-slate-300" />
            <span>Unavailable / Blocked</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
