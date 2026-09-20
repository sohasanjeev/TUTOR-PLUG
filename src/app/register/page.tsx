'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { GraduationCap, BookOpen, Phone, KeyRound, ArrowRight, User, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [isDeliveredViaSms, setIsDeliveredViaSms] = useState(false);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await sendOtp(phone);
    setIsLoading(false);
    if (res.success) {
      setStep('otp');
      setResendCountdown(45);
      setIsDeliveredViaSms(!!res.delivered);
      setGatewayNotice(res.gatewayError || null);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtp(res.devOtp); // Auto-fill so user can verify with 1 click!
      } else {
        setDevOtpHint(null);
      }
    } else {
      setError(res.message || 'Failed to dispatch verification code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await verifyOtp(phone, otp, role, fullName);
    setIsLoading(false);
    if (res.success) {
      if (role === 'tutor') {
        router.push('/onboarding/tutor');
      } else {
        router.push('/onboarding/student');
      }
    } else {
      setError(res.message || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" href="/" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Join Tutor Plug
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Create an account to start learning or teaching.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/90 space-y-6">
          <div id="recaptcha-container"></div>
          {/* Step 1: Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              What are you here to do?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-600 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white w-fit shadow-xs mb-2 text-indigo-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold">I want to Learn</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Find 1-on-1 expert tutors</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('tutor')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  role === 'tutor'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 rounded-xl bg-white w-fit shadow-xs mb-2 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold">I want to Teach</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Earn teaching online</p>
              </button>
            </div>
          </div>

          {step === 'info' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Rohan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  placeholder="+91 99887 76655"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                  error={error}
                  helperText="We will send a 6-digit OTP to verify your account."
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue to Verification
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                <span>OTP sent to <strong>{phone}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Edit
                </button>
              </div>

              {isDeliveredViaSms && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real SMS verification code dispatched to your SIM card.</span>
                </div>
              )}

              {gatewayNotice && (
                <div className="p-3.5 rounded-xl bg-amber-50/95 border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Fast2SMS Gateway Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Fast2SMS responded: <strong>{gatewayNotice}</strong>
                  </p>
                  {devOtpHint && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-amber-700">Your test code: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-950">{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtpHint)}
                        className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Input
                  label="6-Digit SMS Verification Code"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  leftIcon={<KeyRound className="h-4 w-4 text-slate-400" />}
                  error={error}
                  helperText="A real-time SMS code has been sent to your mobile phone. Valid for 5 minutes."
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                <span>Didn&apos;t receive the SMS?</span>
                {resendCountdown > 0 ? (
                  <span className="text-slate-400 font-semibold">Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11"
                isLoading={isLoading}
              >
                Verify & Start Onboarding
              </Button>

              {devOtpHint && (
                <details className="text-[11px] text-slate-400 text-center pt-2">
                  <summary className="cursor-pointer hover:text-slate-600 transition-colors inline-flex items-center gap-1 select-none">
                    <Sparkles className="h-3 w-3 text-slate-400" />
                    <span>Local Test Helper (Click to reveal generated code)</span>
                  </summary>
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-left space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Generated Code: <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300">{devOtpHint}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtpHint)}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                </details>
              )}
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
