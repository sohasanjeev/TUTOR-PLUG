import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/server-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const subject = searchParams.get('subject') || '';
    const board = searchParams.get('board') || '';
    const classLevel = searchParams.get('class_level') || '';
    const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : null;

    // Only real verified educators are visible to public students in search and listings
    let tutors = serverDB.getTutors().filter((t) => t.verification_status === 'verified');

    if (search) {
      tutors = tutors.filter((t) => {
        const name = t.user?.full_name?.toLowerCase() || '';
        const bio = t.bio?.toLowerCase() || '';
        const headline = t.headline?.toLowerCase() || '';
        const subjects = t.subjects?.map((s) => s.name.toLowerCase()).join(' ') || '';
        return (
          name.includes(search) ||
          bio.includes(search) ||
          headline.includes(search) ||
          subjects.includes(search)
        );
      });
    }

    if (subject) {
      tutors = tutors.filter((t) =>
        t.subjects?.some((s) => s.id === subject || s.name === subject || s.slug === subject)
      );
    }

    if (board) {
      tutors = tutors.filter((t) =>
        t.boards?.some((b) => b.id === board || b.name === board)
      );
    }

    if (maxPrice) {
      tutors = tutors.filter((t) => t.hourly_rate <= maxPrice);
    }

    return NextResponse.json({
      success: true,
      tutors,
      total: tutors.length,
    });
  } catch (error) {
    console.error('Tutors API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
