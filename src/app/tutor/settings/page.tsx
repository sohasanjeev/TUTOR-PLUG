'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { User, Mail, Phone, Check, ShieldCheck, DollarSign } from 'lucide-react';

export default function TutorSettingsPage() {
  const { user, tutorProfile, updateUser, updateTutorProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Arjun Sharma');
  const [email, setEmail] = useState(user?.email || 'arjun.sharma@tutorplug.demo');
  const [headline, setHeadline] = useState(tutorProfile?.headline || 'IIT Bombay Alum • 8+ Yrs Exp • Specialist in JEE Adv Mathematics');
  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourly_rate || 1200);
  const [bio, setBio] = useState(tutorProfile?.bio || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ full_name: fullName, email });
    updateTutorProfile({ headline, hourly_rate: hourlyRate, bio });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <DashboardLayout role="tutor">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Tutor Profile & Teaching Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your public profile, hourly pricing, and academic details.
          </p>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400">Account Status</span>
              <Badge variant="verified">Verified Educator</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your degree and teaching background have been officially audited by Tutor Plug.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            Badge Active
          </span>
        </div>

        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Profile and tuition rates updated successfully!</span>
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
              value={user?.phone || '+91 98765 43210'}
              disabled
              helperText="Phone numbers are strictly protected and never shown to students."
              leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Teaching Fee & Headline
            </h3>
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Hourly Rate (Tuition Fee):</span>
                <span className="text-indigo-600 font-black text-sm">{formatCurrency(hourlyRate)}/hr</span>
              </div>
              <input
                type="range"
                min={400}
                max={3000}
                step={100}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹400/hr</span>
                <span>₹3,000/hr</span>
              </div>
            </div>

            <Input
              label="Marketplace Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Biography
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
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
