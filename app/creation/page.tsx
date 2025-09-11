
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
import { createClient } from '@supabase/supabase-js';
import { computePHashFromBuffer } from '@/lib/image-hash';

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
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

  // Generate Kolam (text-to-image or image-to-image)
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResultImage(null);
    setResultText(null);
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
        // Remove only after successful generation
        sessionStorage.removeItem("kolam_variant_image");
      } else {
        // Text-to-image generation
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
      // Show modal after successful variant recreation
      if (data.imageUrl && data.details) {
        setShowPostModal(true);
      }
      // Show modal after successful generation
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
    <div>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-2">Kolam Generator</h1>
        <p className="text-muted-foreground mb-6">Create a Kolam pattern by choosing options or uploading an image. Responsive for laptop and mobile.</p>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="bg-teal-50 border-teal-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-teal-700">Kolam Options</CardTitle>
              <CardDescription className="text-teal-600">Choose design parameters or upload an image.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Kolam Type</label>
                  <select name="kolamType" value={form.kolamType} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {kolamTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Grid Size</label>
                  <select name="gridSize" value={form.gridSize} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {gridSizes.filter(s => s).map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Symmetry Type</label>
                  <select name="symmetryType" value={form.symmetryType} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {symmetryTypes.filter(s => s).map((sym) => (
                      <option key={sym} value={sym}>{sym}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Path Style / Line Rules</label>
                  <select name="pathStyle" value={form.pathStyle} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {pathStyles.filter(s => s).map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Dot Grid Type</label>
                  <select name="dotGridType" value={form.dotGridType} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {dotGridTypes.filter(s => s).map((dot) => (
                      <option key={dot} value={dot}>{dot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Cultural Use / Context</label>
                  <select name="culturalContext" value={form.culturalContext} onChange={handleChange} className="w-full border-teal-300 rounded px-2 py-2 bg-teal-50 text-teal-900 focus:ring-2 focus:ring-teal-400">
                    <option value="">(Random)</option>
                    {culturalContexts.filter(s => s).map((ctx) => (
                      <option key={ctx} value={ctx}>{ctx}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-teal-700">Or upload an image</label>
                  <Input type="file" accept="image/*" onChange={handleImage} className="bg-teal-50 text-teal-900 border-teal-300 focus:ring-2 focus:ring-teal-400" />
                  {variantImage && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Image loaded for variant creation:</span>
                      <Image src={variantImage || '/default-kolam.png'} alt="Variant Preview" width={400} height={160} className="w-full max-h-40 object-contain border rounded mt-1" />
                    </div>
                  )}
                </div>
                <Button type="button" onClick={handleGenerate} disabled={loading} className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold border-teal-700">
                  {loading ? "Generating…" : variantImage ? "Create Variant" : "Generate Kolam"}
                </Button>
              </form>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Generated Kolam and details</CardDescription>
            </CardHeader>
            <CardContent>
              {resultImage ? (
                <div className="flex flex-col items-center gap-4">
                  <Image src={resultImage} alt="Generated Kolam" width={400} height={400} className="rounded-lg border object-contain max-h-80 w-full" />
                  <Button type="button" onClick={handleRecreateVariant} disabled={loading} className="w-full">
                    {loading ? "Creating Variant…" : "Recreate Variant"}
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground text-center">No Kolam generated yet.</div>
              )}
              {resultText && (
                <div className="mt-4 p-3 rounded bg-muted/10 text-sm text-foreground/90">
                  <strong>Details:</strong> {resultText}
                </div>
              )}
            </CardContent>
          </Card>
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
              const user = await supabase.auth.getUser();
              const userId = user.data?.user?.id;
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
      <Footer />
    </div>
  );
}
