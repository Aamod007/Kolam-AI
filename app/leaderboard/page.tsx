'use client'
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LeaderboardUser {
  id: string;
  username: string;
  profile_image_url: string;
  kolam_karma: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Responsive top 3 order
  const [topOrder, setTopOrder] = useState([1, 0, 2]);
  useEffect(() => {
    function handleResize() {
      setTopOrder(window.innerWidth < 768 ? [0, 1, 2] : [1, 0, 2]);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Navbar />
      <main className="container py-10 relative">
        {/* Heritage background pattern (optional, can remove if needed) */}
        {/* <div className="absolute inset-0 -z-10 bg-[url('/kolam.png')] bg-repeat opacity-20 pointer-events-none" /> */}
        <h1
          className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-8 text-center tracking-widest uppercase max-w-full break-words mx-auto"
          style={{
            background: 'linear-gradient(90deg, #FFD700 0%, #FF9800 40%, #fff 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 12px #FFD700, 0 0 32px #FF9800, 0 0 2px #fff',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.15em'
          }}
        >
          Kolam Leaderboard
        </h1>
        <div className="rounded-3xl border-4 border-yellow-700 bg-gradient-to-br from-[#fff8e1] to-[#ffe4b5] p-3 sm:p-6 md:p-10 shadow-2xl relative overflow-hidden w-full max-w-full">
          {/* Kolam motif background */}
          <div className="absolute inset-0 pointer-events-none opacity-15 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
          {leaderboard.length === 0 && <div className="text-yellow-900 text-lg font-semibold">No leaderboard data.</div>}
          {/* Top 3 users row */}
          {leaderboard.length > 0 && (
            <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mb-10 w-full">
              {topOrder.map((pos, i) => {
                const user = leaderboard[pos];
                if (!user) return null;
                const rankColors = [
                  'from-[#FFD700] to-[#FFB300]', // Gold
                  'from-[#C0C0C0] to-[#A9A9A9]', // Silver
                  'from-[#CD7F32] to-[#B87333]'  // Bronze
                ];
                // Simple rank icon for top 1, number for others
                const icon = pos === 0 ? (
                  <span className="text-3xl font-bold text-yellow-700">★</span>
                ) : (
                  <span className="text-lg font-bold text-yellow-700">{pos + 1}</span>
                );
                const avatarSize = pos === 0 ? 104 : 80;
                return (
                  <div key={user.id} className={`flex flex-col items-center ${pos === 0 ? 'scale-110 z-10' : 'scale-95'} transition-all duration-300 w-full md:w-auto break-words`}>
                    <div className={`relative mb-2`} style={{ width: avatarSize, height: avatarSize }}>
                      <div className={`w-full h-full rounded-full border-4 border-yellow-700 shadow-xl bg-gradient-to-br ${rankColors[i]} flex items-center justify-center`}>
                        <Image
                          src={user.profile_image_url ? user.profile_image_url : '/default-profile.png'}
                          alt="Profile"
                          width={avatarSize}
                          height={avatarSize}
                          className={`rounded-full object-cover w-full h-full border-2 border-[#8B0000]`}
                        />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2">{icon}</span>
                    </div>
                    <a
                      href={`/profile/${user.id}`}
                      className="font-bold text-base sm:text-lg md:text-xl text-[#8B0000] drop-shadow transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg hover:text-yellow-700 cursor-pointer font-serif max-w-full text-center break-words"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {user.username}
                    </a>
                    <span className="text-yellow-700 font-bold text-sm sm:text-base md:text-lg flex items-center gap-1 font-serif max-w-full text-center break-words">{user.kolam_karma} Karma</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Rest of leaderboard in two columns */}
          {leaderboard.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 w-full">
              {leaderboard.slice(3).map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 sm:gap-3 md:gap-5 px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 rounded-xl shadow-lg bg-gradient-to-r from-[#fff8e1] to-[#ffe4b5] border-2 border-yellow-700 relative w-full max-w-full overflow-hidden"
                >
                  <span className="font-extrabold text-base sm:text-lg md:text-2xl text-[#8B0000] font-serif">#{idx + 4}</span>
                  <Image
                    src={user.profile_image_url ? user.profile_image_url : '/default-profile.png'}
                    alt="Profile"
                    width={44}
                    height={44}
                    className="h-10 w-10 sm:h-11 sm:w-11 md:h-14 md:w-14 rounded-full border-2 border-yellow-700 shadow-md object-cover bg-[#fff8e1]"
                  />
                  <a
                    href={`/profile/${user.id}`}
                    className="font-semibold text-sm sm:text-lg md:text-xl text-[#8B0000] drop-shadow transition-transform duration-200 hover:scale-110 hover:drop-shadow-lg hover:text-yellow-700 cursor-pointer font-serif max-w-full text-center break-words"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {user.username}
                  </a>
                  <span className="ml-auto text-yellow-700 font-bold text-xs sm:text-base md:text-lg flex items-center gap-1 font-serif max-w-full text-center break-words">
                    {user.kolam_karma} Karma
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
