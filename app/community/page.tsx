import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Button } from '@/components/ui/button';

import { CommunityFeed } from '@/components/community/CommunityFeed';

export default function CommunityHubPage() {
  return (
    <div>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Kolam Community Hub</h1>
        <p className="text-muted-foreground mb-6">Share your Kolam designs, upvote, comment, and download SVG/PNG. Leaderboard and profiles coming soon.</p>
        {/* TODO: Feed, post modal, leaderboard, profile links, etc. */}
  <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
}
