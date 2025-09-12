"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { startKolamAR } from "@/lib/ar-kolam-webxr";
import { startKolamARjs } from "@/lib/ar-kolam-arjs";
;

export default function ARKolamDesigner() {
  const [kolamImg, setKolamImg] = useState<string | null>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file);
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const img = new window.Image();
        img.src = ev.target?.result as string;
        img.onload = async () => {
          try {
            // Remove background
 
            // Convert Blob to data URL for preview and AR
;
            setKolamImg(img.src);
            setImgError(null);
            console.log('Background removed, preview set');
          } catch (err) {
            console.warn('Background removal failed:', err);
            // Fallback: use original image if background removal fails
            setKolamImg(img.src);
            setImgError('Background removal failed, showing original image.');
          }
        };
        img.onerror = () => {
          setImgError('Failed to load image preview.');
          setKolamImg(null);
        };
      };
      reader.onerror = () => {
        setImgError('Failed to read image file.');
        setKolamImg(null);
      };
      reader.readAsDataURL(file);
    } else {
      setImgError('No file selected.');
      setKolamImg(null);
    }
  }

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
          />
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
              // Try WebXR AR first
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
