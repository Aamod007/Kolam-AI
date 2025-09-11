'use client'
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface LeaderboardUser {
  id: string;
  username: string;
  profile_image_url: string;
  kolam_karma: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    supabase
      .from('kolam_leaderboard')
      .select('*')
      .then(({ data }) => setLeaderboard((data as LeaderboardUser[]) || []));
  }, []);

  return (
    <div>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 shadow-lg border-2 border-yellow-400/60">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-6 h-6 text-yellow-700 drop-shadow"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
          </span>
          Kolam Leaderboard
        </h1>
        <div className="rounded-xl border bg-card p-4">
          {leaderboard.length === 0 && <div className="text-muted-foreground">No leaderboard data.</div>}
          <ul>
            {leaderboard.map((user, idx) => (
              <li key={user.id} className="flex items-center gap-2 mb-2">
                <span className="font-bold">#{idx + 1}</span>
                <Image src={user.profile_image_url ? user.profile_image_url : '/default-profile.png'} alt="Profile" width={40} height={40} className="h-10 w-10 rounded-full border" />
                <span>{user.username}</span>
                <span className="ml-auto text-yellow-700 font-semibold">{user.kolam_karma} Karma</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
