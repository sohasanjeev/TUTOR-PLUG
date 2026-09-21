'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { Phone, KeyRound, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendOtp, verifyOtp, switchDemoRole } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [isDeliveredViaSms, setIsDeliveredViaSms] = useState(false);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        setOtp(res.devOtp); // Auto-fill so 1-click verify works immediately!
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
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await verifyOtp(phone, otp, selectedRole);
    setIsLoading(false);
    if (res.success) {
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(`/${redirect}`);
      } else if (selectedRole === 'tutor') {
        router.push('/tutor/dashboard');
      } else if (selectedRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } else {
      setError(res.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* Dedicated Official Logo */}
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" href="/" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to Tutor Plug
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sign in using your mobile number and one-time password (OTP).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/90 space-y-6">
          <div id="recaptcha-container"></div>

          {/* Quick 1-Click Instant Access */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('student');
                  router.push('/student/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 text-slate-700 transition-all shadow-xs cursor-pointer"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('tutor');
                  router.push('/tutor/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 text-slate-700 transition-all shadow-xs cursor-pointer"
              >
                📚 Tutor
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('admin');
                  router.push('/admin/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 text-slate-700 transition-all shadow-xs cursor-pointer"
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          <div className="relative flex py-0 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Or Enter Mobile Number</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRole === 'student'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('tutor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedRole === 'tutor'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tutor
                  </button>
                </div>
              </div>

              <div>
                <Input
                  label="Mobile Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                  error={error}
                  helperText="Free instant OTP verification — enter your number to receive code."
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-sm"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Send Verification OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                <span>OTP sent to <strong>{phone}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  Change
                </button>
              </div>

              {isDeliveredViaSms && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real SMS verification code dispatched to your SIM card.</span>
                </div>
              )}

              {devOtpHint && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Free Instant Verification Active
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your verification code is{' '}
                    <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold">
                      {devOtpHint}
                    </strong>{' '}
                    (Auto-filled below). Click <strong>Verify & Enter</strong> to log in instantly!
                  </p>
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
                  helperText="Valid for 10 minutes. Click below to verify."
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between">
                <span>💡 Universal Master Code: <strong className="font-mono text-slate-900 font-bold">123456</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Auto-fill 123456
                </button>
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
                className="w-full h-11 text-sm"
                isLoading={isLoading}
              >
                Verify & Enter {selectedRole === 'tutor' ? 'Tutor Portal' : 'Student Portal'}
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              New to Tutor Plug?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </div>

          {/* Quick 1-Click Access for Testing */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              Instant 1-Click Access (Testing Mode)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('student');
                  router.push('/student/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 transition-colors cursor-pointer"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('tutor');
                  router.push('/tutor/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 transition-colors cursor-pointer"
              >
                📚 Tutor
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('admin');
                  router.push('/admin/dashboard');
                }}
                className="py-1.5 px-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 text-slate-700 transition-colors cursor-pointer"
              >
                ⚡ Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-sm text-slate-500">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
