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
                  helperText="Standard SMS rates may apply. No password needed."
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
                className="w-full h-11 text-sm"
                isLoading={isLoading}
              >
                Verify & Enter {selectedRole === 'tutor' ? 'Tutor Portal' : 'Student Portal'}
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
