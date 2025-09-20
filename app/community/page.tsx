import { Navbar } from '@/components/site/navbar';
import { Button } from '@/components/ui/button';
import { CommunityFeed } from '@/components/community/CommunityFeed';

export default function CommunityHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display">
      <Navbar />
      <main className="container py-6 md:py-10 flex flex-col items-start justify-start">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-2 md:px-6 lg:px-8 xl:px-12">
          <div className="mb-8 text-left">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-muted-foreground drop-shadow-xl mb-2 tracking-tight leading-tight">
              Kolam Community Hub 🪄
            </h1>
            <p className="text-base md:text-lg text-white/80 font-display mb-2 drop-shadow">Share your Kolam designs, upvote, comment, and download SVG/PNG.</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 border border-cyan-300 text-gray-800 p-4 md:p-5 rounded-2xl mb-6 shadow flex flex-col items-start">
            <span className="text-sm md:text-base font-semibold font-display tracking-tight mb-1">Join the community and showcase your creativity!</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6 mb-6 border">
            <div className="bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-cyan-950 dark:to-blue-950 rounded-2xl shadow-xl p-4 md:p-6 border border-cyan-200">
              {/* TODO: Feed, post modal, leaderboard, profile links, etc. */}
              <CommunityFeed />
            </div>
          </div>
        </div>
      </main>
      {/* Footer is now handled globally in layout.tsx */}
    </div>
  );
}
