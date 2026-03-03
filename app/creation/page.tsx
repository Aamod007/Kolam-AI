"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { CommunityPostModal } from "@/components/community/CommunityPostModal";
import ReactConfetti from 'react-confetti';
import { computePHashFromBuffer } from '@/lib/image-hash';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// Exhaustive Kolam type list
const kolamTypes = [
  "Pulli Kolam (Dot-Based Kolam)",
  "Sikku Kolam (Chikku or Knot Kolam)",
  "Kambi Kolam (Line or Wire-Like Kolam)",
  "Neli Kolam (Curvy or Slithering Kolam)",
  "Kodu Kolam (Tessellated Kolam)",
  "Padi Kolam (Manai Kolam or Step Kolam)",
  "Idukku Pulli Kolam (Oodu Pulli or Idai Pulli)",
  "Kanya Kolam",
  "Freehand Kolam",
  "Maa Kolam (Wet Flour Kolam)",
  "Kavi/Semman Kolam",
  "Poo Kolam (Pookolam or Flower Kolam)",
  "Nalvaravu Kolam (Welcoming Kolam)",
  "Thottil Kolam (Cradle Kolam)",
  "Ratha Kolam (Chariot Kolam)",
  "Navagraha Kolam (Nine Planets Kolam)",
  "Swastika Kolam",
  "Star Kolam (Nakshatra Kolam)",
  "Kottu Kolam (Box or Compartment Kolam)",
  "Vinayagar Kolam (Ganesha Kolam)",
  "Pavitra Kolam (Sacred Thread Kolam)",
  "Muggu (Andhra Pradesh/Telangana Kolam)",
  "Alpona (Bengali Floor Art)",
  "Chowkpurana (Maharashtrian Rangoli)",
  "Aripana (Bihari Floor Art)",
  "Mandana (Rajasthan Variant)",
  "Aipan (Uttarakhand Ritual Art)",
  "Jhoti or Chita (Odisha Floor Art)",
  "Sathiya (Gujarat Swastika-Based)",
  "Murja (Odisha Tulsi Art)",
  "Hase (Karnataka Rangoli)",
  "Mandala Kolam",
  "Celtic Knot Kolam",
  "Musical Kolam",
  "3D Kolam",
  "Kolam with Numbers or Letters",
  "Eco-Friendly Kolam",
  "Digital Kolam",
  "Other"
];
const gridSizes = ["", "Small (3x3)", "Medium (5x5)", "Large (7x7)", "Extra Large (9x9 or bigger)"];
const symmetryTypes = [
  "None",                  // No symmetry
  "Vertical",              // Mirror across vertical axis
  "Horizontal",            // Mirror across horizontal axis
  "Diagonal",              // Mirror across diagonal axis
  "Reflective",            // General mirror symmetry
  "90° Rotational Symmetry",
  "180° Rotational Symmetry",
  "360° Rotational Symmetry",            // Rotational symmetry (any order)
  "Radial",                // Symmetry from a central point
  "Point",                 // 180° rotation symmetry
  "Cyclic",                // Repeating around a central point (e.g., C6)
  "Translational",         // Repeats across space
  "Glide Reflection",      // Slide + reflect
  "Fractal",               // Self-similar at different scales
  "Tessellation",          // Space-filling patterns
  "Bilateral"              // One-axis mirror symmetry (optional: synonym)
];

const pathStyles = [
  "Continuous",       // One unbroken line
  "Broken",           // Made of multiple line segments
  "Looped",           // Contains loops (open or closed)
  "Freehand",         // Drawn without a fixed grid
  "Branched",         // Paths that split or fork
  "Concentric",       // Rings centered around a point
  "Interlaced",       // Over-under weaving (like knots)
  "Geometric",        // Straight lines or fixed-angle turns
  "Spiral",           // Lines spiral in/out
  "Tiled",            // Repeated units like tiles
  "Radial",           // Radiating from center
  "Symmetric Path"    // Follows a symmetry rule in path direction
];

const dotGridTypes = [
  "Square Grid",       // Orthogonal dot layout
  "Diamond Grid",      // Square grid rotated 45°
  "Triangular Grid",   // Triangle lattice (like Pascal's Triangle layout)
  "Hexagonal Grid",    // Honeycomb-style grid
  "Circular Grid",     // Concentric rings of dots
  "Random Dots",       // Arbitrary dot placement
  "No Dots (Freehand)" // Dot-less drawing
];

