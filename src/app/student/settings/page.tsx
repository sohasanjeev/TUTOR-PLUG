'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { INITIAL_BOARDS, INITIAL_CLASS_LEVELS } from '@/lib/constants';
import { User, Mail, Phone, BookOpen, Check } from 'lucide-react';

export default function StudentSettingsPage() {
  const { user, studentProfile, updateUser, updateStudentProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Rohan Mehta');
  const [email, setEmail] = useState(user?.email || 'rohan.student@tutorplug.demo');
  const [classLevel, setClassLevel] = useState(studentProfile?.class_level || INITIAL_CLASS_LEVELS[2].name);
  const [board, setBoard] = useState(studentProfile?.board || INITIAL_BOARDS[0].name);
  const [learningGoals, setLearningGoals] = useState(studentProfile?.learning_goals || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ full_name: fullName, email });
    updateStudentProfile({ class_level: classLevel, board, learning_goals: learningGoals });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout role="student">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Account & Learning Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your personal details, academic curriculum, and learning goals.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Profile and settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <Input
              label="Registered Mobile Number"
              value={user?.phone || '+91 99887 76655'}
              disabled
              helperText="Phone number is verified and tied to your OTP credentials."
              leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Academic Curriculum
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Class / Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                >
                  {INITIAL_CLASS_LEVELS.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Curriculum Board</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800"
                >
                  {INITIAL_BOARDS.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Learning Goals</label>
              <textarea
                rows={3}
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800"
              />
            </div>
          </div>

          <Button type="submit" variant="gradient" size="md">
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
