// Minimal WebXR + three.js AR starter for Kolam placement
// This module exports a function to launch AR and place an image on the floor
'use client';
import * as THREE from 'three';

export async function startKolamAR(kolamImg: string) {
  if (!navigator.xr) {
    alert('WebXR not supported');
    return;
  }
  const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
  if (!supported) {
    alert('AR not supported on this device/browser');
    return;
  }

  // Create three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Load Kolam image as texture
  const textureLoader = new THREE.TextureLoader();
  const kolamTexture = textureLoader.load(kolamImg);
  const geometry = new THREE.PlaneGeometry(0.5, 0.5); // 0.5m x 0.5m
  const material = new THREE.MeshBasicMaterial({ map: kolamTexture, transparent: true });
  const kolamMesh = new THREE.Mesh(geometry, material);
  kolamMesh.visible = false; // Hide until placed
  scene.add(kolamMesh);

  // Reticle for floor detection
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0, transparent: true })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Start AR session
  document.body.style.background = 'transparent';
  renderer.xr.setReferenceSpaceType('local');
  document.body.appendChild(renderer.domElement);
  let xrRefSpace: XRReferenceSpace | undefined;
  let xrHitTestSource: XRHitTestSource | undefined;
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      const session = renderer.xr.getSession();
      if (!xrRefSpace) {
        const refSpace = renderer.xr.getReferenceSpace?.();
        if (refSpace) xrRefSpace = refSpace as XRReferenceSpace;
      }
      if (!xrHitTestSource && session && session.requestReferenceSpace && session.requestHitTestSource) {
        session.requestReferenceSpace('viewer').then((refSpace: XRReferenceSpace) => {
          if (session.requestHitTestSource) {
            if (typeof session.requestHitTestSource === 'function') {
              const hitTestPromise = session.requestHitTestSource?.({ space: refSpace });
              if (hitTestPromise) {
                hitTestPromise.then((source: XRHitTestSource) => {
                  xrHitTestSource = source;
                });
              }
            }
          }
        });
      }
      if (xrHitTestSource && xrRefSpace) {
        const hitTestResults = frame.getHitTestResults(xrHitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(xrRefSpace);
          if (pose && pose.transform && pose.transform.matrix) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
            // Automatically place Kolam at reticle position
            kolamMesh.position.setFromMatrixPosition(reticle.matrix);
            kolamMesh.visible = true;
            kolamMesh.rotation.set(-Math.PI / 2, 0, 0);
          } else {
            reticle.visible = false;
            kolamMesh.visible = false;
          }
        } else {
          reticle.visible = false;
          kolamMesh.visible = false;
        }
      }
    }
    renderer.render(scene, camera);
  });

  try {
    let session;
    try {
      session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor', 'depth-sensing'],
        depthSensing: {
          usagePreference: ['cpu-optimized', 'gpu-optimized'],
          dataFormatPreference: ['luminance-alpha', 'float32']
        }
      });
    } catch (e) {
      // Fallback: try without any features
      session = await (navigator as any).xr.requestSession('immersive-ar');
    }
    await (renderer.xr as any).setSession(session);
  } catch (err) {
    alert('Failed to start AR session: ' + err);
  }
}
