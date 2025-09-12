// AR.js marker-based AR fallback for Kolam placement
// Usage: Call startKolamARjs(kolamImg) to launch AR.js view

import React from 'react';

export function startKolamARjs(kolamImg: string) {
  // Create a new window with AR.js scene
  const arWindow = window.open('', '_blank', 'width=800,height=600');
  if (!arWindow) {
    alert('Unable to open AR window');
    return;
  }
  arWindow.document.write(`
    <html>
      <head>
        <script src='https://aframe.io/releases/1.2.0/aframe.min.js'></script>
        <script src='https://cdn.jsdelivr.net/npm/ar.js@3.3.2/aframe/build/aframe-ar.js'></script>
        <style>body { margin: 0; overflow: hidden; }</style>
      </head>
      <body>
        <a-scene embedded arjs>
          <a-marker preset="hiro">
            <a-image src="${kolamImg}" width="2" height="2"></a-image>
          </a-marker>
          <a-entity camera></a-entity>
        </a-scene>
      </body>
    </html>
  `);
}
