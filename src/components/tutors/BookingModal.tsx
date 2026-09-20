'use client';

import React, { useState } from 'react';
import { TutorProfile } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, calculateCommission } from '@/lib/utils';
import { bookingService } from '@/services/bookingService';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export interface BookingModalProps {
  tutor: TutorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow');
  const [selectedTime, setSelectedTime] = useState<string>('17:00');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>('');

  if (!tutor) return null;

  const currentSubject = selectedSubject || (tutor.subjects?.[0]?.id ?? '');
  const rate = tutor.hourly_rate;
  const subtotal = Math.round((rate * duration) / 60);
  const { platformFee, tutorEarning, percentage } = calculateCommission(subtotal, 25);

  const availableDates = [
    { label: 'Today (Evening)', value: 'Today' },
    { label: 'Tomorrow', value: 'Tomorrow' },
    { label: 'In 2 Days', value: 'In 2 Days' },
    { label: 'This Saturday', value: 'Saturday' },
    { label: 'This Sunday', value: 'Sunday' },
  ];

  const availableSlots = ['10:00', '12:00', '16:00', '17:00', '18:30', '20:00'];

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=tutors');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      now.setDate(now.getDate() + (selectedDate === 'Tomorrow' ? 1 : 2));
      const scheduledStart = now.toISOString();
      const scheduledEnd = new Date(now.getTime() + duration * 60000).toISOString();

      const created = await bookingService.createBooking({
        studentId: user?.id || 'usr-stud-demo',
        tutor,
        subjectId: currentSubject,
        scheduledStart,
        scheduledEnd,
        durationMinutes: duration,
        notes,
      });

      // Also persist to server database
      try {
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user?.id || 'usr-stud-demo',
            tutorId: tutor.user_id,
            subjectId: currentSubject,
            scheduledStart,
            scheduledEnd,
            durationMinutes: duration,
            notes,
          }),
        });
      } catch (e) {
        console.error('Error posting to /api/bookings:', e);
      }

      setBookingRef(created.id);
      setIsBooked(true);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsBooked(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="lg">
      {!isBooked ? (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tutor.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={tutor.user?.full_name || 'Tutor'}
              className="h-12 w-12 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Book a 1-on-1 Class with {tutor.user?.full_name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {tutor.qualifications} • {formatCurrency(tutor.hourly_rate)}/hr
              </p>
            </div>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Subject
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tutor.subjects?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSubject(s.id)}
                  className={`p-2.5 rounded-lg text-xs font-semibold border text-left transition-all cursor-pointer ${
                    currentSubject === s.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Choose Day
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {availableDates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Available Start Slot
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {availableSlots.map((time) => (
                  <option key={time} value={time}>
                    {time} IST
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Class Duration
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[60, 90, 120].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`py-2 rounded-lg font-medium border text-center transition-colors cursor-pointer ${
                    duration === d
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Notes for Tutor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic or Question for Tutor (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. NCERT Chapter 4 doubts, previous year JEE questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pricing & Commission Breakdown */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Class Tuition ({duration} mins)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Tutor Payout (75%)</span>
              <span>{formatCurrency(tutorEarning)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Platform & Classroom Tech Fee ({percentage}%)</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Payable</span>
              <span className="text-indigo-600">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="w-1/3" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              className="w-2/3"
              isLoading={isSubmitting}
              onClick={handleBooking}
            >
              Confirm & Schedule
            </Button>
          </div>
        </div>
      ) : (
        /* Booking Confirmed State */
        <div className="text-center py-6 space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Class Scheduled Successfully!</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            Your session with <span className="font-semibold text-slate-900">{tutor.user?.full_name}</span> has been confirmed.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Booking Ref:</span>
              <span className="font-mono font-bold text-slate-800">{bookingRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Time:</span>
              <span className="font-semibold text-slate-800">{selectedDate} @ {selectedTime} IST</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Classroom:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Live Room Ready
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleClose();
                router.push('/student/bookings');
              }}
            >
              View in My Bookings
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => {
                handleClose();
                router.push('/student/dashboard');
              }}
            >
              Go to Student Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
