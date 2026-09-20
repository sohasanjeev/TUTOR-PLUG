import React from 'react';
import Link from 'next/link';
import { TutorProfile } from '@/lib/types';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { GraduationCap, Clock, BookOpen, Sparkles } from 'lucide-react';

export interface TutorCardProps {
  tutor: TutorProfile;
  onBookNow?: (tutor: TutorProfile) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor, onBookNow }) => {
  const user = tutor.user;

  return (
    <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar + Info + Rate */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.full_name || 'Tutor'}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border border-slate-100 shadow-xs"
              />
              {tutor.verification_status === 'verified' && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                  ✓
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/tutors/${tutor.id}`}
                  className="font-bold text-base sm:text-lg text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  {user?.full_name}
                </Link>
                {tutor.verification_status === 'verified' && (
                  <Badge variant="verified" size="sm">
                    Verified Mentor
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                {tutor.qualifications}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <StarRating rating={tutor.average_rating} totalReviews={tutor.total_reviews} size="sm" />
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {tutor.experience_years} yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Rate pill */}
          <div className="text-right shrink-0">
            <div className="text-lg sm:text-xl font-black text-slate-900">
              {formatCurrency(tutor.hourly_rate)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">/ 60 min session</span>
          </div>
        </div>

        {/* Bio / Headline snippet */}
        <p className="mt-4 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {tutor.headline || tutor.bio}
        </p>

        {/* Subject & Board Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
          {tutor.subjects?.map((s) => (
            <span
              key={s.id}
              className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100"
            >
              {s.name}
            </span>
          ))}
          {tutor.boards?.slice(0, 2).map((b) => (
            <span
              key={b.id}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
            >
              {b.name}
            </span>
          ))}
          {tutor.boards && tutor.boards.length > 2 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{tutor.boards.length - 2} more
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link href={`/tutors/${tutor.id}`} className="w-1/2">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <div className="w-1/2">
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={() => onBookNow?.(tutor)}
          >
            Book Class
          </Button>
        </div>
      </div>
    </div>
  );
};
