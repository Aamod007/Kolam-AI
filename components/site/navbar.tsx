'use client'

import Link from 'next/link';
import { Sparkles, UserCircle, Trophy, Lock, Microscope } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Navbar() {
  const { user } = useAuth() || {};
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('profile_image_url')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfileImageUrl(data?.profile_image_url || null);
        });
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-2 font-bold text-lg sm:text-xl tracking-tight sm:tracking-normal mx-auto sm:mx-0"
          style={{ minWidth: 0 }}
        >
          <Sparkles className="h-6 w-6 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
          <span className="block whitespace-nowrap leading-none">Kolam <span className="font-extrabold">Ai</span></span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/recognition" className="flex items-center gap-1">
            <span className="sm:hidden"><Microscope className="w-5 h-5" aria-label="Recognition" /></span>
            <span className="hidden sm:inline">Recognition</span>
          </Link>
          <Link href="/about">About</Link>
          <Link href="/leaderboard" title="Leaderboard" aria-label="Leaderboard">
            <span className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 shadow-lg border-2 border-yellow-400/60 cursor-pointer">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 drop-shadow" />
            </span>
          </Link>
          {user ? (
            <Link href="/profile" className="ml-4 rounded-full border-2 border-accent p-1 bg-white dark:bg-gray-900 hover:shadow-lg transition" aria-label="Profile">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-accent" />
              )}
            </Link>
          ) : (
            <Link href="/signin" className="ml-4">
              <Button>Sign In / Sign Up</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
