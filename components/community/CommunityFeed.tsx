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
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, Array<{username: string, text: string}>>>({});

  useEffect(() => {
    async function fetchAll() {
      // Posts
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('*, profiles(username, profile_image_url, id)')
        .order('created_at', { ascending: false });
      setPosts((postsData as Post[]) || []);
      // Likes
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id');
      const likesMap: Record<string, number> = {};
      (likesData || []).forEach((l: any) => {
        likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1;
      });
      setLikes(likesMap);
      // Comments
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('post_id, comment, profiles(username)')
        .order('created_at', { ascending: true });
      const commentsMap: Record<string, Array<{username: string, text: string}>> = {};
      (commentsData || []).forEach((c: any) => {
        if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
        commentsMap[c.post_id].push({ username: c.profiles?.username || "Anonymous", text: c.comment });
      });
      setComments(commentsMap);
      // User
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) setUser({ id: data.user.id });
    }
    fetchAll();
  }, []);

  async function handleLike(postId: string) {
    if (!user) return alert('Login required');
    await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    // Refresh likes
    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id');
    const likesMap: Record<string, number> = {};
    (likesData || []).forEach((l: any) => {
      likesMap[l.post_id] = (likesMap[l.post_id] || 0) + 1;
    });
    setLikes(likesMap);
  }

  async function handleComment(postId: string) {
    if (!user) return alert('Login required');
    const text = commentText[postId];
    if (!text) return;
    await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, comment: text });
    setCommentText({ ...commentText, [postId]: "" });
    // Refresh comments
    const { data: commentsData } = await supabase
      .from('post_comments')
      .select('post_id, comment, profiles(username)')
      .order('created_at', { ascending: true });
    const commentsMap: Record<string, Array<{username: string, text: string}>> = {};
    (commentsData || []).forEach((c: any) => {
      if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
      commentsMap[c.post_id].push({ username: c.profiles?.username || "Anonymous", text: c.comment });
    });
    setComments(commentsMap);
  }

  return (
  <div className="w-full max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24">
      <h2 className="text-2xl md:text-3xl font-bold font-serif text-muted-foreground drop-shadow mb-6 text-center">Community Feed</h2>
      {posts.length === 0 && (
        <div className="rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 p-6 shadow text-center text-muted-foreground">No posts yet.</div>
      )}
      {posts.map(post => (
        <div key={post.id} className="rounded-2xl border bg-white dark:bg-gray-900 p-3 sm:p-5 md:p-8 lg:p-10 mb-6 sm:mb-8 shadow-xl max-w-full">
          <Image src={post.image_url} alt="Kolam" width={640} height={320} className="w-full max-h-64 object-contain rounded-xl border-2 border-cyan-200" />
          <div className="mt-3 flex items-center gap-3">
            <Link href={`/profile/${post.profiles?.id}`} className="flex items-center gap-2">
              <Image src={post.profiles?.profile_image_url || '/default-profile.png'} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-cyan-300" />
              <span className="font-semibold hover:underline text-cyan-700">{post.profiles?.username}</span>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground mt-2 mb-3 font-display">{post.description}</div>
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105" onClick={() => handleLike(post.id)}>
              👍 Like
            </Button>
            <span className="text-xs text-teal-700 font-bold">{likes[post.id] || 0} Likes</span>
            <Button size="sm" variant="outline" className="border-cyan-300 text-cyan-700 font-semibold" asChild>
              <a href={post.image_url} download>⬇️ Download</a>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold shadow hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105" disabled={!!post.loading} onClick={async () => {
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
              className="border border-cyan-300 rounded-lg px-3 py-2 w-full mb-2 text-gray-800 dark:text-gray-100 bg-cyan-50 dark:bg-cyan-950 focus-visible:ring-2 focus-visible:ring-cyan-400 transition"
            />
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105" onClick={() => handleComment(post.id)}>
              💬 Comment
            </Button>
          </div>
          <div className="mt-2">
            {comments[post.id]?.length > 0 && (
              <div className="bg-cyan-50 dark:bg-cyan-950 rounded-xl p-2 border border-cyan-100 dark:border-cyan-900">
                {comments[post.id].map((c, i) => (
                  <div key={i} className="text-xs text-gray-700 dark:text-gray-200 mb-1"><span className="font-semibold text-teal-800 dark:text-teal-300">{c.username}:</span> {c.text}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
