"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { startKolamAR } from "@/lib/ar-kolam-webxr";
import { startKolamARjs } from "@/lib/ar-kolam-arjs";
// import { removeBackground } from "@/lib/bodypix-loader";
;

export default function ARKolamDesigner() {
  const [kolamImg, setKolamImg] = useState<string | null>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load AR image from sessionStorage if redirected from creation page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const arImg = sessionStorage.getItem('kolam_ar_image');
      if (arImg) {
        setKolamImg(arImg);
        sessionStorage.removeItem('kolam_ar_image');
      }
    }
  }, []);

  // Check for WebXR support
  useEffect(() => {
    if (typeof window !== "undefined" && (navigator as any).xr) {
      (navigator as any).xr.isSessionSupported("immersive-ar").then((supported: boolean) => {
        setArSupported(supported);
      });
    } else {
      setArSupported(false);
    }
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImgError(null);
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setImgError('No file selected.');
      setKolamImg(null);
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/removebackground', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        setImgError(error.error || 'Background removal failed.');
        setKolamImg(null);
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setKolamImg(url);
      setImgError(null);
    } catch (err) {
      setImgError('Background removal failed, showing original image.');
      setKolamImg(null);
    }
    setLoading(false);
  }

  // Detect desktop/laptop
  const [isMobile, setIsMobile] = useState<null | boolean>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
    }
  }, []);

  if (isMobile === null) {
    // Render nothing or a loading spinner until device type is known
    return null;
  }

  if (!isMobile) {
    return (
      <div>
        <Navbar />
        <main className="container py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold font-serif text-muted-foreground drop-shadow-xl mb-2 tracking-tight leading-tight">
                AR Kolam Visualizer 🪄
              </h1>
              <p className="text-lg text-muted-foreground font-serif mb-2 drop-shadow">Kolam AR is only available on mobile devices.</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 border border-cyan-300 text-gray-800 p-5 rounded-2xl mb-6 shadow flex flex-col items-center">
              <span className="text-base font-semibold font-display tracking-tight mb-1">Please use your phone or tablet to place Kolam designs in Augmented Reality.</span>
            </div>
          </div>
        </main>
        {/* Footer is now handled globally in layout.tsx */}
      </div>
    );
  }

  // Mobile UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 font-display">
      <Navbar />
      <main className="container py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold font-serif text-muted-foreground drop-shadow-xl mb-2 tracking-tight leading-tight">
              AR Kolam Visualizer 🪄
            </h1>
            <p className="text-lg text-white/80 font-display mb-2 drop-shadow">Upload your Kolam/Rangoli design and place it in AR using your phone&apos;s camera.</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 border border-cyan-300 text-gray-800 p-5 rounded-2xl mb-6 shadow flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-base font-semibold font-display tracking-tight">Best Experience</span>
            </div>
            <div className="text-sm font-medium mb-1">Use <span className="text-cyan-700 font-bold">Android Chrome</span> or <span className="text-cyan-700 font-bold">iOS Safari</span></div>
            <div className="text-sm mb-1"><span className="font-bold text-cyan-700">Floor placement</span> requires ARCore/ARKit/WebXR support.</div>
            <div className="text-sm"><span className="font-bold text-cyan-700">Marker AR</span> works everywhere: Point your camera at the <a href="https://ar-js-org.github.io/AR.js-Docs/marker-training/examples/hiro-marker.png" target="_blank" rel="noopener noreferrer" className="underline text-cyan-600">Hiro marker</a> to see your Kolam appear.</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mb-6 border">
            <div className="bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-cyan-950 dark:to-blue-950 rounded-2xl shadow-xl p-6 border border-cyan-200">
              <label htmlFor="kolam-upload" className="flex items-center gap-2 text-lg font-bold text-cyan-700 mb-4 font-display tracking-tight">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 16v-8m0 8l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Upload Kolam Image
              </label>
              <input
                id="kolam-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="w-full border border-cyan-300 rounded-lg px-3 py-2 mb-3 focus-visible:ring-2 focus-visible:ring-cyan-400 transition bg-cyan-50 dark:bg-cyan-950 text-gray-800 dark:text-gray-100"
                disabled={loading}
              />
              {loading && (
                <div className="flex items-center gap-2 text-cyan-700 text-sm mb-2 animate-pulse font-semibold">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  Removing background, please wait…
                </div>
              )}
              {imgError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mb-2 animate-pulse font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {imgError}
                </div>
              )}
              {kolamImg && (
                <div className="mb-4 flex flex-col items-center max-w-full overflow-hidden">
                  <Image src={kolamImg} alt="Kolam preview" width={300} height={300} className="w-full max-w-xs rounded-xl shadow-lg border-2 border-cyan-300 object-contain" />
                </div>
              )}
              {kolamImg && (
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 mt-2"
                  onClick={async () => {
                    // Detect iOS (Safari/Chrome)
                    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
                    if (isIOS) {
                      // Always use AR.js for iOS
                      startKolamARjs(kolamImg);
                      return;
                    }
                    // Try WebXR AR first for non-iOS
                    let usedWebXR = false;
                    try {
                      if ((navigator as any).xr && await (navigator as any).xr.isSessionSupported('immersive-ar')) {
                        await import('three');
                        startKolamAR(kolamImg);
                        usedWebXR = true;
                      }
                    } catch (err) {
                      // WebXR not available or failed
                    }
                    if (!usedWebXR) {
                      // Fallback to AR.js marker AR
                      startKolamARjs(kolamImg);
                    }
                  }}
                  disabled={false}
                >
                  <span className="inline-block mr-2">🪄</span> Start AR Placement
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Footer is now handled globally in layout.tsx */}
    </div>
  );
}
