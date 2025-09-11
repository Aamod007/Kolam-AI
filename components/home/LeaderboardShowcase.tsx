'use client'
import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function LeaderboardShowcase() {
  const [posts, setPosts] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const [topUser, setTopUser] = useState<any>(null);
  useEffect(() => {
    async function fetchTopPosts() {
      // Get top user from leaderboard
      const { data: leaderboard } = await supabase
        .from('kolam_leaderboard')
        .select('*')
        .order('kolam_karma', { ascending: false })
        .limit(1);
      if (!leaderboard || leaderboard.length === 0) return setLoading(false);
      setTopUser(leaderboard[0]);
      // Get their posts
      const { data: userPosts } = await supabase
        .from('community_posts')
        .select('image_url, description')
        .eq('user_id', leaderboard[0].id)
        .order('created_at', { ascending: false });
      setPosts(userPosts || []);
      setLoading(false);
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
    <div className="rounded-2xl border bg-card p-6 shadow-sm aspect-[16/10] grid place-items-center text-muted-foreground font-medium">
      Loading top Kolam creator…
    </div>
  );
  if (!posts.length) return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm aspect-[16/10] grid place-items-center text-muted-foreground font-medium">
      Beautiful Kolam patterns, reimagined with AI
    </div>
  );
  const post = posts[current];
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm aspect-[16/10] flex flex-col items-center justify-center">
      <div className="mb-2 text-teal-700 font-bold text-lg">Promoting our Kolam Toppers!</div>
      {topUser && (
        <div className="flex items-center gap-3 mb-2">
          <Image src={topUser.profile_image_url} alt="Profile" width={40} height={40} className="h-10 w-10 rounded-full border" />
          <span className="font-semibold text-teal-900">{topUser.username}</span>
          <span className="text-yellow-700 font-bold">{topUser.kolam_karma} Karma</span>
        </div>
      )}
      <div className="w-full overflow-hidden" style={{ minHeight: 250, maxWidth: 400 }}>
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {posts.map((p, idx) => (
            <div key={idx} className="flex-shrink-0 w-[400px] flex justify-center items-center">
              <Image src={p.image_url} alt="Kolam" width={400} height={250} className="rounded-xl border object-contain max-h-56" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-muted-foreground text-center text-sm max-w-xl">{post.description}</div>
    </div>
  );
}
