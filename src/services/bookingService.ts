import { Booking, BookingStatus, TutorProfile } from '@/lib/types';
import { calculateCommission } from '@/lib/utils';
import { INITIAL_SUBJECTS, DEFAULT_PLATFORM_SETTINGS } from '@/lib/constants';

class BookingService {
  private bookings: Booking[] = [];

  async getStudentBookings(studentId: string): Promise<Booking[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/bookings?student_id=${encodeURIComponent(studentId)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          this.bookings = data.bookings;
          return data.bookings;
        }
      } catch (err) {
        console.warn('Fallback to local student bookings:', err);
      }
    }
    return this.bookings.filter((b) => b.student_id === studentId);
  }

  async getTutorBookings(tutorUserId: string): Promise<Booking[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/bookings?tutor_id=${encodeURIComponent(tutorUserId)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          return data.bookings;
        }
      } catch (err) {
        console.warn('Fallback to local tutor bookings:', err);
      }
    }
    return this.bookings.filter((b) => b.tutor_id === tutorUserId);
  }

  async getAllBookings(): Promise<Booking[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          this.bookings = data.bookings;
          return data.bookings;
        }
      } catch (err) {
        console.warn('Fallback to local bookings:', err);
      }
    }
    return this.bookings;
  }

  async createBooking(params: {
    studentId: string;
    tutor: TutorProfile;
    subjectId: string;
    scheduledStart: string;
    scheduledEnd: string;
    durationMinutes: number;
    notes?: string;
    commissionPercent?: number;
  }): Promise<Booking> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: params.studentId,
            tutorId: params.tutor.user_id,
            subjectId: params.subjectId,
            scheduledStart: params.scheduledStart,
            scheduledEnd: params.scheduledEnd,
            durationMinutes: params.durationMinutes,
            notes: params.notes,
          }),
        });
        const data = await res.json();
        if (data.success && data.booking) {
          this.bookings.unshift(data.booking);
          return data.booking;
        }
      } catch (err) {
        console.error('Failed to create booking via API, falling back locally:', err);
      }
    }

    const rate = params.tutor.hourly_rate;
    const subtotal = Math.round((rate * params.durationMinutes) / 60);
    const commPercent = params.commissionPercent || DEFAULT_PLATFORM_SETTINGS.commission_percentage;
    const { platformFee, tutorEarning } = calculateCommission(subtotal, commPercent);

    const subject = params.tutor.subjects?.find((s) => s.id === params.subjectId) || INITIAL_SUBJECTS[0];

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      student_id: params.studentId,
      tutor_id: params.tutor.user_id,
      subject_id: params.subjectId,
      scheduled_start: params.scheduledStart,
      scheduled_end: params.scheduledEnd,
      duration_minutes: params.durationMinutes,
      hourly_rate: rate,
      subtotal,
      platform_commission: platformFee,
      tutor_earning: tutorEarning,
      currency: 'INR',
      status: 'confirmed',
      meeting_id: `tp-meet-${Math.random().toString(36).substring(2, 8)}`,
      notes: params.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subject,
      tutor: params.tutor,
    };

    this.bookings.unshift(newBooking);
    return newBooking;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking | null> {
    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      this.bookings[idx].status = status;
      this.bookings[idx].updated_at = new Date().toISOString();
      return this.bookings[idx];
    }
    return null;
  }
}

export const bookingService = new BookingService();
