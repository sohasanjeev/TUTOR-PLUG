import { TutorProfile, TutorFilterParams, Subject, ClassLevel, Board } from '@/lib/types';
import { INITIAL_SUBJECTS, INITIAL_CLASS_LEVELS, INITIAL_BOARDS } from '@/lib/constants';

class TutorService {
  private tutors: TutorProfile[] = [];

  async getTutors(params: TutorFilterParams = {}): Promise<{ tutors: TutorProfile[]; total: number }> {
    // If running in browser, fetch real database records from /api/tutors
    if (typeof window !== 'undefined') {
      try {
        const query = new URLSearchParams();
        if (params.search) query.set('search', params.search);
        if (params.subject) query.set('subject', params.subject);
        if (params.board) query.set('board', params.board);
        if (params.class_level) query.set('class_level', params.class_level);
        if (params.max_price) query.set('max_price', String(params.max_price));

        const res = await fetch(`/api/tutors?${query.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.tutors)) {
          this.tutors = data.tutors;
        }
      } catch (err) {
        console.warn('Fallback to local tutors list:', err);
      }
    }

    let filtered = [...this.tutors];

    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter((t) => {
        const nameMatch = t.user?.full_name?.toLowerCase().includes(q);
        const bioMatch = t.bio?.toLowerCase().includes(q);
        const headlineMatch = t.headline?.toLowerCase().includes(q);
        const subjectMatch = t.subjects?.some((s) => s.name.toLowerCase().includes(q));
        return nameMatch || bioMatch || headlineMatch || subjectMatch;
      });
    }

    if (params.subject) {
      filtered = filtered.filter((t) =>
        t.subjects?.some((s) => s.id === params.subject || s.slug === params.subject || s.name === params.subject)
      );
    }

    if (params.class_level) {
      filtered = filtered.filter((t) =>
        t.class_levels?.some((c) => c.id === params.class_level || c.name.includes(params.class_level!))
      );
    }

    if (params.board) {
      filtered = filtered.filter((t) =>
        t.boards?.some((b) => b.id === params.board || b.name === params.board)
      );
    }

    if (typeof params.min_price === 'number') {
      filtered = filtered.filter((t) => t.hourly_rate >= params.min_price!);
    }

    if (typeof params.max_price === 'number') {
      filtered = filtered.filter((t) => t.hourly_rate <= params.max_price!);
    }

    if (typeof params.min_rating === 'number') {
      filtered = filtered.filter((t) => t.average_rating >= params.min_rating!);
    }

    if (params.language) {
      filtered = filtered.filter((t) =>
        t.languages?.some((l) => l.toLowerCase() === params.language?.toLowerCase())
      );
    }

    // Sorting
    if (params.sort_by === 'price_low') {
      filtered.sort((a, b) => a.hourly_rate - b.hourly_rate);
    } else if (params.sort_by === 'price_high') {
      filtered.sort((a, b) => b.hourly_rate - a.hourly_rate);
    } else if (params.sort_by === 'rating') {
      filtered.sort((a, b) => b.average_rating - a.average_rating);
    } else if (params.sort_by === 'experience') {
      filtered.sort((a, b) => b.experience_years - a.experience_years);
    } else {
      filtered.sort((a, b) => (b.average_rating || 5) * (b.total_reviews || 1) - (a.average_rating || 5) * (a.total_reviews || 1));
    }

    return { tutors: filtered, total: filtered.length };
  }

  async getTutorById(id: string): Promise<TutorProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/tutors');
        const data = await res.json();
        if (data.success && data.tutors) {
          const found = data.tutors.find((t: TutorProfile) => t.id === id || t.user_id === id);
          if (found) return found;
        }
      } catch {
        // fallback
      }
    }
    const tutor = this.tutors.find((t) => t.id === id || t.user_id === id);
    return tutor || null;
  }

  async getSubjects(): Promise<Subject[]> {
    return INITIAL_SUBJECTS;
  }

  async getClassLevels(): Promise<ClassLevel[]> {
    return INITIAL_CLASS_LEVELS;
  }

  async getBoards(): Promise<Board[]> {
    return INITIAL_BOARDS;
  }

  async updateVerification(tutorId: string, status: 'unverified' | 'verified' | 'rejected'): Promise<TutorProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/admin/tutors/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tutorId, status }),
        });
        const data = await res.json();
        if (data.success && data.tutor) {
          return data.tutor;
        }
      } catch (err) {
        console.error('Error verifying tutor:', err);
      }
    }
    const idx = this.tutors.findIndex((t) => t.id === tutorId);
    if (idx !== -1) {
      this.tutors[idx].verification_status = status;
      return this.tutors[idx];
    }
    return null;
  }
}

export const tutorService = new TutorService();
