import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" theme="dark" href="/" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mt-3">
              Tutor Plug is the trusted marketplace connecting ambitious students with vetted, elite educators for personalized 1-on-1 online learning.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Verified Educators & Safe Learning Guarantee</span>
            </div>
          </div>

          {/* Col 2: For Students */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Students
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tutors" className="hover:text-white transition-colors">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/tutors?subject=mathematics" className="hover:text-white transition-colors">
                  Maths Tutors
                </Link>
              </li>
              <li>
                <Link href="/tutors?subject=physics" className="hover:text-white transition-colors">
                  Physics Tutors
                </Link>
              </li>
              <li>
                <Link href="/tutors?subject=computer-science" className="hover:text-white transition-colors">
                  Coding & CS Mentors
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Booking Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Tutors */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              For Tutors
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/become-a-tutor" className="hover:text-white transition-colors">
                  Apply to Teach
                </Link>
              </li>
              <li>
                <Link href="/become-a-tutor#earnings" className="hover:text-white transition-colors">
                  Earnings Calculator
                </Link>
              </li>
              <li>
                <Link href="/onboarding/tutor" className="hover:text-white transition-colors">
                  Tutor Onboarding
                </Link>
              </li>
              <li>
                <Link href="/tutor/dashboard" className="hover:text-white transition-colors">
                  Tutor Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/how-it-works#faq" className="hover:text-white transition-colors">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                  Trust & Safety
                </span>
              </li>
              <li>
                <Link href="/admin/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tutor Plug Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Learn Better. Teach Better.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
