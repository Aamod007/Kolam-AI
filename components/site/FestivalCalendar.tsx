'use client'
import React, { useEffect, useState } from 'react';

interface FestivalEvent {
  summary: string;
  start: { date: string };
}

export default function FestivalCalendar() {
  const [festivals, setFestivals] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFestivals() {
      setLoading(true);
      try {
        const res = await fetch('/api/festivals');
        const data = await res.json();
        setFestivals(data.festivals || []);
      } catch {
        setFestivals([]);
      }
      setLoading(false);
    }
    fetchFestivals();
  }, []);

  // Find today's festival
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayFestival = festivals.find(f => f.start.date === todayStr);

  // State for generated Kolam
  const [generatedKolam, setGeneratedKolam] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Use exhaustive Kolam parameters from creation page
  const kolamTypes = [
    "Pulli Kolam (Dot-Based Kolam)", "Sikku Kolam (Chikku or Knot Kolam)", "Kambi Kolam (Line or Wire-Like Kolam)", "Neli Kolam (Curvy or Slithering Kolam)", "Kodu Kolam (Tessellated Kolam)", "Padi Kolam (Manai Kolam or Step Kolam)", "Idukku Pulli Kolam (Oodu Pulli or Idai Pulli)", "Kanya Kolam", "Freehand Kolam", "Maa Kolam (Wet Flour Kolam)", "Kavi/Semman Kolam", "Poo Kolam (Pookolam or Flower Kolam)", "Nalvaravu Kolam (Welcoming Kolam)", "Thottil Kolam (Cradle Kolam)", "Ratha Kolam (Chariot Kolam)", "Navagraha Kolam (Nine Planets Kolam)", "Swastika Kolam", "Star Kolam (Nakshatra Kolam)", "Kottu Kolam (Box or Compartment Kolam)", "Vinayagar Kolam (Ganesha Kolam)", "Pavitra Kolam (Sacred Thread Kolam)", "Muggu (Andhra Pradesh/Telangana Kolam)", "Alpona (Bengali Floor Art)", "Chowkpurana (Maharashtrian Rangoli)", "Aripana (Bihari Floor Art)", "Mandana (Rajasthan Variant)", "Aipan (Uttarakhand Ritual Art)", "Jhoti or Chita (Odisha Floor Art)", "Sathiya (Gujarat Swastika-Based)", "Murja (Odisha Tulsi Art)", "Hase (Karnataka Rangoli)", "Mandala Kolam", "Celtic Knot Kolam", "Musical Kolam", "3D Kolam", "Kolam with Numbers or Letters", "Eco-Friendly Kolam", "Digital Kolam", "Other"
  ];
  const gridSizes = ["Small (3x3)", "Medium (5x5)", "Large (7x7)", "Extra Large (9x9 or bigger)"];
  const symmetryTypes = [
    "None", "Vertical", "Horizontal", "Diagonal", "Reflective", "90° Rotational Symmetry", "180° Rotational Symmetry", "360° Rotational Symmetry", "Radial", "Point", "Cyclic", "Translational", "Glide Reflection", "Fractal", "Tessellation", "Bilateral"
  ];
  const pathStyles = [
    "Continuous", "Broken", "Looped", "Freehand", "Branched", "Concentric", "Interlaced", "Geometric", "Spiral", "Tiled", "Radial", "Symmetric Path"
  ];
  const dotGridTypes = [
    "Square Grid", "Diamond Grid", "Triangular Grid", "Hexagonal Grid", "Circular Grid", "Random Dots", "No Dots (Freehand)"
  ];
  const culturalContexts = [
    "Daily Ritual", "Festival Kolam", "Wedding / Auspicious", "Spiritual / Sacred", "Competitions / Exhibitions", "Educational / Teaching", "Recreational / Meditative", "Modern / Contemporary", "Other"
  ];

  function randomValue(arr: string[]): string {
    return arr.filter(v => v && v !== "").sort(() => 0.5 - Math.random())[0];
  }

  async function handleGenerateKolam() {
    if (!todayFestival) return;
    setGenerating(true);
    setGeneratedKolam(null);
    // Random Kolam parameters (same logic as creation page)
    const kolamType = randomValue(kolamTypes);
    const gridSize = randomValue(gridSizes);
    const symmetryType = randomValue(symmetryTypes);
    const pathStyle = randomValue(pathStyles);
    const dotGridType = randomValue(dotGridTypes);
    const culturalContext = randomValue(culturalContexts);
    // Build prompt with festival context
    const prompt = `Generate a Kolam for ${todayFestival.summary} in ${kolamType} style, grid size ${gridSize}, symmetry ${symmetryType}, path style ${pathStyle}, dot grid ${dotGridType}, context ${culturalContext}. IMPORTANT: The generated Kolam should be on a plain white or black background (no shadows, no textures, no gradients) so the background can be easily removed for AR functionality.`;
    try {
      const res = await fetch('/api/generate-kolam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kolamType,
          gridSize,
          symmetryType,
          pathStyle,
          dotGridType,
          culturalContext,
          prompt
        })
      });
      const data = await res.json();
      setGeneratedKolam(data.imageUrl || null);
    } catch {
      setGeneratedKolam(null);
    }
    setGenerating(false);
  }

  return (
    <div className="p-6 rounded-2xl shadow-xl border bg-gradient-to-br from-cyan-100/80 via-white to-blue-100/80 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full p-2 shadow">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
        </span>
        <h3 className="text-2xl font-bold font-serif text-cyan-700 drop-shadow">Festival Kolams Calendar</h3>
      </div>
      {loading ? (
        <div className="text-cyan-600 font-semibold animate-pulse">Loading festivals…</div>
      ) : festivals.length === 0 ? (
        <div className="text-blue-600 font-semibold">No upcoming festivals found.</div>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {festivals.map((event, idx) => {
              const isToday = event.start.date === todayStr;
              return (
                <li key={idx} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${isToday ? 'bg-cyan-100 border-cyan-400 shadow-lg' : 'bg-white border-blue-100'} transition-all duration-200`}>
                  <span className={`font-semibold text-cyan-700 ${isToday ? 'text-lg' : 'text-base'}`}>{event.summary}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${isToday ? 'bg-cyan-500 text-white' : 'bg-blue-100 text-blue-700'}`}>{event.start.date}</span>
                  {isToday && <span className="ml-2 text-pink-500 font-bold animate-bounce">🎉 Today!</span>}
                </li>
              );
            })}
          </ul>
          {todayFestival && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-50 via-white to-blue-50 border border-cyan-200 shadow">
              <h4 className="text-lg font-bold text-cyan-700 mb-2 flex items-center gap-2"><span>✨</span> Generate a Kolam for <span className="text-pink-600">{todayFestival.summary}</span></h4>
              <button
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-600 text-white font-bold rounded-xl shadow hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                onClick={handleGenerateKolam}
                disabled={generating}
              >
                {generating ? 'Generating…' : 'Generate Festival Kolam'}
              </button>
              {generatedKolam && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <img src={generatedKolam} alt="Generated Kolam" className="w-40 h-40 object-contain border-2 border-cyan-200 rounded-xl bg-cyan-50 shadow-lg" />
                  <span className="text-sm font-semibold text-cyan-700">Your Festival Kolam</span>
                  <div className="flex gap-3 mt-2">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 font-semibold"
                      onClick={() => {
                        // Download image
                        const link = document.createElement('a');
                        link.href = generatedKolam;
                        link.download = `festival-kolam.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download
                    </button>
                    <button
                      className="px-4 py-2 bg-cyan-500 text-white rounded-xl shadow hover:bg-cyan-600 font-semibold"
                      onClick={async () => {
                        // Prepare AR visualization (store in session and redirect)
                        sessionStorage.setItem('kolam_ar_image', generatedKolam);
                        window.location.href = '/ar-designer?from=festival';
                      }}
                    >
                      Visualize in AR
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
