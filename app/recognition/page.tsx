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
  dot_grid?: {
    rows: number;
    cols: number;
    spacing_x: number;
    spacing_y: number;
    regularity_score: number;
    num_dots: number;
    sample_dots: number[][];
  };
  symmetry?: {
    horizontal: number;
    vertical: number;
    diagonal: number;
    rotational_90: number;
    rotational_180: number;
    primary_symmetry: string;
    is_symmetric: boolean;
  };
  kolam_type?: string;
  type_confidence?: number;
  dl_classification?: string;
  dl_confidence?: number;
  repetition_patterns?: {
    has_repetition: boolean;
    repetition_score: number;
    tile_size: [number, number];
  };
  characteristics?: {
    edge_pixels: number;
    edge_density: number;
    num_contours: number;
    complexity: string;
  };
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
        name = datasetResult.dl_classification || datasetResult.kolam_type || '';
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
  // Use environment variable for backend endpoint
  const backendUrl = process.env.NEXT_PUBLIC_KOLAM_BACKEND_URL || 'https://kolambackend.onrender.com';
  const res = await fetch(`${backendUrl}/analyze`, { method: 'POST', body: form })
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json();
        setDatasetResult(data);
        setGeminiResult(null);
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
  // Remove global background immediately if video background is shown
  const showVideoBg = !user;
  React.useEffect(() => {
    if (showVideoBg) {
      const original = document.body.style.background;
      document.body.style.background = 'none';
      return () => { document.body.style.background = original; };
    }
  }, [showVideoBg]);

  if (showVideoBg) {
    return (
      <div style={{position: 'relative', minHeight: '100vh', width: '100%'}} className="font-display">
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
        <main className="min-h-screen flex items-center justify-center font-display" style={{position: 'relative', zIndex: 1}}>
          <div className="w-full max-w-md mx-auto p-6">
            <div
              className="border-2 border-yellow-300/70 shadow-xl rounded-2xl text-center relative"
              style={{
                background: 'linear-gradient(135deg, #3a0a2a 0%, #bfa335 100%)',
                boxShadow: '0 4px 32px #000a',
                color: '#ffd700',
                padding: '2rem',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-1.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '2.5rem',
                  color: '#ffd700',
                  filter: 'drop-shadow(0 0 6px #bfa335)',
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              >✦</span>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-4 drop-shadow-gold" style={{color:'#ffd700', letterSpacing:'0.03em'}}>
                Redirecting…
              </h1>
              <p className="text-base italic mb-2" style={{color:'#ffe6a7', fontFamily:'serif'}}>
                Please wait while we guide you to sign in.<br/>
                <span style={{color:'#ffb6c1'}}>Kolam Ai – Where tradition meets technology.</span>
              </p>
              <div className="mt-4 flex justify-center">
                <svg className="animate-spin h-8 w-8" style={{color:'#ffd700'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{position: 'relative', minHeight: '100vh', width: '100%'}} className="font-display">
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
        <main className="container py-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-yellow-700 drop-shadow-[0_2px_12px_rgba(255,215,0,0.7)] tracking-tight leading-tight text-center uppercase border-b-4 border-yellow-500 pb-2" style={{fontFamily: 'Georgia, serif', color: '#FFD700', letterSpacing: '0.12em', textShadow: '0 2px 12px rgba(255,215,0,0.7), 0 1px 0 #fff'}}>
            Kolam Recognition 🪔
          </h1>
          <p className="mt-4 text-lg font-bold font-serif text-center" style={{color: '#FFD700', textShadow: '0 2px 8px rgba(255,215,0,0.7), 0 1px 0 #fff'}}>
            Upload a Kolam image. We&#39;ll detect dots, symmetry and classify the style.<br className="hidden md:inline" />
            <span className="text-yellow-700">Heritage, cultural, and traditional theme.</span>
          </p>

          <div className="mt-8 w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start justify-center">
            {/* ...existing code... */}
          <Card className="w-full max-w-md mx-auto sm:max-w-none sm:mx-0 bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-visible font-serif">
            {/* Kolam motif background */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{zIndex:0}} />
            {/* ...existing code... */}
            <CardHeader>
              <CardTitle className="text-yellow-700 font-extrabold font-serif text-2xl">Upload</CardTitle>
              <CardDescription className="text-yellow-700 font-bold">PNG or JPG up to 5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 w-full">
                <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className="bg-yellow-50 border-yellow-400 rounded-xl font-serif text-yellow-900" />
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105 rounded-2xl font-serif" onClick={analyze} disabled={!file || loading || !consentGiven}>{loading ? 'Analyzing…' : 'Analyze'}</Button>
                  {file && <Button className="w-full sm:w-auto bg-yellow-50 text-yellow-700 border border-yellow-400 rounded-xl font-serif" variant="ghost" onClick={() => onFile(null)}>Reset</Button>}
                  {file && (
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500 text-yellow-900 border-2 border-yellow-400 shadow-md hover:from-yellow-300 hover:to-yellow-600 font-bold rounded-xl transition-all duration-200 font-serif"
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
                            className="w-full sm:w-auto relative font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white border-2 border-yellow-400 shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-transform duration-200 rounded-2xl font-serif"
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
                                  className="absolute rounded-full bg-yellow-300 opacity-80"
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
                                0% { opacity: 0.8; transform: scale(1); }
                                40% { opacity: 1; transform: scale(1.7); }
                                100% { opacity: 0; transform: scale(0.7); }
                              }
                            `}</style>
                          </Button>
                        )}
                </div>
                <div className="flex items-start gap-3">
                  <input id="consent" type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} className="mt-1 h-4 w-4" />
                  <label htmlFor="consent" className="text-xs text-yellow-700 max-w-md font-serif">
                    I consent to storing my uploaded images and Gemini analysis results to improve the dataset. See your <a href="/profile" className="underline">Profile settings</a> to change this preference.
                  </label>
                </div>

                {preview && (
                  <div className="rounded-lg overflow-hidden border border-cyan-200 bg-white/80">
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
                  <div className="relative overflow-hidden rounded-xl border-2 border-yellow-400 bg-white/80 shadow-lg">
                    <div className="relative p-6 flex flex-col items-center">
                      <svg className="w-6 h-6 text-yellow-500 animate-spin mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-base text-yellow-700 font-extrabold animate-pulse">Analyzing with AI…</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-yellow-100 overflow-hidden">
                        <div className="h-full bg-yellow-400 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      {tip && (
                        <div className="mt-3 text-xs italic text-yellow-700/90 font-bold animate-pulse">
                          {tip}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-2 animate-pulse font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* ...existing code... */}
          <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] dark:bg-yellow-900 backdrop-blur border-4 border-yellow-500 shadow-2xl rounded-3xl relative overflow-hidden font-serif">
            {/* Kolam motif background */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{zIndex:0}} />
            {/* ...existing code... */}
            <CardHeader>
              <CardTitle className="text-yellow-700 font-extrabold font-serif text-2xl">Results</CardTitle>
              <CardDescription className="text-yellow-700 font-bold">Interactive insights</CardDescription>
            </CardHeader>
            <CardContent>
  {(!datasetResult && !geminiResult) && <p className="text-sm text-muted-foreground">No results yet.</p>}
  {datasetResult && (
    
  <div className="rounded-2xl border p-4 sm:p-6 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg w-full max-w-full overflow-x-auto font-serif" style={{color:'#2d1a00'}}>
  <div className="flex flex-col gap-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs uppercase mb-1" style={{color:'#e6b800', textShadow:'0 1px 8px #fff'}}>Dataset Analysis · Model: Kolam Dataset</div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{color:'#e6b800', textShadow:'0 2px 12px #fff'}}>{datasetResult.kolam_type ?? 'Unknown'}</h2>
              <span className="text-sm rounded-full px-2 py-1 font-semibold" style={{background:'linear-gradient(90deg,#fffde7,#ffe082)', color:'#e6b800', boxShadow:'0 1px 8px #fff'}}>{datasetResult.dl_classification ?? 'Unknown'}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-sm font-semibold" style={{color:'#e6b800'}}>Type Confidence</div>
            <div className="text-lg font-bold" style={{color:'#2d1a00', textShadow:'0 1px 8px #fff'}}>{typeof datasetResult.type_confidence === 'number' ? `${(datasetResult.type_confidence * 100).toFixed(1)}%` : 'N/A'}</div>
            <div className="text-sm font-semibold" style={{color:'#e6b800'}}>DL Confidence</div>
            <div className="text-lg font-bold" style={{color:'#2d1a00', textShadow:'0 1px 8px #fff'}}>{typeof datasetResult.dl_confidence === 'number' ? `${(datasetResult.dl_confidence * 100).toFixed(1)}%` : 'N/A'}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 grid place-items-center font-bold">●</span>
              <span className="text-sm font-semibold" style={{color:'#e6b800'}}>Dot Grid</span>
            </div>
            {datasetResult.dot_grid ? (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#2d1a00'}}>Rows: {datasetResult.dot_grid.rows}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Cols: {datasetResult.dot_grid.cols}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Spacing X: {datasetResult.dot_grid.spacing_x}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Spacing Y: {datasetResult.dot_grid.spacing_y}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Regularity: {datasetResult.dot_grid.regularity_score?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Dots: {datasetResult.dot_grid.num_dots}</span>
              </div>
            ) : (
              <span className="text-xs" style={{color:'#e6b800'}}>No dot grid detected</span>
            )}
            {datasetResult.dot_grid?.sample_dots && (
              <div className="mt-2 text-xs" style={{color:'#bfa335'}}>Sample dots: {datasetResult.dot_grid.sample_dots.map((d: number[], i: number) => `(${d[0]},${d[1]})`).join(', ')}</div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 grid place-items-center font-bold">♻</span>
              <span className="text-sm font-semibold" style={{color:'#e6b800'}}>Symmetry</span>
            </div>
            {datasetResult.symmetry ? (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#2d1a00'}}>Horizontal: {datasetResult.symmetry.horizontal?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Vertical: {datasetResult.symmetry.vertical?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Diagonal: {datasetResult.symmetry.diagonal?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Rotational 90°: {datasetResult.symmetry.rotational_90?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Rotational 180°: {datasetResult.symmetry.rotational_180?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Primary: {datasetResult.symmetry.primary_symmetry}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Is Symmetric: {datasetResult.symmetry.is_symmetric ? 'Yes' : 'No'}</span>
              </div>
            ) : (
              <span className="text-xs" style={{color:'#e6b800'}}>No symmetry detected</span>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 grid place-items-center font-bold">🔁</span>
              <span className="text-sm font-semibold" style={{color:'#e6b800'}}>Repetition Patterns</span>
            </div>
            {datasetResult.repetition_patterns ? (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#2d1a00'}}>Has Repetition: {datasetResult.repetition_patterns.has_repetition ? 'Yes' : 'No'}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Repetition Score: {datasetResult.repetition_patterns.repetition_score?.toFixed(2)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Tile Size: {datasetResult.repetition_patterns.tile_size?.join(' x ')}</span>
              </div>
            ) : (
              <span className="text-xs" style={{color:'#e6b800'}}>No repetition detected</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 grid place-items-center font-bold">🧮</span>
              <span className="text-sm font-semibold" style={{color:'#e6b800'}}>Characteristics</span>
            </div>
            {datasetResult.characteristics ? (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#2d1a00'}}>Edge Pixels: {datasetResult.characteristics.edge_pixels}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Edge Density: {datasetResult.characteristics.edge_density?.toFixed(4)}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Contours: {datasetResult.characteristics.num_contours}</span>
                <span className="rounded-full px-2 py-0.5" style={{background:'#fffde7', color:'#bfa335'}}>Complexity: {datasetResult.characteristics.complexity}</span>
              </div>
            ) : (
              <span className="text-xs" style={{color:'#e6b800'}}>No characteristics detected</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            className="button"
            style={{ width: 'auto', minWidth: 220, background: 'linear-gradient(90deg, #bfa335 0%, #ffd700 100%)', boxShadow: '0 3rem 3rem rgba(191,163,53,0.15), 0 1rem 1rem -0.6rem rgba(255,215,0,0.18)', color: '#3a2a0a', fontWeight:600 }}
            onClick={async () => {
              if (!file) return;
              setReanalyzing(true);
              setProgress(10);
              try {
                const form = new FormData();
                form.append('image', file);
                const t1 = setTimeout(() => setProgress(40), 300);
                const t2 = setTimeout(() => setProgress(70), 900);
                const res = await fetch('/api/analyze/gemini', { method: 'POST', body: form });
                clearTimeout(t1);
                clearTimeout(t2);
                if (!res.ok) {
                  const text = await res.text();
                  throw new Error(text || 'Gemini reanalysis failed');
                }
                const data = await res.json();
                const display = data?.raw ?? data?.analysis ?? data;
                setGeminiResult(display);
                storeAnnotation(file, display);
              } catch (e: any) {
                setError(e?.message || 'Failed to re-analyze with Gemini');
              } finally {
                setProgress(100);
                setReanalyzing(false);
              }
            }}
            disabled={reanalyzing}
          >
            <div className="wrap">
              <p style={{color:'#2d1a00', textShadow:'0 1px 8px #fff', fontWeight:700}}>
                <span style={{color:'#bfa335'}}>✧</span>
                <span style={{color:'#bfa335'}}>✦</span>
                {reanalyzing ? 'Re-analyzing…' : 'Re-analyze with Gemini'}
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
              )}
        {geminiResult && (
          <div className="rounded-2xl border p-4 sm:p-6 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-lg w-full max-w-full overflow-x-auto font-serif" style={{color:'#3a2a0a'}}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase mb-1" style={{color:'#bfa335', textShadow:'0 1px 8px #fff'}}>Gemini Analysis · Model: Gemini</div>
                {(() => {
                  // Only promote reportedName when it is meaningful — not a generic "other" placeholder.
                  const reported = String(geminiResult.reportedName ?? '').trim()
                  const canonical = String(geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '').trim()
                  const reportedIsOther = /^\s*other\b/i.test(reported)
                  const canonicalIsOther = /^\s*other\b/i.test(canonical)

                  if (reported && !reportedIsOther) {
                    return (
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{color:'#bfa335', textShadow:'0 2px 12px #fff'}}> {reported} </h2>
                        {!canonicalIsOther && canonical && (
                          <span className="text-sm rounded-full px-2 py-1" style={{background:'linear-gradient(90deg,#fffde7,#ffe082)', color:'#bfa335', boxShadow:'0 1px 8px #fff'}}> {canonical} </span>
                        )}
                      </div>
                    )
                  }

                  if (canonical && !canonicalIsOther) {
                    return <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{color:'#bfa335', textShadow:'0 2px 12px #fff'}}>{canonical}</h2>
                  }

                  return <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight" style={{color:'#bfa335', textShadow:'0 2px 12px #fff'}}>Unknown</h2>
                })()}
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-sm" style={{color:'#bfa335'}}>Symmetry confidence</div>
                <div className="text-lg font-bold" style={{color:'#3a2a0a'}}>{typeof geminiResult.symmetryConfidence === 'number' ? `${(Number(geminiResult.symmetryConfidence) * 100).toFixed(0)}%` : 'N/A'}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3 sm:col-span-1">
                <div className="rounded-lg overflow-hidden w-40 h-40 flex items-center justify-center bg-yellow-100">
                  {preview ? (
                    <Image src={preview || '/default-kolam.png'} alt="Kolam preview" width={600} height={400} className="w-full object-contain rounded" />
                  ) : (
                    <div className="text-xs px-3" style={{color:'#bfa335'}}>No preview</div>
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
                      <div className="text-xs" style={{color:'#bfa335'}}>{label}</div>
                      <div className="text-sm font-medium" style={{color:'#3a2a0a'}}>{value}</div>
                    </div>
                  )
                })()}
              </div>

                <div className="sm:col-span-2 grid gap-3">
                <div className="flex flex-col gap-3">
                  <div className="text-sm" style={{color:'#bfa335'}}>Principle</div>
                  <div className="text-base font-semibold" style={{color:'#3a2a0a'}}>{geminiResult.principle ?? '—'}</div>
                </div>
                {/* Mobile-only symmetry confidence: appears below Principle on small screens */}
                <div className="sm:hidden mt-2 text-sm">
                  <div className="text-xs" style={{color:'#bfa335'}}>Symmetry confidence</div>
                  <div className="text-sm font-bold" style={{color:'#3a2a0a'}}>{typeof geminiResult.symmetryConfidence === 'number' ? `${(Number(geminiResult.symmetryConfidence) * 100).toFixed(0)}%` : 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm" style={{color:'#bfa335'}}>Symmetry</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(geminiResult.symmetry || []).length === 0 ? (
                      <span className="text-xs" style={{color:'#bfa335'}}>None detected</span>
                    ) : (
                      (geminiResult.symmetry || []).map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center text-xs font-medium rounded-full px-2 py-1" style={{background:'linear-gradient(90deg,#fffde7,#ffe082)', color:'#bfa335', boxShadow:'0 1px 8px #fff'}}>{s}</span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm" style={{color:'#bfa335'}}>Spiritual / Context</div>
                  <div className="mt-1 text-sm" style={{color:'#3a2a0a'}}>{geminiResult.spiritual ?? 'Not available'}</div>
                  {geminiResult.spiritualAssessment && (
                    <div className="mt-2 text-xs grid grid-cols-2 gap-2">
                      <div className="p-2 rounded" style={{background:'#fffde7', color:'#bfa335'}}><div className="font-medium">Home</div><div>{geminiResult.spiritualAssessment.home}</div></div>
                      <div className="p-2 rounded" style={{background:'#fffde7', color:'#bfa335'}}><div className="font-medium">Shop</div><div>{geminiResult.spiritualAssessment.shop}</div></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm" style={{color:'#bfa335'}}>Explanation</div>
                  <div className="mt-1 text-sm leading-relaxed" style={{color:'#3a2a0a'}}>{geminiResult.explanation ?? '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs" style={{color:'#bfa335'}}>Comparison: dataset vs Gemini</div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="px-3 py-1 rounded text-xs" style={{background:'#fffde7', color:'#bfa335'}}>
                  <div className="font-medium">Dataset</div>
                  <div>{datasetResult?.kolam_type ?? '—'}</div>
                </div>
                <div className="px-3 py-1 rounded text-xs" style={{background:'#fffde7', color:'#bfa335'}}>
                  <div className="font-medium">Gemini</div>
                  <div>{geminiResult.kolamTypeNormalized ?? geminiResult.kolamType ?? '—'}</div>
                </div>
                {/* Always show Dataset reanalysis button when geminiResult is present. */}
                <Button
                  className="button whitespace-normal"
                  style={{ width: 'auto', minWidth: 280, paddingLeft: '0rem', paddingRight: '0rem', background: 'linear-gradient(90deg, #bfa335 0%, #ffd700 100%)', boxShadow: '0 3rem 3rem rgba(191,163,53,0.15), 0 1rem 1rem -0.6rem rgba(255,215,0,0.18)', color: '#3a2a0a', fontWeight:600 }}
                  onClick={async () => {
                    if (!file) return;
                    setReanalyzing(true);
                    setProgress(10);
                    try {
                      const form = new FormData();
                      form.append('image', file);
                      const t1 = setTimeout(() => setProgress(40), 300);
                      const t2 = setTimeout(() => setProgress(70), 900);
                      const backendUrl = process.env.NEXT_PUBLIC_KOLAM_BACKEND_URL || 'https://kolambackend.onrender.com';
                      const res = await fetch(`${backendUrl}/analyze`, { method: 'POST', body: form });
                      clearTimeout(t1);
                      clearTimeout(t2);
                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || 'Dataset reanalysis failed');
                      }
                      const data = await res.json();
                      setDatasetResult(data);
                    } catch (e: any) {
                      setError(e?.message || 'Failed to re-analyze with dataset');
                    } finally {
                      setProgress(100);
                      setReanalyzing(false);
                    }
                  }}
                  disabled={reanalyzing}
                >
                  <div className="wrap">
                    <p style={{color:'#2d1a00', textShadow:'0 1px 8px #fff', fontWeight:700}}>
                      <span style={{color:'#bfa335'}}>✧</span>
                      <span style={{color:'#bfa335'}}>✦</span>
                      {reanalyzing ? 'Re-analyzing…' : 'Re-analyze with Dataset'}
                    </p>
                  </div>
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
        />
        {showKarmaModal && (
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
        {/* Footer is now handled globally in layout.tsx */}
      </main>
      </div>
    </div>
  )
}
