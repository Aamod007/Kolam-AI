'use client'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ComingSoonCard } from '@/components/site/coming-soon-card'
import { Button } from '@/components/ui/button'
import { FeedbackFloating } from '@/components/site/feedback'
import { ImagePlus, Boxes, BookOpen, Users, ShieldCheck, Sparkle } from 'lucide-react'
import { LeaderboardShowcase } from '@/components/home/LeaderboardShowcase';
import { KolamCard } from '@/components/ui/KolamCard';
import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{position: 'relative', minHeight: '100vh', width: '100%'}}>
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/Bg.mp4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div style={{position: 'relative', zIndex: 1, width: '100%'}}>
      <Navbar />
      <main className="container py-8 flex flex-col items-center justify-center min-h-screen">
        <section className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-6 items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center text-center px-2">
            {/* Decorative Kolam SVG Motif */}
            <div className="mb-2 flex justify-center">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <circle cx="60" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <circle cx="100" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <path d="M20 20 Q40 0 60 20 Q80 40 100 20" stroke="#FFD700" strokeWidth="2" fill="none" />
              </svg>
            </div>
            {/* Hero Content Overlay for contrast */}
            <div className="rounded-2xl shadow-xl p-6 mx-auto" style={{background: 'linear-gradient(120deg, #4B1E13 80%, #FFD700 20%)', boxShadow: '0 6px 32px 0 rgba(75,30,19,0.18)', maxWidth: 700}}>
              <h1 className="text-4xl sm:text-5xl font-black" style={{fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #800000, 0 0px 24px #FFD700', letterSpacing: '0.04em'}}>
                Kolam AI: Digitizing heritage with AI & AR
              </h1>
              <div className="mt-2">
                <span style={{fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: '1.15rem', letterSpacing: '0.05em', textShadow: '0 1px 8px #800000', background: 'linear-gradient(90deg, #FFD700 60%, #800000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  मङ्गलं कल्याणम्
                </span>
              </div>
              <p className="mt-4 text-lg" style={{color: '#FFF8E1', textShadow: '0 1px 8px #800000', fontFamily: 'Merriweather, serif'}}>
                Upload a Kolam, and our AI reveals its dot grid, symmetry and style. Explore a creative future for this timeless art.
              </p>
            </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center w-full">
                <style jsx>{`
                  .kolam-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.3rem;
                    background: #3a0a2a;
                    color: #ffd700;
                    border: 2px solid #bfa335;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 1rem;
                    padding: 0.5rem 1rem;
                    box-shadow: 0 2px 8px #000a;
                    transition: box-shadow 0.2s, background 0.2s;
                  }
                  .kolam-btn:hover {
                    background: #4c113a;
                    box-shadow: 0 4px 16px #000a;
                  }
                  .kolam-btn .icon {
                    display: flex;
                    align-items: center;
                    font-size: 1.2em;
                    margin-right: 0.5em;
                  }
                  .kolam-btn .roadmap-icon {
                    width: 1.2em;
                    height: 1.2em;
                    margin-right: 0.5em;
                  }
                `}</style>
                <a href="/recognition" style={{ textDecoration: 'none' }}>
                  <button className="kolam-btn">
                    <span className="icon">✧</span>
                    Try Kolam Recognition
                  </button>
                </a>
                <a href="#roadmap" style={{ textDecoration: 'none' }}>
                  <button className="kolam-btn">
                    <span className="roadmap-icon" style={{display:'inline-flex',alignItems:'center'}}>
                      <img src="/kolam.png" alt="Kolam" style={{width:'32px',height:'32px',objectFit:'contain',filter:'brightness(1.2) sepia(1) hue-rotate(10deg) saturate(8) drop-shadow(0 0 2px #bfa335)',marginRight:'0.7em',borderRadius:'50%'}} />
                    </span>
                    Roadmap
                  </button>
                </a>
              </div>
          </div>
          <div className="w-full flex items-center justify-center mt-8 lg:mt-0">
            <LeaderboardShowcase />
          </div>
        </section>

  <section className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full justify-center text-center" style={{marginRight: '2.5rem'}}>
          {/* KolamCard replacements for all cards */}
          <KolamCard
            title="Kolam Recognition"
            description="Working MVP – upload a Kolam image, get AI analysis."
            buttonText={<><Sparkle className="h-5 w-5 text-cyan-400 mr-2" />Open</>}
            buttonHref="/recognition"
            list={["AI dot grid detection", "Symmetry analysis", "Style recognition"]}
          />
          <KolamCard
            title="AI Kolam Generator"
            description="Create new Kolam patterns from a style prompt."
            buttonText={<><Boxes className="h-5 w-5 text-cyan-400 mr-2" />Open</>}
            buttonHref="/creation"
            list={["Prompt-based creation", "Unique patterns", "Download SVG/PNG"]}
          />
          <KolamCard
            title="Kolam Community Hub"
            description="Share designs, upvote, download SVG/PNG."
            buttonText={<><Users className="h-5 w-5 text-cyan-400 mr-2" />Open</>}
            buttonHref="/community"
            list={["Share & vote", "Download designs", "Community showcase"]}
          />
          <KolamCard
            title="Kolam Leaderboard"
            description="See top creators by Kolam Karma."
            buttonText={<><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy text-yellow-400 drop-shadow mr-2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>View Leaderboard</>}
            buttonHref="/leaderboard"
            list={["Top creators", "Kolam Karma points", "Leaderboard rewards"]}
          />
          <KolamCard
            title="AR Kolam Visualizer"
            description="Place Kolams in real-world AR using your phone camera."
            buttonText={<><ImagePlus className="h-5 w-5 text-blue-400 mr-2" />Try AR Visualizer</>}
            buttonHref="/ar-designer"
            list={["AR placement", "Mobile friendly", "Real-world preview"]}
          />
          <KolamCard
            title="Kolam Heritage Explorer"
            description="History and cultural significance of Kolams."
            buttonText={<><BookOpen className="h-5 w-5 text-cyan-400 mr-2" />Explore</>}
            buttonHref="/heritage-explorer"
            list={["History & culture", "Regional styles", "Interactive timeline"]}
          />
          <KolamCard
            title="Step-by-Step Learning Mode"
            description="Show animated tutorials: ‘connect dot 1 → dot 2 → …’. Users can learn how to draw Kolams in real life."
            buttonText={<><Boxes className="h-5 w-5 text-green-400 mr-2" />Coming Soon</>}
            buttonHref="#"
            list={["Animated tutorials", "Dot-by-dot guidance", "Learn Kolam drawing"]}
          />
          <KolamCard
            title="Virtual Kolam Competitions"
            description="Compete in online Kolam contests. AI judges creativity, symmetry, and style. Win badges and showcase your skills!"
            buttonText={<><ShieldCheck className="h-5 w-5 text-purple-400 mr-2" />Coming Soon</>}
            buttonHref="#"
            list={["Online competitions", "AI judging", "Win badges & rewards"]}
          />
          <KolamCard
            title="Interactive Kolam Games"
            description="Gamify Kolam patterns! Puzzle games, 1v1 Battles Arena, unlock levels, challenge friends, and more."
            buttonText={<><Sparkle className="h-5 w-5 text-orange-400 mr-2" />Coming Soon</>}
            buttonHref="#"
            list={["Puzzle games", "1v1 Battles Arena", "More games coming"]}
          />
        </section>

        <section id="roadmap" className="mt-16">
          <h2 className="text-3xl font-extrabold mb-8 font-serif text-yellow-400 drop-shadow-gold tracking-tight border-b-2 border-yellow-300 pb-2" style={{letterSpacing:'0.03em'}}>Roadmap</h2>
          <div className="space-y-7 bg-gradient-to-br from-[#2a0a1a] via-[#280c1a] to-[#bfa335]/10 rounded-2xl p-6 border-2 border-yellow-300/60 shadow-lg">
            {/* Roadmap Item 1 */}
            <div className="flex items-start gap-4">
              <div className="h-9 w-9 rounded-full bg-yellow-100 border-2 border-yellow-400 grid place-items-center text-yellow-700 font-bold shadow-gold">1</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">MVP: Kolam Recognition</h4>
                <p className="text-sm text-yellow-100 font-serif">Upload a Kolam image, get instant AI analysis: dot grid, symmetry, style. <span className='font-bold text-green-400'>Live now!</span></p>
              </div>
            </div>
            {/* Roadmap Item 2 */}
            <div className="flex items-start gap-4 opacity-95">
              <div className="h-9 w-9 rounded-full bg-yellow-200 border-2 border-yellow-400 grid place-items-center text-yellow-700 font-bold shadow-gold">2</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">AR Designer & Generator</h4>
                <p className="text-sm text-yellow-100 font-serif">Create Kolams from prompts, visualize them in AR on your phone. <span className='font-bold text-green-400'>Live now!</span> <span className='italic text-yellow-200'>Unleash creativity!</span></p>
              </div>
            </div>
            {/* Roadmap Item 3 */}
            <div className="flex items-start gap-4 opacity-95">
              <div className="h-9 w-9 rounded-full bg-yellow-200 border-2 border-yellow-400 grid place-items-center text-yellow-700 font-bold shadow-gold">3</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">Community & Heritage</h4>
                <p className="text-sm text-yellow-100 font-serif">Share, vote, and download Kolams. Explore history, secure originality with blockchain. <span className='font-bold text-green-400'>Live now!</span></p>
              </div>
            </div>
            {/* Roadmap Item 4 */}
            <div className="flex items-start gap-4 opacity-90">
              <div className="h-9 w-9 rounded-full bg-pink-200 border-2 border-yellow-400 grid place-items-center text-pink-600 font-bold shadow-gold">4</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">Festival Special Kolams 🌸</h4>
                  <p className="text-sm text-yellow-100 font-serif">AI auto-generates festival-themed Kolams (Diwali, Pongal, Onam). <span className='font-bold text-green-400'>Live now!</span> <span className='italic text-yellow-200'>Unlock special designs on festival days with our calendar!</span></p>
              </div>
            </div>
            {/* Roadmap Item 5 */}
            <div className="flex items-start gap-4 opacity-90">
              <div className="h-9 w-9 rounded-full bg-green-200 border-2 border-yellow-400 grid place-items-center text-green-600 font-bold shadow-gold">5</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">Step-by-Step Learning Mode ✏</h4>
                <p className="text-sm text-yellow-100 font-serif">Animated tutorials: “connect dot 1 → dot 2 → …”. <span className='italic text-yellow-200'>Learn to draw Kolams in real life, dot-by-dot!</span> <span className='font-bold text-yellow-400'>Coming soon!</span></p>
              </div>
            </div>
            {/* Roadmap Item 6 */}
            <div className="flex items-start gap-4 opacity-90">
              <div className="h-9 w-9 rounded-full bg-purple-200 border-2 border-yellow-400 grid place-items-center text-purple-600 font-bold shadow-gold">6</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">Virtual Kolam Competitions</h4>
                <p className="text-sm text-yellow-100 font-serif">Compete in online Kolam contests. <span className='font-bold text-purple-400'>AI judges creativity, symmetry, and style.</span> <span className='italic text-yellow-200'>Win badges and showcase your skills!</span> <span className='font-bold text-yellow-400'>Coming soon!</span></p>
              </div>
            </div>
            {/* Roadmap Item 7 */}
            <div className="flex items-start gap-4 opacity-90">
              <div className="h-9 w-9 rounded-full bg-orange-200 border-2 border-yellow-400 grid place-items-center text-orange-600 font-bold shadow-gold">7</div>
              <div>
                <h4 className="font-bold font-serif text-lg text-yellow-300 drop-shadow-gold">Interactive Kolam Games</h4>
                <p className="text-sm text-yellow-100 font-serif">Gamify Kolam patterns! <span className='font-bold text-orange-400'>Puzzle games, 1v1 Battles Arena ,unlock levels, challenge friends, and more.</span> <span className='italic text-yellow-200'>Fun for all ages!</span> <span className='font-bold text-yellow-400'>Coming soon!</span></p>
              </div>
            </div>
          </div>
        </section>
      </main>
  {/* Footer is now handled globally in layout.tsx */}
      <FeedbackFloating />
      </div>
    </div>
  )
}
