'use client'

import Link from 'next/link';
import { Sparkles, UserCircle } from 'lucide-react';
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
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-accent" /> Kolam Ai
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/recognition">Recognition</Link>
          <Link href="/about">About</Link>
          <a href="https://vercel.com" target="_blank" rel="noreferrer" className="hidden sm:inline">Deploy</a>
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
