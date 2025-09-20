"use client"
import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import Image from "next/image";
import { useParams } from "next/navigation";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      setProfile(user);
      const { data: userPosts } = await supabase
        .from('community_posts')
        .select('id, image_url, description, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      setPosts(userPosts || []);
      setLoading(false);
    }
    if (id) fetchUserProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 font-display">
      <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-8 shadow-xl aspect-[16/10] grid place-items-center text-cyan-700 font-medium">
        Loading profile…
      </div>
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 font-display">
      <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-8 shadow-xl aspect-[16/10] grid place-items-center text-cyan-700 font-medium">
        User not found.
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 font-display">
      <div className="max-w-2xl mx-auto">
        <button
          className="mb-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white font-bold shadow-lg border-2 border-cyan-300 hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

          <div className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-800 border-2 border-cyan-300 shadow-xl mb-2">
            <Image src={profile.profile_image_url || '/default-profile.png'} alt="Profile" width={80} height={80} className="rounded-full border-4 border-cyan-300 bg-gradient-to-br from-cyan-100/80 to-blue-100/80 shadow-lg" />
            <div className="flex flex-col">
              <div className="text-2xl font-bold text-cyan-100 drop-shadow font-serif">{profile.username}</div>
              <div className="text-cyan-200 font-semibold font-serif">{profile.kolam_karma} Kolam Karma</div>
              {profile.description && (
                <div className="mt-2 text-base text-cyan-100 font-serif font-medium opacity-80">{profile.description}</div>
              )}
            </div>
          </div>
        <h2 className="text-lg font-bold mb-4 text-cyan-700">{profile.username}&apos;s Kolam Posts</h2>
        {posts.length === 0 ? (
          <div className="rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow text-center text-cyan-700">No posts yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map(post => (
              <div key={post.id} className="rounded-xl border-2 border-cyan-300 bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-800 p-4 flex flex-col items-center shadow-lg">
                <Image src={post.image_url || '/default-kolam.png'} alt="Kolam" width={320} height={200} className="rounded-xl border-2 border-cyan-200 object-contain max-h-48 bg-white" />
                <div className="mt-2 text-sm text-cyan-200 text-center font-serif font-medium">{post.description}</div>
                <div className="mt-1 text-xs text-cyan-600">{new Date(post.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
