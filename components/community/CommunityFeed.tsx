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
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-xl font-bold mb-4">Community Feed</h2>
        {posts.length === 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center text-muted-foreground">No posts yet.</div>
        )}
        {posts.map(post => (
          <div key={post.id} className="rounded-xl border bg-card p-4 mb-6">
            <Image src={post.image_url} alt="Kolam" width={640} height={320} className="w-full max-h-64 object-contain rounded" />
            <div className="mt-2 flex items-center gap-2">
              <Link href={`/profile/${post.profiles?.id}`} className="flex items-center gap-2">
                <Image src={post.profiles?.profile_image_url || '/default-profile.png'} alt="Profile" width={32} height={32} className="h-8 w-8 rounded-full border" />
                <span className="font-semibold hover:underline">{post.profiles?.username}</span>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground mt-1 mb-2">{post.description}</div>
            <div className="flex gap-2 mb-2 items-center">
              <Button size="sm" onClick={() => handleLike(post.id)}>Like</Button>
              <span className="text-xs text-teal-700 font-bold">{likes[post.id] || 0} Likes</span>
              <Button size="sm" variant="outline" asChild>
                <a href={post.image_url} download>Download</a>
              </Button>
            </div>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText[post.id] || ""}
                onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
                className="border rounded px-2 py-1 w-full mb-1 text-gray-900 bg-white"
              />
              <Button size="sm" onClick={() => handleComment(post.id)}>Comment</Button>
            </div>
            <div className="mt-2">
              {comments[post.id]?.length > 0 && (
                <div className="bg-muted/10 rounded p-2">
                  {comments[post.id].map((c, i) => (
                    <div key={i} className="text-xs text-gray-700 mb-1"><span className="font-semibold text-teal-800">{c.username}:</span> {c.text}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
  {/* Leaderboard removed from feed. See Leaderboard page/component. */}
    </div>
  );
}
