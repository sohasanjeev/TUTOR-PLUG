import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'verified' | 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    outline: 'border border-slate-300 text-slate-600 bg-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {variant === 'verified' && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
      {variant === 'warning' && <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />}
      {children}
    </span>
  );
};
