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
  const [datasetResult, setDatasetResult] = React.useState<Analysis | null>(null)
  const [geminiResult, setGeminiResult] = React.useState<any | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [overlayUrl, setOverlayUrl] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState<number>(0)
  const [reanalyzing, setReanalyzing] = React.useState(false)
  const [tip, setTip] = React.useState<string | null>(null)

  const onFile = (f: File | null) => {
    setFile(f)
  setDatasetResult(null)
  setGeminiResult(null)
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
  setDatasetResult(null)
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
  setDatasetResult(data)
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

  // Log when Gemini result updates
  React.useEffect(() => {
    if (geminiResult) {
      // eslint-disable-next-line no-console
      console.log('Gemini result updated:', geminiResult)
    }
  }, [geminiResult]);

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
                  {file && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setOverlayUrl(null)
                        try {
                          const form = new FormData()
                          form.append('image', file)
                          const res = await fetch('/api/analyze/overlay', { method: 'POST', body: form })
                          if (!res.ok) throw new Error(await res.text())
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          setOverlayUrl(url)
                        } catch (e: any) {
                          setError(e?.message || 'Failed to fetch overlay')
                        }
                      }}
                    >
                      Show detected dots
                    </Button>
                  )}
                </div>
                {preview && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image src={preview} alt="preview" width={600} height={400} className="w-full object-contain max-h-96 bg-muted" />
                    {overlayUrl && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Detected dots overlay</div>
                        <img src={overlayUrl} alt="overlay" className="w-full object-contain rounded" />
                      </div>
                    )}
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
        {!datasetResult && <p className="text-sm text-muted-foreground">No results yet.</p>}
        {datasetResult && (
                <div className="space-y-4">
                {datasetResult.classification && (
                    <div className="rounded-xl border p-4 bg-gradient-to-br from-primary/10 to-accent/10">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16">
                          {/* radial progress */}
                          <svg viewBox="0 0 36 36" className="h-16 w-16">
                            <path className="text-muted stroke-current" strokeWidth="3" fill="none" pathLength={100}
                              d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" opacity="0.2" />
                            <path className="text-primary stroke-current" strokeWidth="3" strokeLinecap="round" fill="none" pathLength={100}
                              strokeDasharray={`${Math.round((datasetResult!.classification.confidence) * 100)}, 100`}
                              d="M18 2a16 16 0 1 1 0 32a16 16 0 1 1 0-32" />
                          </svg>
                          <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{Math.round(datasetResult!.classification.confidence * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-sm uppercase text-muted-foreground">Classification</div>
                          <div className="mt-1 text-xl font-semibold tracking-tight">
                            {datasetResult.classification.label}
                            <span className="ml-3 text-[10px] uppercase tracking-wider rounded-full bg-secondary/60 px-2 py-0.5">{datasetResult.classification.source}</span>
                          </div>
                        </div>
                      </div>
                      {/* confidence breakdown bar */}
                      <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.round(datasetResult.classification.confidence * 100)}%` }}
                            title={`${Math.round(datasetResult.classification.confidence * 100)}% ${datasetResult.classification.label}`}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{Math.round(datasetResult.classification.confidence * 100)}% {datasetResult.classification.label}</span>
                        <span>
                          Other: {Math.max(0, 100 - Math.round(datasetResult.classification.confidence * 100))}%
                        </span>
                      </div>
                      {datasetResult.classification.details && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {Object.entries(datasetResult.classification.details).map(([k, v]) => (
                            <div key={k}>
                              <span className="font-medium">{k}:</span> {String(v)}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        {datasetResult.classification.source !== 'gemini' && (
                          <Button
                            onClick={async () => {
                              if (!file) return
                              setReanalyzing(true)
                              setProgress(10)
                              try {
                                const form = new FormData()
                                form.append('image', file)
                                const t1 = setTimeout(() => setProgress(40), 300)
                                const t2 = setTimeout(() => setProgress(70), 900)
                                const res = await fetch('/api/analyze/gemini', { method: 'POST', body: form })
                                clearTimeout(t1)
                                clearTimeout(t2)
                                if (!res.ok) {
                                  const text = await res.text()
                                  throw new Error(text || 'Gemini reanalysis failed')
                                }
                                const data = await res.json()
                                // Server may return { analysis, raw }; prefer raw for display
                                const display = data?.raw ?? data?.analysis ?? data
                                // Save Gemini-specific analysis separately so datasetResult remains unchanged
                                setGeminiResult(display)
                                // Log Gemini result for debugging/inspection
                                // eslint-disable-next-line no-console
                                console.log('Gemini analysis result:', display)
                              } catch (e: any) {
                                setError(e?.message || 'Failed to re-analyze with Gemini')
                              } finally {
                                setProgress(100)
                                setReanalyzing(false)
                              }
                            }}
                            disabled={reanalyzing}
                          >
                            {reanalyzing ? 'Re-analyzing  ' : 'Re-analyze with Gemini'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {datasetResult.grid && (
                    <div className="rounded-xl border p-4 bg-card/50">
                      <div className="text-sm uppercase text-muted-foreground">Dot Grid</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">rows: {datasetResult.grid.rows}</span>
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">cols: {datasetResult.grid.cols}</span>
                        <span className="rounded-full bg-secondary/60 px-2 py-0.5">dots: {datasetResult.grid.dotCount}</span>
                      </div>
                    </div>
                  )}
                  {datasetResult.symmetry && datasetResult.symmetry.length > 0 && (
                    <div className="rounded-xl border p-4 bg-card/50">
                      <div className="text-sm uppercase text-muted-foreground">Symmetry</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {datasetResult.symmetry.map((s, i) => (
                          <span key={i} className="rounded-full bg-accent/60 px-2 py-0.5 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Gemini result displayed below dataset result for comparison */}
                  {geminiResult && (
                    <div className="rounded-2xl border p-4 bg-gradient-to-br from-white/3 to-primary/6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm uppercase text-muted-foreground">Gemini Analysis</div>
                        <div className="text-xs text-muted-foreground">Model: Gemini</div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Type (canonical)</div>
                          <div className="text-lg font-semibold">{geminiResult.kolamTypeNormalized ?? geminiResult.kolamType}</div>
                          {geminiResult.reportedName && (
                            <div className="text-xs text-muted-foreground">Reported name: <span className="font-medium">{geminiResult.reportedName}</span></div>
                          )}

                          <div className="mt-2 text-sm text-muted-foreground">Principle</div>
                          <div className="font-medium">{geminiResult.principle}</div>

                          <div className="mt-2 text-sm text-muted-foreground">Symmetry</div>
                          <div className="flex flex-wrap gap-2">
                            {(geminiResult.symmetry || []).map((s: string, i: number) => (
                              <span key={i} className="text-xs bg-accent/10 rounded-full px-2 py-1">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Symmetry confidence</div>
                          <div className="text-lg font-semibold">{typeof geminiResult.symmetryConfidence === 'number' ? Number(geminiResult.symmetryConfidence).toFixed(2) : 'N/A'}</div>

                          <div className="mt-2 text-sm text-muted-foreground">Spiritual</div>
                          <div className="font-medium">{geminiResult.spiritual ?? 'N/A'}</div>
                          {geminiResult.spiritualAssessment && (
                            <div className="mt-1 text-xs text-muted-foreground space-y-1">
                              <div><span className="font-medium">Home:</span> {geminiResult.spiritualAssessment.home}</div>
                              <div><span className="font-medium">Shop:</span> {geminiResult.spiritualAssessment.shop}</div>
                            </div>
                          )}

                          <div className="mt-2 text-sm text-muted-foreground">Explanation</div>
                          <div className="text-sm">{geminiResult.explanation}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">Comparison: dataset vs Gemini</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/10">
                          <div className="font-medium">Dataset</div>
                          <div className="text-muted-foreground">{datasetResult?.classification?.label ?? '—'}</div>
                        </div>
                        <div className="p-2 rounded bg-muted/10">
                          <div className="font-medium">Gemini</div>
                          <div className="text-muted-foreground">{geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '—'}</div>
                        </div>
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
