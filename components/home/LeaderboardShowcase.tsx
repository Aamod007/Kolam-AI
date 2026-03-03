'use client'
import React, { useEffect, useState } from "react";
import Image from "next/image";

export function LeaderboardShowcase() {
  const [posts, setPosts] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [topUser, setTopUser] = useState<any>(null);
  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) return setLoading(false);
        const leaderboard = await res.json();
        if (!leaderboard || leaderboard.length === 0) return setLoading(false);
        setTopUser(leaderboard[0]);

        const postsRes = await fetch(`/api/user/${leaderboard[0].id}/posts`);
        if (postsRes.ok) {
          setPosts(await postsRes.json() || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 1) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % posts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [posts]);

  if (loading) return (
    <div className="outer flex items-center justify-center">
      <div className="dot"></div>
      <div className="card flex items-center justify-center">
        <div className="ray"></div>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="text-muted-foreground font-medium">Loading top Kolam creator…</span>
        </div>
      </div>
    </div>
  );
  if (!posts.length) return (
    <div className="outer flex items-center justify-center">
      <div className="dot"></div>
      <div className="card flex items-center justify-center">
        <div className="ray"></div>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <span className="text-muted-foreground font-medium">Beautiful Kolam patterns, reimagined with AI</span>
        </div>
      </div>
    </div>
  );
  const post = posts[current];
  return (
    <div
      className="outer flex items-center justify-center"
      style={{
        width: '100%',
        maxWidth: 640,
        minWidth: 320,
        height: 480,
        minHeight: 400,
        maxHeight: 480,
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
        border: '24px solid transparent',
        borderImage: 'url(/border.png) 24 round',
        boxShadow: '0 0 32px 0 #000a',
        borderRadius: '32px',
      }}
    >
      <div className="dot"></div>
      <div
        className="card flex items-center justify-center"
        style={{
          width: '100%',
          height: '100%',
          minWidth: 320,
          minHeight: 400,
          maxWidth: 640,
          maxHeight: 480,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '2rem 1.5rem',
          background: 'rgba(0,0,0,0.85)',
          borderRadius: '24px',
          boxShadow: '0 0 24px 0 #000a',
        }}
      >
        <div className="ray"></div>
        <div className="w-full flex flex-col items-center justify-start" style={{ zIndex: 2 }}>
          <div className="mb-2 text-left w-full flex items-center gap-2">
            <span
              className="block text-2xl md:text-3xl font-extrabold text-white tracking-tight font-serif md:font-display"
              style={{ letterSpacing: '0.03em', lineHeight: 1.1, textShadow: '0 2px 8px #000a' }}
            >
              Kolam Topper Spotlight
            </span>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow" style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>
              <defs>
                <linearGradient id="trophyGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
              <ellipse cx="32" cy="60" rx="16" ry="4" fill="#d4af37" opacity="0.3" />
              <path d="M16 8v12c0 8.837 7.163 16 16 16s16-7.163 16-16V8H16z" fill="url(#trophyGold)" stroke="#bfa335" strokeWidth="2" />
              <rect x="24" y="36" width="16" height="8" rx="4" fill="#bfa335" />
              <rect x="28" y="44" width="8" height="10" rx="4" fill="#FFD700" />
              <circle cx="32" cy="8" r="6" fill="#fff8dc" stroke="#bfa335" strokeWidth="2" />
              <path d="M16 8c-6 0-8 6-8 10s2 10 8 10" stroke="#bfa335" strokeWidth="2" fill="none" />
              <path d="M48 8c6 0 8 6 8 10s-2 10-8 10" stroke="#bfa335" strokeWidth="2" fill="none" />
            </svg>
          </div>
          {topUser && (
            <div
              className="flex flex-row items-center gap-2 mb-2 justify-start px-0 py-0 shadow profile-spotlight-mobile"
              style={{
                background: '#260617',
                border: 'none',
                boxShadow: '0 2px 12px 0 #000a',
                width: 'calc(100% + 48px)',
                minWidth: 0,
                maxWidth: 'none',
                borderRadius: 0,
                marginLeft: '-24px',
                marginRight: '-24px',
              }}
            >
              <style jsx>{`
                @media (max-width: 600px) {
                  .profile-spotlight-mobile,
                  .description-spotlight-mobile {
                    width: 100% !important;
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                  }
                }
              `}</style>
              <Image src={topUser.profile_image_url} alt="Profile" width={40} height={40} className="h-10 w-10 rounded-full border border-yellow-300 shadow object-cover" />
              <div className="flex flex-col items-start justify-center ml-2">
                <span className="font-semibold text-base text-white drop-shadow-sm mb-0.5 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">{topUser.username}</span>
                <span className="text-yellow-300 font-bold text-xs px-2 py-0.5 rounded bg-gray-900/60 border border-yellow-300 shadow">{topUser.kolam_karma} Karma</span>
              </div>
              <span className="ml-4 text-xs md:text-sm text-teal-200 font-medium whitespace-nowrap">Celebrating creativity &amp; skill</span>
            </div>
          )}
          <div className="w-full flex justify-center items-center overflow-x-hidden" style={{ margin: '0 auto', marginTop: 8, maxWidth: 400, minHeight: 120, maxHeight: 220 }}>
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ width: '100%', maxWidth: 320, minWidth: 200, transform: `translateX(-${current * 100}%)` }}
            >
              {posts.map((p, idx) => (
                <div key={idx} className="flex-shrink-0 w-full max-w-[320px] flex justify-center items-center">
                  {p.image_url ? (
                    <Image src={p.image_url} alt="Kolam" width={320} height={160} className="rounded-xl border object-contain max-h-40 bg-black" style={{ background: '#222', width: '100%', height: 'auto', maxWidth: 320, maxHeight: 160, border: '2px solid #bfa335', boxShadow: '0 2px 12px 0 #000a' }} />
                  ) : (
                    <div className="rounded-xl border bg-black flex items-center justify-center" style={{ width: '100%', maxWidth: 320, height: 160, color: '#fff', border: '2px solid #bfa335', boxShadow: '0 2px 12px 0 #000a' }}>
                      No image
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            className="mt-2 text-center text-xs md:text-base w-full description-spotlight-mobile"
            style={{
              color: '#e0e0e0',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              width: 'calc(100% + 48px)',
              minWidth: 0,
              maxWidth: 'none',
              background: 'rgba(38,6,23,0.85)',
              borderRadius: 0,
              padding: '16px 0',
              marginTop: '16px',
              marginBottom: '60px',
              boxShadow: '0 2px 12px 0 #000a',
              border: 'none',
              marginLeft: '-24px',
              marginRight: '-24px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              maxHeight: '120px',
            }}
          >
            {post.description}
          </div>
        </div>
        <div className="line topl" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,rgba(191,163,53,0.7),rgba(38,6,23,0.1) 80%)', zIndex: 1 }}></div>
        <div className="line leftl" style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'linear-gradient(180deg,rgba(191,163,53,0.7),rgba(38,6,23,0.1) 80%)', zIndex: 1 }}></div>
        <div className="line bottoml" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg,rgba(191,163,53,0.7),rgba(38,6,23,0.1) 80%)', zIndex: 1 }}></div>
        <div className="line rightl" style={{ position: 'absolute', top: 0, right: 0, width: '2px', height: '100%', background: 'linear-gradient(180deg,rgba(191,163,53,0.7),rgba(38,6,23,0.1) 80%)', zIndex: 1 }}></div>
      </div>
    </div>
  );
}
