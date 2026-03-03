"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userRes = await fetch(`/api/user/${id}`);
        if (userRes.ok) setProfile(await userRes.json());
        const postsRes = await fetch(`/api/user/${id}/posts`);
        if (postsRes.ok) setPosts(await postsRes.json() || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchUserProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-display">
      <div className="rounded-2xl border-2 border-yellow-600 bg-white/95 dark:bg-yellow-900/90 p-8 shadow-xl aspect-[16/10] grid place-items-center text-yellow-700 dark:text-yellow-200 font-bold">
        Loading profile…
      </div>
    </div>
  );
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center font-display">
      <div className="rounded-2xl border-2 border-yellow-600 bg-white/95 dark:bg-yellow-900/90 p-8 shadow-xl aspect-[16/10] grid place-items-center text-yellow-700 dark:text-yellow-200 font-bold">
        User not found.
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 font-display">
      <div className="max-w-2xl mx-auto">
        <button
          className="mb-4 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-800 text-white font-extrabold shadow-lg border-2 border-yellow-600 hover:from-yellow-800 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>

        <div className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-700 border-2 border-yellow-600 shadow-xl mb-2">
          <Image src={profile.profile_image_url || '/default-profile.png'} alt="Profile" width={80} height={80} className="rounded-full border-4 border-yellow-600 bg-gradient-to-br from-yellow-100/80 to-yellow-300/80 shadow-lg" />
          <div className="flex flex-col">
            <div className="text-2xl font-extrabold text-yellow-100 drop-shadow-lg font-serif">{profile.username}</div>
            <div className="text-yellow-200 font-bold font-serif">{profile.kolam_karma} Kolam Karma</div>
            {profile.description && (
              <div className="mt-2 text-base text-yellow-100 font-serif font-medium opacity-90">{profile.description}</div>
            )}
          </div>
        </div>
        <h2 className="text-lg font-extrabold mb-4 text-yellow-700 dark:text-yellow-200">{profile.username}&apos;s Kolam Posts</h2>
        {posts.length === 0 ? (
          <div className="rounded-xl border-2 border-yellow-600 bg-white/95 dark:bg-yellow-900/90 p-6 shadow text-center text-yellow-700 dark:text-yellow-200">No posts yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map(post => (
              <div key={post.id} className="rounded-xl border-2 border-yellow-600 bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-700 p-4 flex flex-col items-center shadow-lg">
                <Image src={post.image_url || '/default-kolam.png'} alt="Kolam" width={320} height={200} className="rounded-xl border-2 border-yellow-300 object-contain max-h-48 bg-white" />
                <div className="mt-2 text-sm text-yellow-100 text-center font-serif font-medium">{post.description}</div>
                <div className="mt-1 text-xs text-yellow-300">{new Date(post.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
