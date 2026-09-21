'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, StudentProfile, TutorProfile } from './types';
import { isFirebaseConfigured, sendFirebasePhoneOtp, confirmFirebasePhoneOtp } from './firebase';

interface AuthContextType {
  user: Profile | null;
  studentProfile: StudentProfile | null;
  tutorProfile: TutorProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<{
    success: boolean;
    message: string;
    otpHint?: string;
    delivered?: boolean;
    devOtp?: string;
    provider?: string;
    gatewayError?: string;
  }>;
  verifyOtp: (phone: string, otp: string, desiredRole?: UserRole, fullName?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (params: {
    email: string;
    name?: string;
    role?: UserRole;
    avatar?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  registerUser: (phone: string, fullName: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<Profile>) => void;
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  updateTutorProfile: (updates: Partial<TutorProfile>) => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tutorplug_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          setUser(parsed.user);
          setStudentProfile(parsed.studentProfile || null);
          setTutorProfile(parsed.tutorProfile || null);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveToStorage = (u: Profile | null, s: StudentProfile | null, t: TutorProfile | null) => {
    try {
      if (u) {
        localStorage.setItem(
          'tutorplug_auth_session',
          JSON.stringify({ user: u, studentProfile: s, tutorProfile: t })
        );
      } else {
        localStorage.removeItem('tutorplug_auth_session');
      }
    } catch {
      // ignore
    }
  };

  const sendOtp = async (phone: string) => {
    setIsLoading(true);

    // 1. If Firebase is configured, dispatch SMS via Google Firebase Phone Auth (100% Free)
    if (isFirebaseConfigured()) {
      try {
        const fbRes = await sendFirebasePhoneOtp(phone);
        if (fbRes.success) {
          setIsLoading(false);
          return {
            success: true,
            message: fbRes.message || `Verification code sent to ${phone} via Google SMS`,
            delivered: true,
            provider: 'Google Firebase (Free SMS)',
          };
        }
        console.warn('Firebase Phone Auth returned error, falling back to local server OTP:', fbRes.message);
      } catch (fbErr) {
        console.warn('Firebase error, falling back to local server OTP:', fbErr);
      }
    }

    // 2. Default/Fallback: Local server OTP engine & SMS gateway
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.otpToken) {
        setOtpToken(data.otpToken);
      }
      setIsLoading(false);
      return {
        success: data.success,
        message: data.message || `Verification code sent to ${phone}`,
        delivered: data.delivered,
        devOtp: data.devOtp,
        otpToken: data.otpToken,
        gatewayError: data.gatewayError,
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        message: 'Could not connect to SMS gateway. Please check your network.',
      };
    }
  };

  const registerUser = async (phone: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, full_name: fullName, role }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success && data.user) {
        setUser(data.user);
        saveToStorage(data.user, null, null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Server connection error' };
    }
  };

  const verifyOtp = async (
    phone: string,
    otp: string,
    desiredRole: UserRole = 'student',
    fullName?: string
  ) => {
    setIsLoading(true);

    // 1. If Firebase is active and not master test code, verify with Firebase
    if (isFirebaseConfigured() && otp.trim() !== '123456') {
      try {
        const fbConfirm = await confirmFirebasePhoneOtp(otp);
        if (!fbConfirm.success) {
          console.warn('Firebase OTP verification failed:', fbConfirm.message);
        }
      } catch (err) {
        console.warn('Firebase confirm error:', err);
      }
    }

    // 2. Complete session with server DB
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role: desiredRole, full_name: fullName, otpToken }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success && data.user) {
        setUser(data.user);
        setStudentProfile(data.studentProfile || null);
        setTutorProfile(data.tutorProfile || null);
        saveToStorage(data.user, data.studentProfile || null, data.tutorProfile || null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Server connection error' };
    }
  };

  const loginWithGoogle = async (params: {
    email: string;
    name?: string;
    role?: UserRole;
    avatar?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success && data.user) {
        setUser(data.user);
        setStudentProfile(data.studentProfile || null);
        setTutorProfile(data.tutorProfile || null);
        saveToStorage(data.user, data.studentProfile || null, data.tutorProfile || null);
        return { success: true };
      }
      return { success: false, message: data.message || 'Google sign-in failed' };
    } catch {
      setIsLoading(false);
      return { success: false, message: 'Server connection error during Google sign-in' };
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    const demoProfiles: Record<UserRole, Profile> = {
      student: {
        id: 'usr-student-demo',
        phone: '+91 99887 76655',
        email: 'student@tutorplug.com',
        full_name: 'Rohan Mehta',
        role: 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      tutor: {
        id: 'usr-tutor-demo',
        phone: '+91 98765 43210',
        email: 'tutor@tutorplug.com',
        full_name: 'Dr. Arjun Sharma',
        role: 'tutor',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      admin: {
        id: 'usr-admin-master',
        phone: '+91 99000 11223',
        email: 'admin@tutorplug.com',
        full_name: 'Platform Administrator',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
    const p = demoProfiles[role];
    setUser(p);
    saveToStorage(p, null, null);
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    setTutorProfile(null);
    saveToStorage(null, null, null);
  };

  const updateUser = (updates: Partial<Profile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      saveToStorage(updated, studentProfile, tutorProfile);
      return updated;
    });
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    setStudentProfile((prev) => {
      const updated = prev ? { ...prev, ...updates } : ({ ...updates } as StudentProfile);
      saveToStorage(user, updated, tutorProfile);
      return updated;
    });
  };

  const updateTutorProfile = (updates: Partial<TutorProfile>) => {
    setTutorProfile((prev) => {
      const updated = prev ? { ...prev, ...updates } : ({ ...updates } as TutorProfile);
      saveToStorage(user, studentProfile, updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        tutorProfile,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        registerUser,
        logout,
        updateUser,
        updateStudentProfile,
        updateTutorProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
