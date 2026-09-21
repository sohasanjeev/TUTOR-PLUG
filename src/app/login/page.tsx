'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import {
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  User,
  X,
  Lock,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendOtp, verifyOtp, switchDemoRole, loginWithGoogle } = useAuth();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Email state
  const [email, setEmail] = useState('');
  const [emailName, setEmailName] = useState('');

  // Google modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleRedirect = (role: UserRole) => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      router.push(`/${redirect}`);
    } else if (role === 'tutor') {
      router.push('/tutor/dashboard');
    } else if (role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  // 1. Phone OTP Dispatch
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
      const codeToFill = res.devOtp || '123456';
      setDevOtpHint(codeToFill);
      setOtp(codeToFill); // Auto-fill so 1-click verify works immediately!
    } else {
      setError(res.message || 'Failed to dispatch verification code.');
    }
  };

  // 2. Phone OTP Verification
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
      handleRedirect(selectedRole);
    } else {
      setError(res.message || 'Verification failed. Try again or use master code 123456.');
    }
  };

  // 3. Email Direct Sign-in
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    const res = await loginWithGoogle({
      email,
      name: emailName || email.split('@')[0],
      role: selectedRole,
    });
    setIsLoading(false);
    if (res.success) {
      handleRedirect(selectedRole);
    } else {
      setError(res.message || 'Failed to sign in with email.');
    }
  };

  // 4. Google One-Click Login
  const handleGoogleSignIn = async (userEmail?: string, userName?: string) => {
    const finalEmail = userEmail || googleEmailInput.trim() || 'student@tutorplug.com';
    const finalName = userName || googleNameInput.trim() || finalEmail.split('@')[0];

    setError('');
    setIsLoading(true);
    const res = await loginWithGoogle({
      email: finalEmail,
      name: finalName,
      role: selectedRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalName)}`,
    });
    setIsLoading(false);
    setShowGoogleModal(false);
    if (res.success) {
      handleRedirect(selectedRole);
    } else {
      setError(res.message || 'Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" href="/" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome to Tutor Plug
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sign in to access your classes, recordings, and virtual classroom.
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/90 space-y-5">
          <div id="recaptcha-container"></div>

          {/* Account Role Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Sign In As
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'student'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('tutor')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  selectedRole === 'tutor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📚 Tutor
              </button>
            </div>
          </div>

          {/* 1. Official Continue with Google Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer group"
            >
              <GoogleIcon />
              <span className="font-semibold text-slate-800 group-hover:text-slate-900">
                Continue with Google
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Choose Method
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Tabs: Mobile Phone OTP vs Email */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'phone'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email / Gmail</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
              {error}
            </div>
          )}

          {/* Method 1: Mobile Phone & Clean OTP */}
          {authMethod === 'phone' && (
            <>
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <Input
                      label="Mobile Number"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                      helperText="Enter 10-digit mobile number for instant verification."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-11 text-sm"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Send Verification Code
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Clean Code Alert (No technical errors, perfectly auto-filled) */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        Verification Code Generated
                      </span>
                      <span className="text-[10px] bg-emerald-200/90 text-emerald-900 font-bold px-2 py-0.5 rounded-full font-mono">
                        {devOtpHint || '123456'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Code <strong className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold">{devOtpHint || '123456'}</strong> has been auto-filled below. Click <strong>Verify & Enter</strong> to continue!
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                    <span>Mobile: <strong>{phone}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <Input
                      label="6-Digit Verification Code"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      leftIcon={<KeyRound className="h-4 w-4 text-slate-400" />}
                      helperText="Valid for 10 minutes."
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                    <span>💡 Universal Test Code: <strong className="font-mono text-slate-900 font-bold">123456</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp('123456')}
                      className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Auto-fill 123456
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn&apos;t get code?</span>
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
                    className="w-full h-11 text-sm font-bold"
                    isLoading={isLoading}
                  >
                    Verify & Enter {selectedRole === 'tutor' ? 'Tutor Workspace' : 'Student Portal'}
                  </Button>
                </form>
              )}
            </>
          )}

          {/* Method 2: Direct Email / Gmail Sign-in */}
          {authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Input
                  label="Email / Gmail Address"
                  placeholder="yourname@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                  helperText="Enter your Gmail or email for instant access."
                />
              </div>

              <div>
                <Input
                  label="Your Full Name (Optional)"
                  placeholder="e.g. Sanjeev Kumar"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                  leftIcon={<User className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full h-11 text-sm font-bold"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continue to {selectedRole === 'tutor' ? 'Tutor Workspace' : 'Student Portal'}
              </Button>
            </form>
          )}

          {/* Quick 1-Click Instant Demo Login */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              1-Click Instant Demo Access
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

          <div className="text-center pt-1">
            <p className="text-xs text-slate-500">
              New to Tutor Plug?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Sign-in Interactive Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <GoogleIcon />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-500">Choose an account to continue to Tutor Plug</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick One-Tap Preset Accounts */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select an Account
              </div>
              <button
                type="button"
                onClick={() => handleGoogleSignIn('sanjeev@gmail.com', 'Sanjeev Kumar')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 flex items-center gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  SK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                    Sanjeev Kumar
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">sanjeev@gmail.com</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  1-Click
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn('arjun.sharma@gmail.com', 'Dr. Arjun Sharma')}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                    Dr. Arjun Sharma
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">arjun.sharma@gmail.com</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Tutor
                </span>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or Use Another Gmail
              </div>
              <Input
                label="Gmail / Google Account"
                placeholder="name@gmail.com"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              />
              <Input
                label="Your Name (Optional)"
                placeholder="Your Full Name"
                value={googleNameInput}
                onChange={(e) => setGoogleNameInput(e.target.value)}
                leftIcon={<User className="h-4 w-4 text-slate-400" />}
              />
              <Button
                type="button"
                onClick={() => handleGoogleSignIn()}
                variant="gradient"
                className="w-full h-11 text-sm font-bold"
                isLoading={isLoading}
              >
                Sign In with Google
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-sm text-slate-500">
          Loading login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
