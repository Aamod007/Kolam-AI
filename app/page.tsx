'use client'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ComingSoonCard } from '@/components/site/coming-soon-card'
import { Button } from '@/components/ui/button'
import { FeedbackFloating } from '@/components/site/feedback'
import { ImagePlus, Boxes, BookOpen, Users, ShieldCheck, Sparkle } from 'lucide-react'
import { LeaderboardShowcase } from '@/components/home/LeaderboardShowcase';
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main className="container py-12">
        <section className="grid gap-6 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Kolam Ai: Digitizing heritage with Ai & Ar
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Upload a Kolam, and our AI reveals its dot grid, symmetry and style. Explore a creative future for this timeless art.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/recognition">Try Kolam Recognition</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#roadmap">Roadmap</a>
              </Button>
            </div>
          </div>
          <LeaderboardShowcase />
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Kolam Recognition</h3>
            <p className="text-sm text-muted-foreground">Working MVP – upload a Kolam image, get AI analysis.</p>
            <div className="mt-4"><Button asChild><Link href="/recognition">Open</Link></Button></div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">AI Kolam Generator</h3>
            <p className="text-sm text-muted-foreground">Create new Kolam patterns from a style prompt.</p>
            <div className="mt-4"><Button asChild><Link href="/creation">Open</Link></Button></div>
          </div>



          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Kolam Community Hub</h3>
            <p className="text-sm text-muted-foreground">Share designs, upvote, download SVG/PNG.</p>
            <div className="mt-4"><Button asChild><Link href="/community">Open</Link></Button></div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center">
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300/80 to-yellow-500/80 shadow-lg border-2 border-yellow-400/60 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-6 h-6 text-yellow-700 drop-shadow"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            </span>
            <h3 className="text-lg font-semibold mb-1">Kolam Leaderboard</h3>
            <p className="text-sm text-muted-foreground text-center">See top creators by Kolam Karma.</p>
            <div className="mt-4"><Button asChild><Link href="/leaderboard">View Leaderboard</Link></Button></div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center">
            <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-300/80 to-blue-500/80 shadow-lg border-2 border-blue-400/60 mb-2">
              <ImagePlus className="h-5 w-5 text-blue-700" />
            </span>
            <h3 className="text-lg font-semibold mb-1">AR Kolam Designer</h3>
            <p className="text-sm text-muted-foreground text-center">Place Kolams in real-world AR using your phone camera.</p>
            <div className="mt-4"><Button asChild><Link href="/ar-designer">Try AR Designer</Link></Button></div>
          </div>
          <ComingSoonCard title="Kolam Heritage Explorer" description="History and cultural significance of Kolams." icon={<BookOpen className="h-5 w-5" />} />
          <ComingSoonCard title="Secure Kolam Auth" description="NFT/Blockchain proof of originality." icon={<ShieldCheck className="h-5 w-5" />} />
        </section>

        <section id="roadmap" className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Roadmap</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/15 grid place-items-center text-primary">1</div>
              <div>
                <h4 className="font-semibold">MVP: Kolam Recognition</h4>
                <p className="text-sm text-muted-foreground">Upload, analyze, visualize results. Done.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-80">
              <div className="h-8 w-8 rounded-full bg-accent grid place-items-center">2</div>
              <div>
                <h4 className="font-semibold">AR Designer & Generator</h4>
                <p className="text-sm text-muted-foreground">Create and place Kolams in AR; AI-generated patterns.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 opacity-80">
              <div className="h-8 w-8 rounded-full bg-accent grid place-items-center">3</div>
              <div>
                <h4 className="font-semibold">Community & Heritage</h4>
                <p className="text-sm text-muted-foreground">Share, vote, learn. Secure originality with blockchain.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FeedbackFloating />
    </div>
  )
}
