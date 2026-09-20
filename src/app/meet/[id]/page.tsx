'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Loader2 } from 'lucide-react';

export default function MeetRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const meetingCode = (params?.id as string) || '';

  useEffect(() => {
    if (meetingCode) {
      router.replace(`/classroom/${encodeURIComponent(meetingCode)}`);
    }
  }, [meetingCode, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
      <div className="text-center space-y-4">
        <BrandLogo size="lg" theme="dark" href="/" />
        <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm font-semibold pt-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Connecting to Tutor Plug Secure Classroom {meetingCode}...</span>
        </div>
      </div>
    </div>
  );
}
