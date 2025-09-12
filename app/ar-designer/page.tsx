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
        <main className="container py-12">
          <h1 className="text-3xl font-bold mb-4">AR Kolam Designer 🪄</h1>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded">
            <b>Kolam AR is only available on mobile devices.</b><br />
            Please use your phone or tablet to place Kolam designs in Augmented Reality.<br />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Mobile UI
  return (
    <div>
      <Navbar />
      <main className="container py-12">
        <h1 className="text-3xl font-bold mb-4">AR Kolam Designer 🪄</h1>
        <p className="mb-6 text-muted-foreground">
          Upload your Kolam/Rangoli design and place it in AR using your phone&apos;s camera.<br/>
          <span className="block mt-2 text-sm text-blue-700">For best experience: <b>Android Chrome</b> or iOS Safari.<br/>
          <b>Floor placement</b> requires ARCore/ARKit/WebXR support.<br/>
          <b>Marker AR</b> works everywhere: Point your camera at the <a href="https://ar-js-org.github.io/AR.js-Docs/marker-training/examples/hiro-marker.png" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Hiro marker</a> to see your Kolam appear.</span>
        </p>
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mb-2"
            disabled={loading}
          />
          {loading && (
            <div className="text-blue-600 text-sm mb-2">Removing background, please wait…</div>
          )}
          {imgError && (
            <div className="text-red-600 text-sm mb-2">{imgError}</div>
          )}
          {kolamImg && (
            <div className="mb-4">
              <Image src={kolamImg} alt="Kolam preview" width={300} height={300} className="max-w-xs rounded shadow" />
            </div>
          )}
        </div>
        {kolamImg && (
          <Button
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
            Start AR Placement
          </Button>
        )}
      </main>
      <Footer />
    </div>
  );
}
