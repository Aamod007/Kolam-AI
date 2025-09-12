'use client'
import * as React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/site/auth-context'
import Link from 'next/link'
import Image from 'next/image';
import { CommunityPostModal } from '@/components/community/CommunityPostModal';
import ReactConfetti from 'react-confetti';

type Analysis = {
  grid?: { rows: number; cols: number; dotCount: number }
  symmetry?: string[]
  classification?: { label: string; confidence: number; source: 'cv' | 'dataset' | 'gemini'; details?: Record<string, any> }
  overlays?: { type: 'dots' | 'grid' | 'contours'; points?: number[][] }[]
}

export default function RecognitionPage() {
  const [showPostModal, setShowPostModal] = React.useState(false);
  const [postImage, setPostImage] = React.useState<string | null>(null);
  const [postDetails, setPostDetails] = React.useState<string | null>(null);
  const [alreadyPosted, setAlreadyPosted] = React.useState(false);
  const [karmaPoints, setKarmaPoints] = React.useState<number | null>(null);
const [showKarmaModal, setShowKarmaModal] = React.useState(false);
  // ...existing state declarations...

  // Open CommunityPostModal after analysis is complete and user has not already posted

  // ...existing state declarations...

  // Show modal after any successful recognition (dataset or gemini)


  // Handler for posting to community
  async function handlePostToCommunity(description: string) {
    setAlreadyPosted(true);
    // Example: send post to API or Supabase
    try {
      // Replace with actual post logic
      // await supabase.from('community_posts').insert({ image: postImage, details: description, user_id: user?.id });
      // For now, just close modal
      setShowPostModal(false);
    } catch (e: any) {
      // Handle error if needed
    }
  }
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
  const [preferGemini, setPreferGemini] = React.useState<boolean>(true)
  const [progress, setProgress] = React.useState<number>(0)
  const [consentGiven, setConsentGiven] = React.useState<boolean>(false)
  const [reanalyzing, setReanalyzing] = React.useState(false)
  const [tip, setTip] = React.useState<string | null>(null)


  const onFile = (f: File | null) => {
    setFile(f)
  setDatasetResult(null)
  setGeminiResult(null)
    setError(null)
    setPreview(f ? URL.createObjectURL(f) : null)
    setAlreadyPosted(false);
  }


  React.useEffect(() => {
    if ((datasetResult || geminiResult) && preview && !alreadyPosted) {
      setPostImage(preview);
      let name = '';
      let explanation = '';
      if (geminiResult) {
        name = geminiResult.kolamTypeNormalized || geminiResult.kolamType || '';
        explanation = geminiResult.explanation || '';
      } else if (datasetResult) {
        name = datasetResult.classification?.label || '';
        explanation = '';
      }
      setPostDetails(`${name}${explanation ? ': ' + explanation : ''}`);
      setShowPostModal(true);
    }
  }, [datasetResult, geminiResult, preview, alreadyPosted]);


  // Load preference from localStorage
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Try to read from Supabase profile for authenticated user
        const authUser = (await supabase.auth.getUser()).data.user
        if (authUser && mounted) {
          const { data, error } = await supabase.from('profiles').select('prefer_gemini').eq('id', authUser.id).single()
          if (!error && data && typeof data.prefer_gemini === 'boolean') {
            setPreferGemini(Boolean(data.prefer_gemini))
            return
          }
        }
      } catch {}
      try {
        const v = localStorage.getItem('preferGemini')
        if (v !== null && mounted) setPreferGemini(v === 'true')
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  // Persist preference
  React.useEffect(() => {
    try {
      localStorage.setItem('preferGemini', preferGemini ? 'true' : 'false')
    } catch {}
  }, [preferGemini])

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
      const t1 = setTimeout(() => setProgress(35), 350)
      const t2 = setTimeout(() => setProgress(60), 900)
      const t3 = setTimeout(() => setProgress(85), 1600)
      if (preferGemini) {
        const res = await fetch('/api/analyze/gemini', { method: 'POST', body: form })
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        const display = data?.raw ?? data?.analysis ?? data
        setGeminiResult(display)
        setDatasetResult(null)
        // eslint-disable-next-line no-console
        console.log('Gemini analysis result:', display)
  // store annotation (non-blocking)
  storeAnnotation(file, display)
      } else {
        const res = await fetch('/api/analyze', { method: 'POST', body: form })
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as Analysis
        setDatasetResult(data)
        setGeminiResult(null)
      }
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

  // Persist user-upload + gemini result to Supabase for dataset building
  const storeAnnotation = async (file: File, gemini: any) => {
    try {
      if (!file) return
      // compute sha256 of file to deduplicate
      const ab = await file.arrayBuffer()
      const digest = await crypto.subtle.digest('SHA-256', ab)
      const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')

      // check for existing annotation by hash
      const { data: existing } = await supabase.from('annotations').select('id').eq('hash', hex).limit(1).maybeSingle()
      if (existing) {
        // already stored
        // eslint-disable-next-line no-console
        console.log('Annotation already exists, skipping upload', hex)
        return
      }

      // upload to storage bucket 'kolam_images' (ensure bucket exists)
      const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '')
      const path = `${hex}.${ext}`
      const { error: upErr } = await supabase.storage.from('kolam_images').upload(path, file, { upsert: false })
      if (upErr && upErr.message && !upErr.message.includes('already exists')) {
        // eslint-disable-next-line no-console
        console.warn('upload error', upErr)
      }
      const { data: pu } = supabase.storage.from('kolam_images').getPublicUrl(path)
      const publicUrl = pu?.publicUrl ?? null

      // insert annotation record
      const userId = (await supabase.auth.getUser()).data.user?.id ?? null
      const payload = {
        user_id: userId,
        url: publicUrl,
        hash: hex,
        gemini_result: gemini ?? {},
        created_at: new Date().toISOString()
      }
      const { error: insErr } = await supabase.from('annotations').insert(payload)
      if (insErr) {
        // eslint-disable-next-line no-console
        console.warn('Failed to insert annotation', insErr)
      } else {
        // eslint-disable-next-line no-console
        console.log('Annotation stored', hex)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('storeAnnotation failed', err)
    }
  }

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
          {/* ...existing code... */}
          <Card className="w-full max-w-md mx-auto sm:max-w-none sm:mx-0">
            {/* ...existing code... */}
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>PNG or JPG up to 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button className="w-full sm:w-auto" onClick={analyze} disabled={!file || loading || !consentGiven}>{loading ? 'Analyzing…' : 'Analyze'}</Button>
                  {file && <Button className="w-full sm:w-auto" variant="ghost" onClick={() => onFile(null)}>Reset</Button>}
                  {file && (
                    <Button
                      className="w-full sm:w-auto"
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
                        {/* Try Its Variants button: always shown after analysis */}
                        {file && (datasetResult || geminiResult) && (
                          <Button
                            variant="secondary"
                            className="ml-2 w-full sm:w-auto relative font-bold bg-teal-600 text-white border border-teal-600 shadow hover:bg-teal-700 hover:shadow-lg transition-transform duration-200"
                            onClick={async () => {
                              if (file) {
                                // Convert file to base64 before storing
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result as string;
                                  sessionStorage.setItem('kolam_variant_image', base64);
                                  window.location.href = '/creation?variant=1';
                                };
                                reader.readAsDataURL(file);
                              } else if (preview) {
                                // fallback for preview
                                sessionStorage.setItem('kolam_variant_image', preview);
                                window.location.href = '/creation?variant=1';
                              }
                            }}
                          >
                            <span className="relative z-10">Try Its Variants</span>
                            {/* Sparkle effect */}
                            <span className="absolute pointer-events-none inset-0 flex justify-center items-center">
                              {[...Array(8)].map((_, i) => (
                                <span
                                  key={i}
                                  className="absolute rounded-full bg-teal-300 opacity-70"
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    top: `${Math.random() * 80 + 10}%`,
                                    left: `${Math.random() * 80 + 10}%`,
                                    animation: `sparkle 1.2s linear ${i * 0.15}s infinite`
                                  }}
                                />
                              ))}
                            </span>
                            <style>{`
                              @keyframes sparkle {
                                0% { opacity: 0.7; transform: scale(1); }
                                50% { opacity: 1; transform: scale(1.5); }
                                100% { opacity: 0; transform: scale(0.8); }
                              }
                            `}</style>
                          </Button>
                        )}
                </div>
                <div className="flex items-start gap-3">
                  <input id="consent" type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} className="mt-1 h-4 w-4" />
                  <label htmlFor="consent" className="text-xs text-muted-foreground max-w-md">
                    I consent to storing my uploaded images and Gemini analysis results to improve the dataset. See your <a href="/profile" className="underline">Profile settings</a> to change this preference.
                  </label>
                </div>

                {preview && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image src={preview} alt="preview" width={600} height={400} className="w-full object-contain max-h-96 bg-muted" />
                    {overlayUrl && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Detected dots overlay</div>
                        <Image src={overlayUrl} alt="overlay" width={600} height={400} className="w-full object-contain rounded" />
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
          {/* ...existing code... */}
          <Card className="bg-card/60 backdrop-blur">
            {/* ...existing code... */}
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Interactive insights</CardDescription>
            </CardHeader>
            <CardContent>
  {(!datasetResult && !geminiResult) && <p className="text-sm text-muted-foreground">No results yet.</p>}
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
                        {!preferGemini && datasetResult.classification.source !== 'gemini' && (
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
                                // store for dataset building (non-blocking)
                                storeAnnotation(file, display)
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
                  
                </div>
              )}
        {geminiResult && (
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-white/3 to-primary/6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Gemini Analysis · Model: Gemini</div>
                {(() => {
                  // Only promote reportedName when it is meaningful — not a generic "other" placeholder.
                  const reported = String(geminiResult.reportedName ?? '').trim()
                  const canonical = String(geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '').trim()
                  const reportedIsOther = /^\s*other\b/i.test(reported)
                  const canonicalIsOther = /^\s*other\b/i.test(canonical)

                  if (reported && !reportedIsOther) {
                    return (
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{reported}</h2>
                        {!canonicalIsOther && canonical && (
                          <span className="text-sm rounded-full bg-secondary/20 px-2 py-1 text-muted-foreground">{canonical}</span>
                        )}
                      </div>
                    )
                  }

                  if (canonical && !canonicalIsOther) {
                    return <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{canonical}</h2>
                  }

                  return <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">Unknown</h2>
                })()}
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Symmetry confidence</div>
                <div className="text-lg font-bold text-primary">{typeof geminiResult.symmetryConfidence === 'number' ? `${(Number(geminiResult.symmetryConfidence) * 100).toFixed(0)}%` : 'N/A'}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1 flex flex-col items-center gap-3">
                <div className="rounded-lg overflow-hidden w-40 h-40 flex items-center justify-center bg-muted">
                  {preview ? (
                    // Use client preview if available
                    // eslint-disable-next-line @next/next/no-img-element
<Image src={preview || '/default-kolam.png'} alt="Kolam preview" width={600} height={400} className="w-full object-contain rounded" />
                  ) : (
                    <div className="text-xs text-muted-foreground px-3">No preview</div>
                  )}
                </div>
                {/* mobile-only symmetry moved below Principle for better layout */}
                {(() => {
                  const reported = String(geminiResult.reportedName ?? '').trim()
                  const canonical = String(geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '').trim()
                  const reportedIsOther = /^\s*other\b/i.test(reported)
                  const showReported = reported && !reportedIsOther
                  const label = showReported ? 'Reported' : 'Type'
                  const value = showReported ? reported : (canonical || 'Unknown')
                  return (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="text-sm font-medium">{value}</div>
                    </div>
                  )
                })()}
              </div>

                <div className="sm:col-span-2 grid gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Principle</div>
                  <div className="text-base font-semibold">{geminiResult.principle ?? '—'}</div>
                </div>
                {/* Mobile-only symmetry confidence: appears below Principle on small screens */}
                <div className="sm:hidden mt-2 text-sm">
                  <div className="text-xs text-muted-foreground">Symmetry confidence</div>
                  <div className="text-sm font-bold text-primary">{typeof geminiResult.symmetryConfidence === 'number' ? `${(Number(geminiResult.symmetryConfidence) * 100).toFixed(0)}%` : 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Symmetry</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(geminiResult.symmetry || []).length === 0 ? (
                      <span className="text-xs text-muted-foreground">None detected</span>
                    ) : (
                      (geminiResult.symmetry || []).map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center text-xs font-medium bg-accent/10 text-accent rounded-full px-2 py-1">{s}</span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Spiritual / Context</div>
                  <div className="mt-1 text-sm">{geminiResult.spiritual ?? 'Not available'}</div>
                  {geminiResult.spiritualAssessment && (
                    <div className="mt-2 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-muted/10"><div className="font-medium">Home</div><div>{geminiResult.spiritualAssessment.home}</div></div>
                      <div className="p-2 rounded bg-muted/10"><div className="font-medium">Shop</div><div>{geminiResult.spiritualAssessment.shop}</div></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Explanation</div>
                  <div className="mt-1 text-sm leading-relaxed text-foreground/90">{geminiResult.explanation ?? '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-muted-foreground">Comparison: dataset vs Gemini</div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded bg-muted/10 text-xs">
                  <div className="font-medium">Dataset</div>
                  <div className="text-muted-foreground">{datasetResult?.classification?.label ?? '—'}</div>
                </div>
                <div className="px-3 py-1 rounded bg-muted/10 text-xs">
                  <div className="font-medium">Gemini</div>
                  <div className="text-muted-foreground">{geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '—'}</div>
                </div>
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
                      const res = await fetch('/api/analyze', { method: 'POST', body: form })
                      clearTimeout(t1)
                      clearTimeout(t2)
                      if (!res.ok) {
                        const text = await res.text()
                        throw new Error(text || 'Dataset reanalysis failed')
                      }
                      const data = (await res.json()) as Analysis
                      setDatasetResult(data)
                    } catch (e: any) {
                      setError(e?.message || 'Failed to re-analyze with dataset')
                    } finally {
                      setProgress(100)
                      setReanalyzing(false)
                    }
                  }}
                  disabled={reanalyzing}
                >
                  {reanalyzing ? 'Re-analyzing…' : 'Re-analyze with Dataset'}
                </Button>
              </div>
            </div>
          </div>
        )}
            </CardContent>
          </Card>
        </div>
        {/* CommunityPostModal integration */}
<CommunityPostModal
  image={postImage ?? ''}
  details={postDetails ?? ''}
  open={showPostModal}
  onClose={() => setShowPostModal(false)}
  onPost={async (description) => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data?.user?.id;
      if (!userId) throw new Error('User not logged in');

      // Convert file to base64 before posting
      let imageBase64 = '';
      if (file) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (postImage) {
        imageBase64 = postImage;
      }

      const res = await fetch('/api/community-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, description, userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post');

      setTimeout(() => {
        setKarmaPoints(data.karma ?? null);
        setShowKarmaModal(true);
      }, 500);
    } catch (e) {
      const errMsg = (e instanceof Error) ? e.message : 'Failed to post';
      alert(errMsg);
    }
    setShowPostModal(false);
  }}
/>{showKarmaModal && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border relative">
      <ReactConfetti width={400} height={200} numberOfPieces={100} recycle={false} />
      <div className="animate-spin-slow mb-4">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FFD700" stroke="#F7B500" strokeWidth="4" />
          <text x="32" y="38" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff">10</text>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2 text-yellow-700">You earned 10 Kolam Karma!</h2>
      <p className="mb-2 text-gray-700">Total Kolam Karma: <span className="font-bold text-yellow-700">{karmaPoints ?? '...'}</span></p>
      <Button onClick={() => setShowKarmaModal(false)} className="mt-2 bg-yellow-500 text-white">Awesome!</Button>
    </div>
  </div>
)}{showKarmaModal && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col items-center border relative">
      <ReactConfetti width={400} height={200} numberOfPieces={100} recycle={false} />
      <div className="animate-spin-slow mb-4">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" fill="#FFD700" stroke="#F7B500" strokeWidth="4" />
          <text x="32" y="38" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#fff">{karmaPoints ?? '...'}</text>
        </svg>
      </div>
      <h2 className="text-xl font-bold mb-2 text-yellow-700">You earned {karmaPoints ?? 0} Kolam Karma!</h2>
      <p className="mb-2 text-gray-700">Total Kolam Karma: <span className="font-bold text-yellow-700">{karmaPoints ?? '...'}</span></p>
      <Button onClick={() => setShowKarmaModal(false)} className="mt-2 bg-yellow-500 text-white">Awesome!</Button>
    </div>
  </div>
)}
      </main>
      <Footer />
    </div>
  )
}
