import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tutorplug.com'),
  title: 'Tutor Plug — Learn Better. Teach Better.',
  description:
    'Venture-grade online tutoring platform connecting ambitious students with verified expert tutors for 1-on-1 personalized learning.',
  icons: {
    icon: '/brand/tutorplug-logo.png',
  },
  openGraph: {
    title: 'Tutor Plug — Learn Better. Teach Better.',
    description: 'Find verified 1-on-1 tutors across CBSE, ICSE, IB & Competitive exams.',
    images: ['/brand/tutorplug-logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
