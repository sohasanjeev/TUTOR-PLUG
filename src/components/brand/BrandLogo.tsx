import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  href?: string;
  className?: string;
  theme?: 'light' | 'dark';
}

const sizeMap = {
  sm: { img: 'h-8 w-auto', text: 'text-lg', sub: 'text-[9px]' },
  md: { img: 'h-10 w-auto', text: 'text-xl', sub: 'text-[10px]' },
  lg: { img: 'h-12 w-auto', text: 'text-2xl', sub: 'text-xs' },
  xl: { img: 'h-16 w-auto', text: 'text-3xl', sub: 'text-sm' },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  href = '/',
  className,
  theme = 'light',
}) => {
  const currentSize = sizeMap[size];

  const content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      {/* Dedicated Official Logo Area */}
      <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/tutorplug-logo.png"
          alt="Tutor Plug Official Logo"
          className={cn(currentSize.img, 'object-contain transition-opacity duration-150')}
          loading="eager"
        />
      </div>

      {/* Accompanying Wordmark & Tagline */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className={cn('font-black tracking-tight flex items-baseline', currentSize.text)}>
            <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
              TUTOR
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent ml-1">
              PLUG
            </span>
          </div>
          <span
            className={cn(
              'font-semibold uppercase tracking-wider',
              currentSize.sub,
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            Learn Better • Teach Better
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
