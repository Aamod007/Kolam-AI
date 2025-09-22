import { NextResponse } from 'next/server';

const CALENDAR_ID = 'en.indian#holiday@group.v.calendar.google.com';
const API_KEY = process.env.GEMINI_API_KEY;

export async function GET() {
  const today = new Date();
  const nextYear = new Date(today.getFullYear() + 1, 0, 1);
  const timeMin = today.toISOString();
  const timeMax = nextYear.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch events');
    const data = await res.json();
    // Filter for major festivals
    const festivals = data.items.filter((event: any) => {
      const name = event.summary.toLowerCase();
      return (
        name.includes('diwali') ||
        name.includes('pongal') ||
        name.includes('onam') ||
        name.includes('holi') ||
        name.includes('navratri') ||
        name.includes('eid') ||
        name.includes('christmas')
      );
    });
    return NextResponse.json({ festivals });
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
