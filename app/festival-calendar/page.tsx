import FestivalCalendar from '@/components/site/FestivalCalendar';

export default function FestivalCalendarPage() {
  return (
    <main className="container py-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-pink-600">Festival Special Kolams Calendar</h1>
      <FestivalCalendar />
    </main>
  );
}
