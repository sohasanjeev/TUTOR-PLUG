'use client';

import React from 'react';
import { Subject, ClassLevel, Board, TutorFilterParams } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Filter, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface TutorFilterSidebarProps {
  filters: TutorFilterParams;
  onChange: (newFilters: TutorFilterParams) => void;
  subjects: Subject[];
  classLevels: ClassLevel[];
  boards: Board[];
  onReset: () => void;
}

export const TutorFilterSidebar: React.FC<TutorFilterSidebarProps> = ({
  filters,
  onChange,
  subjects,
  classLevels,
  boards,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Faceted Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Subject
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onChange({ ...filters, subject: undefined })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filters.subject ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onChange({ ...filters, subject: sub.id })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.subject === sub.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Board Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Curriculum Board
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => onChange({ ...filters, board: undefined })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filters.board ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Boards
          </button>
          {boards.map((b) => (
            <button
              key={b.id}
              onClick={() => onChange({ ...filters, board: b.id })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.board === b.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Class Level */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Class / Grade
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => onChange({ ...filters, class_level: undefined })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !filters.class_level ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Classes
          </button>
          {classLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onChange({ ...filters, class_level: lvl.id })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.class_level === lvl.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lvl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Rate Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Max Hourly Fee
          </label>
          <span className="text-xs font-bold text-indigo-600">
            {formatCurrency(filters.max_price || 2000)}/hr
          </span>
        </div>
        <input
          type="range"
          min={400}
          max={2000}
          step={100}
          value={filters.max_price || 2000}
          onChange={(e) => onChange({ ...filters, max_price: Number(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>₹400</span>
          <span>₹2,000+</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Minimum Rating
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[4.5, 4.8, 4.9].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                onChange({ ...filters, min_rating: filters.min_rating === rating ? undefined : rating })
              }
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                filters.min_rating === rating
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
