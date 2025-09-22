'use client'

import Link from 'next/link';
import FestivalCalendarOverlay from './FestivalCalendarOverlay';
import { Sparkles, UserCircle, Trophy, Lock, Microscope, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Navbar() {
  const { user } = useAuth() || {};
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 font-display">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="navbar-appname flex items-center gap-1 sm:gap-2 font-bold text-lg sm:text-2xl tracking-tight sm:tracking-normal font-serif text-muted-foreground drop-shadow"
          style={{ minWidth: 0 }}
        >
          <Sparkles className="h-6 w-6 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
          <span className="block whitespace-nowrap leading-none font-serif">Kolam <span className="font-extrabold font-serif">Ai</span></span>
        </Link>
  <nav className="flex items-center gap-6 text-[1.08rem] sm:text-[1.15rem] font-serif text-muted-foreground" style={{ flex: 1, justifyContent: 'flex-end', minWidth: 0, overflowX: 'unset', flexWrap: 'wrap' }}>
          <Link href="/recognition" className="flex items-center gap-1">
            <span className="sm:hidden"><Microscope className="w-5 h-5" aria-label="Recognition" /></span>
            <span className="hidden sm:inline">Recognition</span>
          </Link>
          <Link href="/about" className="hidden sm:inline">About</Link>
          <Link href="/leaderboard" title="Leaderboard" aria-label="Leaderboard">
            <span className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 shadow-lg border-2 border-yellow-400/60 cursor-pointer">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700 drop-shadow" />
            </span>
          </Link>
         <button
           type="button"
           title="Festival Calendar"
           aria-label="Festival Calendar"
           className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-200/80 to-blue-400/80 shadow-lg border-2 border-blue-400/60 cursor-pointer"
           onClick={() => setCalendarOpen(true)}
         >
           <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 drop-shadow" />
         </button>
         <FestivalCalendarOverlay open={calendarOpen} onClose={() => setCalendarOpen(false)} />
          {user ? (
            <Link href="/profile" className="ml-2 rounded-full border-2 border-accent p-1 bg-white dark:bg-gray-900 hover:shadow-lg transition" aria-label="Profile">
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
              <Link href="/signin" className="ml-0">
                <div className="sp">
                  {/* Desktop button */}
                  <button className="sparkle-button hidden sm:flex">
                    <span className="spark"></span>
                    <span className="backdrop"></span>
                    <svg className="sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span className="text">Sign In / Sign Up</span>
                  </button>
                  {/* Mobile button */}
                  <button className="sparkle-button sm:hidden ml-[-0.3rem]">
                    <span className="spark"></span>
                    <span className="backdrop"></span>
                    <svg className="sparkle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                      <path d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <span className="text">Sign In/Sign Up</span>
                  </button>
                  <div className="bodydrop"></div>
                  <span aria-hidden="true" className="particle-pen">
                    <svg className="particle" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <svg className="particle" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <svg className="particle" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z" fill="black" stroke="black" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </span>
                </div>
              </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
