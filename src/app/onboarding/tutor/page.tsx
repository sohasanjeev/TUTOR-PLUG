'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { INITIAL_BOARDS, INITIAL_SUBJECTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function TutorOnboardingPage() {
  const router = useRouter();
  const { user, tutorProfile, updateTutorProfile } = useAuth();

  const [headline, setHeadline] = useState(
    tutorProfile?.headline || 'Senior Educator • Specialist in Advanced Mathematics & Physics'
  );
  const [degree, setDegree] = useState(tutorProfile?.degree || 'B.Tech / M.Sc. in Engineering & Science');
  const [institution, setInstitution] = useState(tutorProfile?.institution || 'Top University / Institute');
  const [experienceYears, setExperienceYears] = useState(tutorProfile?.experience_years || 5);
  const [hourlyRate, setHourlyRate] = useState(tutorProfile?.hourly_rate || 1000);
  const [bio, setBio] = useState(
    tutorProfile?.bio ||
      'I am an educator passionate about making difficult concepts accessible and enjoyable for students.'
  );
  const [teachingMethodology, setTeachingMethodology] = useState(
    tutorProfile?.teaching_methodology ||
      'Interactive Socratic method, step-by-step problem deconstruction, and visual real-time diagramming.'
  );

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Physics']);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(['CBSE', 'ICSE / ISC']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completion calculation
  const completionPercentage = Math.min(
    100,
    (headline ? 20 : 0) +
      (degree ? 20 : 0) +
      (selectedSubjects.length > 0 ? 20 : 0) +
      (bio ? 20 : 0) +
      (hourlyRate ? 20 : 0)
  );

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userId = user?.id || `usr-tut-${Date.now()}`;

    try {
      const res = await fetch('/api/onboarding/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          headline,
          degree,
          institution,
          experience_years: experienceYears,
          hourly_rate: hourlyRate,
          bio,
          teaching_methodology: teachingMethodology,
          selectedSubjects,
          selectedBoards,
          profile_completion_percentage: completionPercentage,
        }),
      });

      const data = await res.json();
      if (data.success && data.tutor) {
        updateTutorProfile(data.tutor);
      }
    } catch (err) {
      console.error('Error saving tutor application to database:', err);
    } finally {
      setIsSubmitting(false);
      router.push('/tutor/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="md" href="/" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Tutor Onboarding & Verification
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Submit Your Educator Application
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your application will be stored permanently in the database for admin review.
          </p>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-slate-700">Application Completeness</span>
            <span className="text-indigo-600">{completionPercentage}% Completed</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleFinish} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Professional Headline & Biography
            </h3>
            <div>
              <Input
                label="Professional Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Master in Mathematics • 5+ Years Teaching Experience"
                helperText="Displayed prominently on the public tutor directory."
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Biography & Experience
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Academic Credentials & Institution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Qualification"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
              <Input
                label="College / Institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Years of Teaching Experience:</span>
                <span className="text-indigo-600">{experienceYears} Years</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Subjects & Curriculum Boards
            </h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Core Subjects Taught
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {INITIAL_SUBJECTS.map((s) => {
                  const isSel = selectedSubjects.includes(s.name);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setSelectedSubjects(
                          isSel ? selectedSubjects.filter((x) => x !== s.name) : [...selectedSubjects, s.name]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Boards Covered
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {INITIAL_BOARDS.map((b) => {
                  const isSel = selectedBoards.includes(b.name);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        setSelectedBoards(
                          isSel ? selectedBoards.filter((x) => x !== b.name) : [...selectedBoards, b.name]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                        isSel
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Hourly Tuition Fee
            </h3>
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                <span>Tuition Fee Per Hour:</span>
                <span className="text-indigo-600 font-bold text-sm">
                  {formatCurrency(hourlyRate)}/hr
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={2500}
                step={50}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹50/hr</span>
                <span>₹2,500/hr</span>
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Real Database Submission</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              When you submit, your record is written directly to the server database. The administrator will see your application on the Admin Dashboard and can grant the official Verified Educator status.
            </p>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Submit Application & Enter Studio
          </Button>
        </form>
      </div>
    </div>
  );
}
