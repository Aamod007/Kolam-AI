'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Type definitions
interface Profile {
  id: string;
  username: string;
  profile_image_url: string;
  kolam_karma: number;
}

interface Post {
  id: string;
  image_url: string;
  description: string;
  profiles?: Profile;
  loading?: boolean;
}

interface LeaderboardUser {
  id: string;
  username: string;
  profile_image_url: string;
  kolam_karma: number;
}

interface User {
  id: string;
}
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, Array<{ username: string, text: string }>>>({});
  const { data: session } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/api/community-feed');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setLikes(data.likesMap || {});
          setComments(data.commentsMap || {});
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAll();
  }, []);

  async function handleLike(postId: string) {
    if (!user?.id) return alert('Login required');
    const res = await fetch('/api/community-feed/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.likesMap) setLikes(data.likesMap);
    }
  }

  async function handleComment(postId: string) {
    if (!user?.id) return alert('Login required');
    const text = commentText[postId];
    if (!text) return;
    const res = await fetch('/api/community-feed/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, comment: text })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.commentsMap) setComments(data.commentsMap);
      setCommentText({ ...commentText, [postId]: "" });
    }
  }

  return (
    <div className="w-full max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24">
      <h2 className="text-3xl md:text-4xl font-extrabold font-serif text-[#8B0000] drop-shadow-xl mb-6 text-center tracking-wide border-b-4 border-yellow-700 pb-2" style={{ fontFamily: 'Georgia, serif' }}>Kolam Community Feed 🪔</h2>
      {posts.length === 0 && (
        <div className="rounded-3xl border-2 border-yellow-700 bg-[#fff8e1]/90 p-6 shadow-xl text-center text-[#8B0000] font-serif">No posts yet.</div>
      )}
      {posts.map(post => (
        <div key={post.id} className="rounded-3xl border-2 border-yellow-700 bg-gradient-to-br from-[#fff8e1] via-[#ffe4b5] to-[#ffd700] p-3 sm:p-5 md:p-8 lg:p-10 mb-6 sm:mb-8 shadow-2xl max-w-full relative overflow-hidden">
          {/* Kolam motif overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" />
          <Image src={post.image_url} alt="Kolam" width={640} height={320} className="w-full max-h-64 object-contain rounded-xl border-4 border-yellow-700 shadow" />
          <div className="mt-3 flex items-center gap-3">
            <Link href={`/profile/${post.profiles?.id}`} className="flex items-center gap-2">
              <Image src={post.profiles?.profile_image_url || '/default-profile.png'} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-yellow-700" />
              <span className="font-bold font-serif text-[#8B0000] hover:underline" style={{ fontFamily: 'Georgia, serif' }}>{post.profiles?.username}</span>
            </Link>
          </div>
          <div className="text-base text-[#4B2E05] mt-2 mb-3 font-serif drop-shadow" style={{ fontFamily: 'Georgia, serif' }}>{post.description}</div>
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-[#8B0000] text-white font-bold shadow hover:from-yellow-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 border-2 border-yellow-700">
              <span onClick={() => handleLike(post.id)}>👍 Like</span>
            </Button>
            <span className="text-xs text-yellow-900 font-bold font-serif">{likes[post.id] || 0} Likes</span>
            <Button size="sm" variant="outline" className="border-yellow-700 text-[#8B0000] font-semibold font-serif" asChild>
              <a href={post.image_url} download>⬇️ Download</a>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-yellow-700 to-indigo-700 text-white font-bold shadow hover:from-yellow-800 hover:to-indigo-900 transition-all duration-200 transform hover:scale-105 border-2 border-yellow-700" disabled={!!post.loading} onClick={async () => {
              setPosts(posts => posts.map(p => p.id === post.id ? { ...p, loading: true } : p));
              try {
                // Fetch image and send to remove.bg API
                const imgRes = await fetch(post.image_url);
                const imgBlob = await imgRes.blob();
                const formData = new FormData();
                formData.append('file', imgBlob, 'kolam.png');
                const res = await fetch('/api/removebackground', {
                  method: 'POST',
                  body: formData,
                });
                if (!res.ok) {
                  alert('Background removal failed.');
                  setPosts(posts => posts.map(p => p.id === post.id ? { ...p, loading: false } : p));
                  return;
                }
                const arBlob = await res.blob();
                // Convert blob to base64 data URL
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64Url = reader.result as string;
                  sessionStorage.setItem('kolam_ar_image', base64Url);
                  window.location.href = '/ar-designer?from=community';
                };
                reader.readAsDataURL(arBlob);
              } catch (err) {
                alert('Failed to prepare AR visualization.');
                setPosts(posts => posts.map(p => p.id === post.id ? { ...p, loading: false } : p));
              }
            }}>
              {post.loading ? "Preparing AR…" : "🪄 Visualize in AR"}
            </Button>
          </div>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText[post.id] || ""}
              onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
              className="border-2 border-yellow-700 rounded-lg px-3 py-2 w-full mb-2 text-[#8B0000] bg-[#fff8e1] focus-visible:ring-2 focus-visible:ring-yellow-700 font-serif"
            />
            <Button size="sm" className="bg-gradient-to-r from-yellow-600 to-[#8B0000] text-white font-bold shadow hover:from-yellow-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 border-2 border-yellow-700" onClick={() => handleComment(post.id)}>
              💬 Comment
            </Button>
          </div>
          <div className="mt-2">
            {comments[post.id]?.length > 0 && (
              <div className="bg-[#fff8e1] rounded-xl p-2 border-2 border-yellow-700">
                {comments[post.id].map((c, i) => (
                  <div key={i} className="text-xs text-[#8B0000] mb-1 font-serif"><span className="font-bold text-yellow-900">{c.username}:</span> {c.text}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
