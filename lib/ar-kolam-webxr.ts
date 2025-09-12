// Minimal WebXR + three.js AR starter for Kolam placement
// This module exports a function to launch AR and place an image on the floor
'use client';
import * as THREE from 'three';

export async function startKolamAR(kolamImg: string) {
  // Detect desktop/laptop
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  if (!isMobile) {
    alert('Kolam AR is only available on mobile devices. Please use your phone or tablet to try this feature.');
    return;
  }
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
    // If Android, show camera overlay (same as iOS fallback)
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.indexOf('android') > -1;
    if (isAndroid) {
      // Camera overlay logic (similar to ar-kolam-arjs.tsx)
      const overlayWindow = window.open('', '_blank');
      if (overlayWindow) {
        overlayWindow.document.write(`
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
              <title>Kolam Camera Overlay</title>
              <style>
                html,body { height: 100%; margin: 0; overscroll-behavior: none; -webkit-user-select: none; -webkit-touch-callout: none; }
                body { overflow: hidden; background: #000; }
                #kolamImg { position: absolute; display: none; pointer-events: auto; z-index: 10; touch-action: none; transform-origin: center center; }
                #tapOverlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 9; background: transparent; touch-action: none; }
              </style>
            </head>
            <body>
              <video id="kolamCam" autoplay playsinline style="width:100vw;height:100vh;object-fit:cover;position:fixed;top:0;left:0;"></video>
              <div id="tapOverlay"></div>
              <img id="kolamImg" src="${kolamImg}" width="360" height="360" />
              <div style="position:fixed;bottom:10px;left:0;width:100%;text-align:center;color:#fff;background:rgba(0,0,0,0.5);font-size:14px;padding:8px;z-index:999;">
                Tap anywhere on the camera to place your Kolam image.<br>Drag to move, pinch to resize the Kolam (not the camera).<br>Marker AR may not be available on iOS. For best AR, use Android Chrome or Quick Look on iOS.
              </div>
              <script>
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
                  document.getElementById('kolamCam').srcObject = stream;
                }).catch(function(){ /* ignore */ });
                var overlay = document.getElementById('tapOverlay');
                var img = document.getElementById('kolamImg');
                var dragging = false, startX = 0, startY = 0, imgLeft = 0, imgTop = 0, startDist = 0, startSize = 360;
                function setImgPos(x, y) {
                  img.style.left = (x - img.width/2) + 'px';
                  img.style.top = (y - img.height/2) + 'px';
                  imgLeft = x - img.width/2;
                  imgTop = y - img.height/2;
                }
                overlay.addEventListener('touchstart', function(e) {
                  e.preventDefault();
                  if (e.touches.length === 1) {
                    var touch = e.touches[0];
                    img.style.display = 'block';
                    setImgPos(touch.clientX, touch.clientY);
                    dragging = true;
                    startX = touch.clientX;
                    startY = touch.clientY;
                  } else if (e.touches.length === 2) {
                    startDist = Math.hypot(
                      e.touches[0].clientX - e.touches[1].clientX,
                      e.touches[0].clientY - e.touches[1].clientY
                    );
                    startSize = img.width;
                  }
                }, { passive: false });
                overlay.addEventListener('touchmove', function(e) {
                  e.preventDefault();
                  if (dragging && e.touches.length === 1) {
                    setImgPos(e.touches[0].clientX, e.touches[0].clientY);
                  } else if (e.touches.length === 2) {
                    var dist = Math.hypot(
                      e.touches[0].clientX - e.touches[1].clientX,
                      e.touches[0].clientY - e.touches[1].clientY
                    );
                    var newSize = Math.max(80, Math.min(800, Math.round(startSize * dist / startDist)));
                    var centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    var centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                    img.width = newSize;
                    img.height = newSize;
                    setImgPos(centerX, centerY);
                  }
                }, { passive: false });
                overlay.addEventListener('touchend', function(e) {
                  dragging = false;
                });
                overlay.addEventListener('click', function(e) {
                  img.style.display = 'block';
                  setImgPos(e.clientX, e.clientY);
                });
              </script>
            </body>
          </html>
        `);
      }
    } else {
      alert('Failed to start AR session: ' + err);
    }
  }
}