const culturalContexts = [
  "Daily Ritual",
  "Festival Kolam",
  "Wedding / Auspicious",
  "Spiritual / Sacred",
  "Competitions / Exhibitions",
  "Educational / Teaching",
  "Recreational / Meditative",
  "Modern / Contemporary",
  "Other"
];

export default function KolamCreationPage() {
  // All hooks at top
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    kolamType: "",
    gridSize: "",
    symmetryType: "",
    pathStyle: "",
    dotGridType: "",
    culturalContext: "",
    image: null as File | null,
  });
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showKarmaModal, setShowKarmaModal] = useState(false);
  const [karmaPoints, setKarmaPoints] = useState<number | null>(null);
  const [generationMode, setGenerationMode] = useState<'algorithmic' | 'ai'>('algorithmic');
  const [metadata, setMetadata] = useState<any>(null);
  const [colorTheme, setColorTheme] = useState('traditional');
  const [lineWidth, setLineWidth] = useState(2.5);
  const [dotSize, setDotSize] = useState(4);
  const [animateDrawing, setAnimateDrawing] = useState(false);
  const [svgRaw, setSvgRaw] = useState<string | null>(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      setUser(session.user);
      setAuthChecked(true);
    }
  }, [status, router]);

  // On mount, check for variant image from recognition page
  useEffect(() => {
    const img = sessionStorage.getItem("kolam_variant_image");
    if (img) {
      setVariantImage(img);
    }
    // Clean up image from sessionStorage if user leaves the page
    return () => {
      sessionStorage.removeItem("kolam_variant_image");
    };
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display">
        <div className="max-w-md w-full mx-auto text-center">
          <Card className="p-8 shadow-xl rounded-2xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 backdrop-blur">
            <h1 className="text-3xl font-bold font-serif text-muted-foreground drop-shadow mb-4">Redirecting…</h1>
            <p className="text-base text-white/80 font-display drop-shadow mb-2">Please wait while we redirect you to sign in.</p>
            <div className="flex justify-center mt-4">
              <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  if (!user) return null;

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image upload and convert to base64
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVariantImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Kolam (algorithmic or AI-assisted)
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResultImage(null);
    setResultText(null);
    setMetadata(null);
    setSvgRaw(null);
    try {
      let response;
      // Randomly select values for any blank field
      const randomValue = (arr: string[]) => arr.filter(v => v && v !== "").sort(() => 0.5 - Math.random())[0];
      const filledForm = {
        kolamType: form.kolamType || randomValue(kolamTypes),
        gridSize: form.gridSize || randomValue(gridSizes),
        symmetryType: form.symmetryType || randomValue(symmetryTypes),
        pathStyle: form.pathStyle || randomValue(pathStyles),
        dotGridType: form.dotGridType || randomValue(dotGridTypes),
        culturalContext: form.culturalContext || randomValue(culturalContexts),
        image: form.image,
      };
      if (variantImage) {
        // Image-to-image variant generation (send base64)
        response = await fetch("/api/generate-kolam-variant", {
          method: "POST",
          body: JSON.stringify({ image: variantImage }),
          headers: { "Content-Type": "application/json" },
        });
        sessionStorage.removeItem("kolam_variant_image");
      } else if (generationMode === 'algorithmic') {
        // ALGORITHMIC generation — uses KolamEngine with L-systems, symmetry transforms
        response = await fetch("/api/generate-algorithmic", {
          method: "POST",
          body: JSON.stringify({ ...filledForm, theme: colorTheme, animate: animateDrawing, lineWidth, dotSize }),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // AI-assisted generation via Gemini
        response = await fetch("/api/generate-kolam", {
          method: "POST",
          body: JSON.stringify(filledForm),
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResultImage(data.imageUrl || null);
      setResultText(data.details || null);
      if (data.metadata) setMetadata(data.metadata);
      if (data.svg) setSvgRaw(data.svg);
      if (data.imageUrl && data.details) {
        setShowPostModal(true);
      }
    } catch (e: any) {
      setError(e.message || "Failed to generate Kolam");
    } finally {
      setLoading(false);
    }
  };

  // Recreate variant from generated image
  const handleRecreateVariant = async () => {
    if (!resultImage) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-kolam-variant", {
        method: "POST",
        body: JSON.stringify({ image: resultImage }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setResultImage(data.imageUrl || null);
      setResultText(data.details || null);
      // Always open modal after variant recreation
      if (data.imageUrl && data.details) {
        setShowPostModal(true);
      }
    } catch (e: any) {
      setError(e.message || "Failed to create variant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-display">
      <Navbar />
      <main className="container py-10 flex flex-col items-start justify-start">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-2 md:px-6 lg:px-8 xl:px-12">
          <div className="mb-10 text-left">
            <h1
              className="text-4xl md:text-5xl font-extrabold font-serif mb-4 text-center tracking-widest uppercase border-b-4 border-yellow-500 pb-2"
              style={{
                fontFamily: 'Georgia, serif',
                color: '#FFD700',
                letterSpacing: '0.12em',
                textShadow: '0 2px 12px rgba(255,215,0,0.7), 0 1px 0 #fff',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              Kolam Generator 🪔
            </h1>
            <p
              className="text-lg md:text-xl font-bold font-serif mb-2 text-center tracking-wide"
              style={{
                color: '#FFD700',
                textShadow: '0 2px 8px rgba(255,215,0,0.7), 0 1px 0 #fff',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              Create a Kolam pattern by choosing options or uploading an image.<br className="hidden md:inline" />Responsive for laptop and mobile.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] border-4 border-yellow-500 shadow-2xl rounded-3xl relative overflow-hidden">
              {/* Kolam motif background */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
              <CardHeader>
                <CardTitle className="text-yellow-700 font-extrabold font-serif text-2xl">Kolam Options</CardTitle>
                <CardDescription className="text-yellow-700 font-bold">Choose design parameters or upload an image.</CardDescription>
              </CardHeader>
              {/* Generation Mode Toggle */}
              <div className="px-6 pb-2">
                <label className="block text-sm font-bold mb-2 text-yellow-700 font-serif">Generation Method</label>
                <div className="flex gap-1 p-1 rounded-xl bg-yellow-100 border-2 border-yellow-400">
                  <button type="button" onClick={() => setGenerationMode('algorithmic')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-extrabold font-serif transition-all ${generationMode === 'algorithmic'
                      ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white shadow-lg'
                      : 'text-yellow-700 hover:bg-yellow-200'
                      }`}>
                    🧮 Algorithmic
                  </button>
                  <button type="button" onClick={() => setGenerationMode('ai')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-extrabold font-serif transition-all ${generationMode === 'ai'
                      ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white shadow-lg'
                      : 'text-yellow-700 hover:bg-yellow-200'
                      }`}>
                    ✨ AI-Assisted
                  </button>
                </div>
                <p className="text-xs mt-1 text-yellow-600 font-serif">
                  {generationMode === 'algorithmic'
                    ? '🧮 Uses L-systems, symmetry transforms & graph theory — your own algorithms'
                    : '✨ Uses Gemini AI to generate Kolam images from text prompts'}
                </p>
              </div>
              <CardContent>
                <form className="space-y-4">
                  {/* ...existing code for form fields... */}
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Kolam Type</label>
                    <select name="kolamType" value={form.kolamType} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {kolamTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {/* ...repeat for other select fields, updating colors to cyan/blue and rounded-lg... */}
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Grid Size</label>
                    <select name="gridSize" value={form.gridSize} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {gridSizes.filter(s => s).map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Symmetry Type</label>
                    <select name="symmetryType" value={form.symmetryType} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {symmetryTypes.filter(s => s).map((sym) => (
                        <option key={sym} value={sym}>{sym}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Path Style / Line Rules</label>
                    <select name="pathStyle" value={form.pathStyle} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {pathStyles.filter(s => s).map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Dot Grid Type</label>
                    <select name="dotGridType" value={form.dotGridType} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {dotGridTypes.filter(s => s).map((dot) => (
                        <option key={dot} value={dot}>{dot}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Cultural Use / Context</label>
                    <select name="culturalContext" value={form.culturalContext} onChange={handleChange} className="w-full border-yellow-400 rounded-xl px-2 py-2 bg-yellow-50 text-yellow-900 font-serif focus:ring-2 focus:ring-yellow-400">
                      <option value="">(Random)</option>
                      {culturalContexts.filter(s => s).map((ctx) => (
                        <option key={ctx} value={ctx}>{ctx}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-yellow-700 font-serif">Or upload an image</label>
                    <Input type="file" accept="image/*" onChange={handleImage} className="bg-yellow-50 text-yellow-900 border-yellow-400 focus:ring-2 focus:ring-yellow-400 rounded-xl font-serif" />
                    {variantImage && (
                      <div className="mt-2">
                        <span className="text-xs text-yellow-700 font-serif">Image loaded for variant creation:</span>
                        <Image src={variantImage || '/default-kolam.png'} alt="Variant Preview" width={400} height={160} className="w-full max-h-40 object-contain border-2 border-yellow-400 rounded-2xl mt-1" />
                      </div>
                    )}
                  </div>
                  {/* Advanced Algorithmic Controls */}
                  {generationMode === 'algorithmic' && (
                    <div className="space-y-3 p-3 rounded-xl bg-yellow-100/60 border border-yellow-300">
                      <p className="text-xs font-bold text-yellow-700 font-serif">⚙️ Advanced Controls</p>
                      {/* Color Theme Picker */}
                      <div>
                        <label className="block text-xs font-bold mb-1 text-yellow-700 font-serif">Color Theme</label>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { id: 'traditional', label: '🪔 Traditional', colors: ['#8B4513', '#FFF8E1'] },
                            { id: 'royal', label: '👑 Royal', colors: ['#FFD700', '#1a0033'] },
                            { id: 'festival', label: '🎉 Festival', colors: ['#DC143C', '#fff0f5'] },
                            { id: 'sacred', label: '🙏 Sacred', colors: ['#CD853F', '#FFF8DC'] },
                            { id: 'earth', label: '🌿 Earth', colors: ['#556B2F', '#f5f5dc'] },
                            { id: 'monochrome', label: '⬛ Mono', colors: ['#1a1a1a', '#ffffff'] },
                          ].map(t => (
                            <button key={t.id} type="button" onClick={() => setColorTheme(t.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold font-serif border-2 transition-all ${colorTheme === t.id ? 'border-yellow-600 shadow-lg scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                              style={{ background: t.colors[1] }}>
                              <span className="w-3 h-3 rounded-full border" style={{ background: t.colors[0] }} />
                              <span style={{ color: t.colors[0] }}>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Line Width Slider */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-yellow-700 font-serif w-24">Line Width</label>
                        <input type="range" min="1" max="6" step="0.5" value={lineWidth}
                          onChange={e => setLineWidth(parseFloat(e.target.value))}
                          className="flex-1 accent-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700 w-8 text-right">{lineWidth}px</span>
                      </div>
                      {/* Dot Size Slider */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-yellow-700 font-serif w-24">Dot Size</label>
                        <input type="range" min="2" max="8" step="1" value={dotSize}
                          onChange={e => setDotSize(parseInt(e.target.value))}
                          className="flex-1 accent-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700 w-8 text-right">{dotSize}px</span>
                      </div>
                      {/* Animate Toggle */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-yellow-700 font-serif w-24">Animate</label>
                        <button type="button" onClick={() => setAnimateDrawing(!animateDrawing)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${animateDrawing ? 'bg-yellow-500' : 'bg-yellow-200'
                            }`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${animateDrawing ? 'translate-x-5' : 'translate-x-0.5'
                            }`} />
                        </button>
                        <span className="text-xs text-yellow-600 font-serif">{animateDrawing ? 'Step-by-step drawing' : 'Instant render'}</span>
                      </div>
                    </div>
                  )}
                  <Button type="button" onClick={handleGenerate} disabled={loading} className="w-full mt-2 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105 border-yellow-700 rounded-2xl font-serif">
                    {loading ? "Generating…" : variantImage ? "Create Variant" : "🧮 Generate Kolam"}
                  </Button>
                </form>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] dark:bg-yellow-900 rounded-3xl shadow-2xl border-4 border-yellow-500 relative overflow-hidden">
              {/* Kolam motif background */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
              <CardHeader>
                <CardTitle className="font-extrabold font-serif text-yellow-700 text-2xl">Result</CardTitle>
                <CardDescription className="font-bold text-yellow-700">
                  {metadata ? `${metadata.template} pattern • ${metadata.dotCount} dots • ${metadata.lineCount} lines` : 'Generated Kolam and details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultImage ? (
                  <div className="flex flex-col items-center gap-4">
                    {svgRaw ? (
                      <div className="rounded-2xl border-4 border-yellow-400 overflow-hidden max-h-80 w-full bg-yellow-50 shadow-xl flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svgRaw }} />
                    ) : (
                      <img src={resultImage} alt="Generated Kolam" width={400} height={400} className="rounded-2xl border-4 border-yellow-400 object-contain max-h-80 w-full bg-yellow-50 shadow-xl" />
                    )}
                    {/* Download Buttons (algorithmic mode) */}
                    {svgRaw && (
                      <div className="flex gap-2 w-full">
                        <Button type="button" className="flex-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-400 hover:bg-yellow-200 font-bold font-serif rounded-xl text-sm"
                          onClick={() => {
                            const blob = new Blob([svgRaw], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `kolam-${metadata?.template || 'pattern'}.svg`;
                            a.click(); URL.revokeObjectURL(url);
                          }}>📥 Download SVG</Button>
                        <Button type="button" className="flex-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-400 hover:bg-yellow-200 font-bold font-serif rounded-xl text-sm"
                          onClick={() => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            const img = new window.Image();
                            img.onload = () => {
                              canvas.width = img.width * 2; canvas.height = img.height * 2;
                              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                              const a = document.createElement('a');
                              a.href = canvas.toDataURL('image/png'); a.download = `kolam-${metadata?.template || 'pattern'}.png`;
                              a.click();
                            };
                            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgRaw)));
                          }}>📥 Download PNG</Button>
                      </div>
                    )}
                    <Button type="button" onClick={handleRecreateVariant} disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105 rounded-2xl font-serif">
                      {loading ? "Creating Variant…" : "Recreate Variant"}
                    </Button>
                    <Button type="button" disabled={loading} onClick={async () => {
                      setLoading(true);
                      try {
                        // Convert image URL to blob
                        const imgRes = await fetch(resultImage);
                        const imgBlob = await imgRes.blob();
                        const formData = new FormData();
                        formData.append('file', imgBlob, 'kolam.png');
                        // Send to remove.bg API route
                        const res = await fetch('/api/removebackground', {
                          method: 'POST',
                          body: formData,
                        });
                        if (!res.ok) {
                          alert('Background removal failed.');
                          setLoading(false);
                          return;
                        }
                        const arBlob = await res.blob();
                        // Convert blob to base64 data URL
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64Url = reader.result as string;
                          sessionStorage.setItem('kolam_ar_image', base64Url);
                          window.location.href = '/ar-designer?from=creation';
                        };
                        reader.readAsDataURL(arBlob);
                      } catch (err) {
                        alert('Failed to prepare AR visualization.');
                        setLoading(false);
                      }
                    }} className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 transition-all duration-200 transform hover:scale-105 mt-2 rounded-2xl font-serif">
                      {loading ? "Preparing AR…" : "🪄 Visualize in AR"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-yellow-700 text-center font-bold">No Kolam generated yet.</div>
                )}
                {resultText && (
                  <div className="mt-4 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900 text-sm border-2 border-yellow-400 font-serif" style={{ color: '#8B6914' }}>
                    <pre className="whitespace-pre-wrap font-serif" style={{ color: '#5c4a1e' }}>{resultText}</pre>
                  </div>
                )}
                {/* Graph Metrics (algorithmic mode) */}
                {metadata && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-serif">
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{metadata.dotCount}</div>
                      <div className="text-yellow-600">Dots (Nodes)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{metadata.lineCount}</div>
                      <div className="text-yellow-600">Lines (Edges)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{metadata.isEulerian ? '✅' : '❌'}</div>
                      <div className="text-yellow-600">Eulerian Path</div>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{metadata.holeCount}</div>
                      <div className="text-yellow-600">Closed Loops</div>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{metadata.connectedComponents}</div>
                      <div className="text-yellow-600">Components</div>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300 text-center">
                      <div className="text-xl font-black text-yellow-700">{(metadata.complexityScore * 100).toFixed(0)}%</div>
                      <div className="text-yellow-600">{metadata.complexityLabel}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Modal for posting to Community Hub */}
        <CommunityPostModal
          image={resultImage || ""}
          details={resultText || ""}
          open={showPostModal}
          onClose={() => setShowPostModal(false)}
          onPost={async (description) => {
            try {
              // Get userId from your auth/session (replace with your logic)
              const userId = (user as any)?.id;
              if (!userId) throw new Error('User not logged in');

              // Call API route to handle post logic
              const res = await fetch('/api/community-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: resultImage, description, userId })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to post');

              // Wait for karma update to propagate, then fetch updated points
              setTimeout(async () => {
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
        {/* Karma Modal */}
        {showKarmaModal && (
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
        )}
      </main>
      {/* Footer is now handled globally in layout.tsx */}
    </div>
  );
}
