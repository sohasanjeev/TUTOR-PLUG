'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, ArrowRight, ShieldCheck, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { UserRole } from '@/lib/types';

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { switchDemoRole } = useAuth();

  const navLinks = [
    { label: 'Find Tutors', href: '/tutors' },
    { label: 'Virtual Classroom', href: '/classroom/TP-8F3K2' },
    { label: 'My Classes', href: '/student/classes' },
    { label: 'Recordings Vault', href: '/admin/recordings' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Become a Tutor', href: '/become-a-tutor' },
  ];

  const getDashboardHref = (role?: UserRole) => {
    if (role === 'tutor') return '/tutor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo Area */}
          <div className="flex items-center">
            <BrandLogo size="md" href="/" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs xl:text-sm font-medium transition-colors hover:text-indigo-600 ${
                    isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Demo Access Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoOpen(!demoOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Demo Portals</span>
              </button>

              {demoOpen && (
                <div
                  onMouseLeave={() => setDemoOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Switcher
                  </div>
                  <Link
                    href="/classroom/TP-8F3K2"
                    onClick={() => setDemoOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    🎥 Virtual Classroom (Live HD)
                  </Link>
                  <Link
                    href="/admin/recordings"
                    onClick={() => setDemoOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-semibold transition-colors"
                  >
                    ⏺️ Class Recordings Vault
                  </Link>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('student');
                      setDemoOpen(false);
                      window.location.href = '/student/dashboard';
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold transition-colors cursor-pointer"
                  >
                    🎓 Student Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('tutor');
                      setDemoOpen(false);
                      window.location.href = '/tutor/dashboard';
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                  >
                    📚 Tutor Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole('admin');
                      setDemoOpen(false);
                      window.location.href = '/admin/dashboard';
                    }}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-semibold transition-colors cursor-pointer"
                  >
                    ⚡ Admin Platform Control
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link href={getDashboardHref(user.role)}>
                  <Button variant="gradient" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Open {user.role === 'tutor' ? 'Tutor' : user.role === 'admin' ? 'Admin' : 'Student'} Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Quick Demo Access for Mobile */}
          <div className="pt-2 pb-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Instant Demo Portals
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('student');
                  setMobileMenuOpen(false);
                  window.location.href = '/student/dashboard';
                }}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 text-center"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('tutor');
                  setMobileMenuOpen(false);
                  window.location.href = '/tutor/dashboard';
                }}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 text-center"
              >
                📚 Tutor
              </button>
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('admin');
                  setMobileMenuOpen(false);
                  window.location.href = '/admin/dashboard';
                }}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 text-center"
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link href={getDashboardHref(user.role)} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gradient" className="w-full">
                  Open {user.role} Portal
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
