'use client'
import * as React from 'react'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/site/auth-context'
import Link from 'next/link'
import Image from 'next/image';

type Analysis = {
  grid?: { rows: number; cols: number; dotCount: number }
  symmetry?: string[]
  classification?: { label: string; confidence: number; source: 'cv' | 'dataset' | 'gemini'; details?: Record<string, any> }
  overlays?: { type: 'dots' | 'grid' | 'contours'; points?: number[][] }[]
}

export default function RecognitionPage() {
  const auth = useAuth();
  const user = auth?.user;
  // Curated Kolam facts and quotes (concise, accurate, and respectful)
  const TIPS = React.useMemo(
    () => [
      'Kolam (Tamil: கோலம்) means beauty or embellishment; it is a threshold art drawn at dawn.',
      'In Tamil, dot patterns are called Pulli Kolam (pulli = dots); looping knot designs are Sikku Kolam.',
      'Similar traditions exist across India: Telugu Muggu/Muggulu, Kannada and Marathi Rangoli.',
      'Rice flour is traditionally used so birds and ants can feed - art that also nourishes.',
      'Kolam designs often encode symmetry, tiling, and fractal-like repetition.',
      'Many kolams start from a pulli (dot) grid and weave continuous lines around them.',
      'Drawing kolam daily is believed to invite prosperity and positive energy into the home.',
      'Sikku kolams trace elegant knots around dots without crossing the drawn line.',
      'Kolam is ephemeral - wiped by wind and footsteps, then renewed every morning.',
      'Festive kolams can be large, colorful, and highly intricate with seasonal motifs.',
      'Kolam practice blends math and mindfulness - precision, rhythm, and creativity.',
      'Eco-friendly pigments and stone powders add color while keeping it biodegradable.'
    ],
    []
  )

  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<Analysis | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)
  const [tip, setTip] = React.useState<string | null>(null)

  const onFile = (f: File | null) => {
    setFile(f)
    setResult(null)
    setError(null)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setProgress(10)
    // set an initial rotating tip for the loading overlay
    if (TIPS.length) {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
    }
    setError(null)
    setResult(null)
    try {
      const form = new FormData()
      form.append('image', file)
      // Fake staged progress for better UX
      const t1 = setTimeout(() => setProgress(35), 350)
      const t2 = setTimeout(() => setProgress(60), 900)
      const t3 = setTimeout(() => setProgress(85), 1600)
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as Analysis
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Failed to analyze image')
    } finally {
      setProgress(100)
      setLoading(false)
    }
  }

  // Rotate tips while loading
  React.useEffect(() => {
    if (!loading || TIPS.length === 0) return
    const id = window.setInterval(() => {
      setTip(TIPS[Math.floor(Math.random() * TIPS.length)])
    }, 5500) // rotate more slowly so each tip stays visible
    return () => window.clearInterval(id)
  }, [loading, TIPS])

  // Redirect to sign-in if user is not authenticated
  React.useEffect(() => {
    if (!user && !auth?.loading) {
      window.location.href = '/signin';
    }
  }, [user, auth?.loading]);

  // Show loading or nothing while redirecting
  if (!user) {
    return (
      <div>
        <Navbar />
        <main className="container py-10">
          <div className="max-w-md mx-auto text-center">
            <Card className="p-8 shadow-xl rounded-2xl border bg-card/80 backdrop-blur-sm">
              <h1 className="text-3xl font-bold text-primary mb-4">Redirecting...</h1>
              <p className="text-muted-foreground">Please wait while we redirect you to sign in.</p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-bold">Kolam Recognition</h1>
        <p className="text-muted-foreground mt-1">Upload a Kolam image. We&#39;ll detect dots, symmetry and classify the style.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>PNG or JPG up to 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                <div className="flex gap-2">
                  <Button onClick={analyze} disabled={!file || loading}>{loading ? 'Analyzing…' : 'Analyze'}</Button>
                  {file && <Button variant="ghost" onClick={() => onFile(null)}>Reset</Button>}
                </div>
                {preview && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image src={preview} alt="preview" width={600} height={400} className="w-full object-contain max-h-96 bg-muted" />
                  </div>
                )}
                {loading && (
                  <div className="relative overflow-hidden rounded-xl border bg-card/40">
                    <div className="absolute inset-0 grid grid-rows-3 gap-2 p-4">
                      <div className="h-2 shimmer animate-shimmer rounded bg-white/10" />
                      <div className="h-2 shimmer animate-shimmer rounded bg-white/10" />
                      <div className="h-2 shimmer animate-shimmer rounded bg-white/10" />
                    </div>
                    <div className="relative p-6">
                      <div className="text-sm text-muted-foreground">Analyzing with AI…</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {tip && (
                        <div className="mt-3 text-xs italic text-muted-foreground/90">
                          {tip}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Interactive insights</CardDescription>
            </CardHeader>
            <CardContent>
              {!result && <p className="text-sm text-muted-foreground">No results yet.</p>}
              {result && (
                <div className="space-y-4">
                  {result.classification && (
                    <div className="rounded-xl border p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16">
                          {/* radial progress */}
                          <svg viewBox="0 0 36 36" className="h-16 w-16">
                            <path className="text-muted stroke-current" strokeWidth="3" fill="none" pathLength={100}
                              d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" opacity="0.2" />
                            <path className="text-primary stroke-current" strokeWidth="3" strokeLinecap="round" fill="none" pathLength={100}
                              strokeDasharray={`${Math.round((result.classification.confidence) * 100)}, 100`}
                              d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" />
                          </svg>
                          <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{Math.round(result.classification.confidence * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-sm uppercase text-muted-foreground">Classification</div>
                          <div className="mt-1 text-xl font-semibold tracking-tight">
                            {result.classification.label}
                            <span className="ml-3 text-[10px] uppercase tracking-wider rounded-full bg-secondary/60 px-2 py-0.5">{result.classification.source}</span>
                          </div>
                        </div>
                      </div>
                      {/* confidence breakdown bar */}
                      <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.round(result.classification.confidence * 100)}%` }}
                          title={`${Math.round(result.classification.confidence * 100)}% ${result.classification.label}`}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(result.classification.confidence * 100)}% {result.classification.label}</span>
                        <span>
                          Other: {Math.max(0, 100 - Math.round(result.classification.confidence * 100))}%
                        </span>
                      </div>
                      {result.classification.details && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {Object.entries(result.classification.details).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-medium">{k}:</span> {String(v)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {result.grid && (
                    <div className="rounded-xl border p-4 bg-card/50">
                      <div className="text-sm uppercase text-muted-foreground">Dot Grid</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">rows: {result.grid.rows}</span>
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">cols: {result.grid.cols}</span>
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">dots: {result.grid.dotCount}</span>
                      </div>
                    </div>
                  )}
                  {result.symmetry && result.symmetry.length > 0 && (
                    <div className="rounded-xl border p-4 bg-card/50">
                      <div className="text-sm uppercase text-muted-foreground">Symmetry</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.symmetry.map((s, i) => (
                          <span key={i} className="rounded-full bg-accent/60 px-2 py-0.5 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
