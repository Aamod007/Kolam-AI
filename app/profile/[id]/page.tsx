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
    <div className="rounded-2xl border bg-card p-6 shadow-sm aspect-[16/10] grid place-items-center text-muted-foreground font-medium">
      Loading profile…
    </div>
  );
  if (!profile) return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm aspect-[16/10] grid place-items-center text-muted-foreground font-medium">
      User not found.
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button
        className="mb-4 px-4 py-2 rounded bg-teal-100 text-teal-900 font-semibold border border-teal-300 hover:bg-teal-200"
        onClick={() => window.history.back()}
      >
        ← Back
      </button>
      <div className="flex items-center gap-4 mb-2">
        <Image src={profile.profile_image_url || '/default-profile.png'} alt="Profile" width={80} height={80} className="rounded-full border" />
        <div>
          <div className="text-2xl font-bold text-teal-900">{profile.username}</div>
          <div className="text-teal-700 font-semibold">{profile.kolam_karma} Kolam Karma</div>
        </div>
      </div>
      {profile.description && (
        <div className="mb-4 text-muted-foreground text-base">{profile.description}</div>
      )}
      <h2 className="text-lg font-bold mb-4">{profile.username}&apos;s Kolam Posts</h2>
      {posts.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 shadow-sm text-center text-muted-foreground">No posts yet.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl border bg-card p-4 flex flex-col items-center">
              <Image src={post.image_url || '/default-kolam.png'} alt="Kolam" width={320} height={200} className="rounded-xl border object-contain max-h-48" />
              <div className="mt-2 text-sm text-muted-foreground text-center">{post.description}</div>
              <div className="mt-1 text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
