'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { TutorCard } from '@/components/tutors/TutorCard';
import { TutorFilterSidebar } from '@/components/tutors/TutorFilterSidebar';
import { BookingModal } from '@/components/tutors/BookingModal';
import { tutorService } from '@/services/tutorService';
import { TutorProfile, Subject, ClassLevel, Board, TutorFilterParams } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, SlidersHorizontal, X } from 'lucide-react';

function TutorsContent() {
  const searchParams = useSearchParams();

  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<TutorFilterParams>({
    search: searchParams.get('search') || '',
    subject: searchParams.get('subject') || undefined,
    class_level: searchParams.get('class_level') || undefined,
    board: searchParams.get('board') || undefined,
    sort_by: 'relevance',
  });

  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Booking Modal
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Load initial taxonomies
  useEffect(() => {
    async function initTaxonomies() {
      const [s, c, b] = await Promise.all([
        tutorService.getSubjects(),
        tutorService.getClassLevels(),
        tutorService.getBoards(),
      ]);
      setSubjects(s);
      setClassLevels(c);
      setBoards(b);
    }
    initTaxonomies();
  }, []);

  // Fetch filtered tutors
  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      const res = await tutorService.getTutors(filters);
      setTutors(res.tutors);
      setIsLoading(false);
    }
    fetchFiltered();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      subject: undefined,
      class_level: undefined,
      board: undefined,
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      sort_by: 'relevance',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find an Expert 1-on-1 Online Tutor
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Browse verified educators across Mathematics, Physics, Coding, Biology & Competitive exams.
          </p>

          {/* Search bar & Mobile Filter Button */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by tutor name, subject (e.g., Calculus, Python), or credential..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsMobileFilterOpen(true)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <TutorFilterSidebar
              filters={filters}
              onChange={setFilters}
              subjects={subjects}
              classLevels={classLevels}
              boards={boards}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Mobile Filter Drawer */}
          {isMobileFilterOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={() => setIsMobileFilterOpen(false)}
              />
              <div className="relative w-80 bg-white h-full flex flex-col z-10 shadow-2xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Filter Tutors</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <TutorFilterSidebar
                  filters={filters}
                  onChange={(f) => setFilters(f)}
                  subjects={subjects}
                  classLevels={classLevels}
                  boards={boards}
                  onReset={handleResetFilters}
                />
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => setIsMobileFilterOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Right Results Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results count & Sort toolbar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200/80 px-4 py-3 shadow-xs">
              <span className="text-xs font-bold text-slate-700">
                Showing {tutors.length} Verified Tutors
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
                <select
                  value={filters.sort_by || 'relevance'}
                  onChange={(e) =>
                    setFilters({ ...filters, sort_by: e.target.value as TutorFilterParams['sort_by'] })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="relevance">Recommended (Relevance)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Experience (Years)</option>
                </select>
              </div>
            </div>

            {/* Tutor List / Grid */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-2xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-72" />
                      </div>
                    </div>
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : tutors.length > 0 ? (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onBookNow={(t) => {
                      setSelectedTutor(t);
                      setIsBookingOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={filters.search ? `No tutors found for "${filters.search}"` : "No Verified Tutors Available Yet"}
                description={
                  filters.search || filters.subject || filters.board || filters.class_level
                    ? "We couldn't find any verified educators matching your exact filters. Try clearing some filters or searching with a different subject keyword."
                    : "We are currently vetting educator applications. Are you a qualified teacher or subject expert?"
                }
                actionLabel={
                  filters.search || filters.subject || filters.board || filters.class_level
                    ? "Reset All Filters"
                    : "Apply to Teach on Tutor Plug"
                }
                onAction={() => {
                  if (filters.search || filters.subject || filters.board || filters.class_level) {
                    handleResetFilters();
                  } else {
                    window.location.href = '/become-a-tutor';
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <PublicFooter />

      {/* Booking Modal */}
      <BookingModal
        tutor={selectedTutor}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedTutor(null);
        }}
      />
    </div>
  );
}

export default function TutorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-sm text-slate-500">Loading tutors...</div>}>
      <TutorsContent />
    </Suspense>
  );
}
