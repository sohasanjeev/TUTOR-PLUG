import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalReviews,
  size = 'md',
  showNumber = true,
  className,
}) => {
  const sizeMap = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeMap[size],
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-300'
            )}
          />
        ))}
      </div>
      {showNumber && (
        <div className={cn('flex items-center gap-1 font-bold text-slate-800', textSizeMap[size])}>
          <span>{rating.toFixed(1)}</span>
          {typeof totalReviews === 'number' && (
            <span className="font-normal text-slate-400">({totalReviews})</span>
          )}
        </div>
      )}
    </div>
  );
};
