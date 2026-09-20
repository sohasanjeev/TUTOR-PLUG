'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  Calendar,
  Video,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  Search,
  Users,
  Clock,
  DollarSign,
  ShieldAlert,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  Radio,
  Film,
  FileText,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode; role: UserRole }> = ({
  children,
  role,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const studentNav: NavItem[] = [
    { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Classes', href: '/student/classes', icon: <Video className="h-5 w-5" /> },
    { label: 'Class Recordings', href: '/student/recordings', icon: <Film className="h-5 w-5" /> },
    { label: 'Find Tutors', href: '/tutors', icon: <Search className="h-5 w-5" /> },
    { label: 'Bookings', href: '/student/bookings', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Messages', href: '/student/messages', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Payments', href: '/student/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Settings', href: '/student/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const tutorNav: NavItem[] = [
    { label: 'Dashboard', href: '/tutor/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Classes', href: '/tutor/classes', icon: <Video className="h-5 w-5" /> },
    { label: 'Class Recordings', href: '/tutor/recordings', icon: <Film className="h-5 w-5" /> },
    { label: 'Students', href: '/tutor/students', icon: <Users className="h-5 w-5" /> },
    { label: 'Availability', href: '/tutor/availability', icon: <Clock className="h-5 w-5" /> },
    { label: 'Messages', href: '/tutor/messages', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Earnings', href: '/tutor/earnings', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Settings', href: '/tutor/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Live Monitor', href: '/admin/live', icon: <Radio className="h-5 w-5 text-rose-500 animate-pulse" />, badge: 'LIVE' },
    { label: 'Class Schedule', href: '/admin/classes', icon: <Video className="h-5 w-5" /> },
    { label: 'Recordings Vault', href: '/admin/recordings', icon: <Film className="h-5 w-5" /> },
    { label: 'Chat Logs', href: '/admin/chats', icon: <MessageSquare className="h-5 w-5" /> },
    { label: 'Policy Violations', href: '/admin/policy-violations', icon: <AlertTriangle className="h-5 w-5 text-amber-500" /> },
    { label: 'Reports & Telemetry', href: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Tutors & Verification', href: '/admin/tutors', icon: <ShieldAlert className="h-5 w-5" /> },
    { label: 'Students', href: '/admin/students', icon: <Users className="h-5 w-5" /> },
    { label: 'Bookings', href: '/admin/bookings', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Payments & Fees', href: '/admin/payments', icon: <CreditCard className="h-5 w-5" /> },
    { label: 'Platform Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems = role === 'tutor' ? tutorNav : role === 'admin' ? adminNav : studentNav;

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    student: { title: 'Student Portal', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    tutor: { title: 'Tutor Workspace', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    admin: { title: 'Platform Control', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200/80 shrink-0">
        {/* Logo Container */}
        <div className="h-18 px-6 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" href="/" />
        </div>

        {/* Current Portal Badge */}
        <div className="px-6 py-3 border-b border-slate-100/60 bg-slate-50/50 flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${roleLabels[role].color}`}>
            {roleLabels[role].title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Bio & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.full_name || 'User'}
                className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name || 'Demo User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || user?.phone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="lg:hidden">
              <BrandLogo size="sm" href="/" />
            </div>
            <div className="hidden sm:flex items-center text-xs text-slate-500 gap-1.5 font-medium">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <span>/</span>
              <span className="capitalize font-semibold text-slate-900">{role} Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tutors"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Browse Tutors</span>
            </Link>

            <button
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.full_name || 'User'}
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                {user?.full_name?.split(' ')[0] || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 bg-white h-full flex flex-col z-10 shadow-xl">
              <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
                <BrandLogo size="sm" href="/" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-rose-600 bg-rose-50 rounded-lg font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};
