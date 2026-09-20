'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { INITIAL_BOARDS, INITIAL_CLASS_LEVELS, INITIAL_SUBJECTS } from '@/lib/constants';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const { user, studentProfile, updateStudentProfile } = useAuth();

  const [classLevel, setClassLevel] = useState(studentProfile?.class_level || INITIAL_CLASS_LEVELS[2].name);
  const [board, setBoard] = useState(studentProfile?.board || INITIAL_BOARDS[0].name);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics']);
  const [preferredLanguage, setPreferredLanguage] = useState(studentProfile?.preferred_language || 'English');
  const [learningGoals, setLearningGoals] = useState(
    studentProfile?.learning_goals ||
      'Targeting top scores in school examinations and building crystal clear fundamentals.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = user?.id || 'usr-stud-temp';

    try {
      await fetch('/api/onboarding/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          class_level: classLevel,
          board,
          preferred_language: preferredLanguage,
          learning_goals: learningGoals,
        }),
      });

      updateStudentProfile({
        class_level: classLevel,
        board,
        preferred_language: preferredLanguage,
        learning_goals: learningGoals,
      });
    } catch (err) {
      console.error('Error saving student profile:', err);
    } finally {
      setIsSubmitting(false);
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="md" href="/" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Student Onboarding
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Tell us about your learning goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            This helps us match you with the best educators for your syllabus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Class / Grade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Your Current Class / Grade
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {INITIAL_CLASS_LEVELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setClassLevel(c.name)}
                  className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                    classLevel === c.name
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Board */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Curriculum Board
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {INITIAL_BOARDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBoard(b.name)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    board === b.name
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Subjects */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Subjects You Need Help With
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {INITIAL_SUBJECTS.map((s) => {
                const isSelected = selectedSubjects.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSubject(s.name)}
                    className={`px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Preferred Teaching Language
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {['English', 'Hindi + English (Bilingual)', 'Hindi'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreferredLanguage(lang)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    preferredLanguage === lang
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Learning Goals or Weak Areas
            </label>
            <textarea
              rows={3}
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Need assistance with homework and board exam past papers."
            />
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Save Profile & Enter Student Portal
          </Button>
        </form>
      </div>
    </div>
  );
}
