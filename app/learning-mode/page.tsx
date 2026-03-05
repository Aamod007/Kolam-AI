'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { generatePulliKolam, generateSikkuKolam } from '@/lib/kolam-generators'
import {
  getPatternById,
  KOLAM_PATTERNS,
  type KolamPattern,
} from '@/lib/kolam-patterns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Canvas for Pattern Library (lines with from/to)
function PatternCanvas({
  pattern,
  currentStep = 0,
  showFull = false,
  animatedLines = 0
}: {
  pattern: KolamPattern
  currentStep?: number
  showFull?: boolean
  animatedLines?: number
}) {
  const [dimensions] = useState({ width: Math.min(400, window.innerWidth - 40), height: Math.min(400, window.innerWidth - 40) })
  const scale = 0.9
  const offsetX = (dimensions.width / 2) - 140
  const offsetY = (dimensions.height / 2) - 140
  const visibleLines = showFull ? pattern.lines : pattern.lines.slice(0, animatedLines)

  return (
    <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-500"
      style={{ width: dimensions.width, height: dimensions.height, background: 'linear-gradient(135deg, #fffde7, #ffe082)' }}>
      <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full">
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {visibleLines.map((line, idx) => (
            <line key={idx} x1={line.from.x} y1={line.from.y} x2={line.to.x} y2={line.to.y}
              stroke="#b8860b" strokeWidth={4} strokeLinecap="round" className="transition-all duration-300" />
          ))}
          {pattern.dots.map((dot, idx) => (
            <circle key={idx} cx={dot.x} cy={dot.y} r={6} fill="#e6b800" stroke="#ffd700" strokeWidth={2} />
          ))}
        </g>
      </svg>
      {animatedLines > 0 && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700 border border-yellow-400">
          Step {Math.min(currentStep, pattern.lines.length)} / {pattern.lines.length}
        </div>
      )}
    </div>
  )
}

// Canvas for Simple/Quick Practice (SVG paths from generators)
function SimpleCanvas({
  kolamData,
  animatedPaths = 0,
  showFull = false,
}: {
  kolamData: { dots: { x: number; y: number; id: string }[]; paths: string[]; width: number; height: number }
  animatedPaths?: number
  showFull?: boolean
}) {
  const [dimensions] = useState({ width: 400, height: 400 })
  const scale = Math.min(
    (dimensions.width * 0.85) / (kolamData.width || 200),
    (dimensions.height * 0.85) / (kolamData.height || 200)
  )
  const offsetX = (dimensions.width - (kolamData.width || 200) * scale) / 2
  const offsetY = (dimensions.height - (kolamData.height || 200) * scale) / 2
  const visiblePaths = showFull ? kolamData.paths : kolamData.paths.slice(0, animatedPaths)

  return (
    <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-500"
      style={{ width: dimensions.width, height: dimensions.height, background: 'linear-gradient(135deg, #fffde7, #ffe082)' }}>
      <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full">
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {visiblePaths.map((p, idx) => (
            <path key={idx} d={p} fill="none" stroke="#b8860b" strokeWidth={3} strokeLinecap="round" className="transition-all duration-500" />
          ))}
          {kolamData.dots.map((dot, idx) => (
            <circle key={idx} cx={dot.x} cy={dot.y} r={5} fill="#e6b800" stroke="#ffd700" strokeWidth={2} />
          ))}
        </g>
      </svg>
      {animatedPaths > 0 && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700 border border-yellow-400">
          Step {Math.min(animatedPaths, kolamData.paths.length)} / {kolamData.paths.length}
        </div>
      )}
    </div>
  )
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-600',
  intermediate: 'bg-yellow-600',
  advanced: 'bg-orange-600',
  expert: 'bg-red-600'
}

export default function LearningModePage() {
  const [kolamType, setKolamType] = useState<'pulli' | 'sikku'>('pulli')
  const [gridSize, setGridSize] = useState<number>(3)
  const [selectedPatternId, setSelectedPatternId] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(0)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [showFull, setShowFull] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [filterMode, setFilterMode] = useState<'simple' | 'database'>('database')
  const [animationSpeed, setAnimationSpeed] = useState<number>(1)

  const selectedPattern = selectedPatternId ? getPatternById(selectedPatternId) : null
  const simpleKolamData = kolamType === 'pulli' ? generatePulliKolam(gridSize, 50) : generateSikkuKolam(gridSize, 50)
  const totalSteps = selectedPattern ? selectedPattern.lines.length : simpleKolamData.paths.length

  const resetAnimation = useCallback(() => {
    setCurrentStep(0); setAnimatedCount(0); setShowFull(false); setIsPlaying(false)
  }, [])

  const startAnimation = useCallback(() => { resetAnimation(); setIsPlaying(true) }, [resetAnimation])

  useEffect(() => {
    if (!isPlaying) return
    const baseDelay = selectedPattern ? 2000 : 500
    const delay = baseDelay / animationSpeed
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => { setAnimatedCount(prev => prev + 1); setCurrentStep(prev => prev + 1) }, delay)
      return () => clearTimeout(timer)
    } else { setIsPlaying(false) }
  }, [currentStep, isPlaying, selectedPattern, totalSteps, animationSpeed])

  const handlePrevStep = () => { if (currentStep > 0) { setCurrentStep(prev => prev - 1); setAnimatedCount(prev => Math.max(0, prev - 1)) } }
  const handleNextStep = () => { if (currentStep < totalSteps) { setCurrentStep(prev => prev + 1); setAnimatedCount(prev => prev + 1) } }
  const handlePatternSelect = (patternId: string) => { setSelectedPatternId(patternId); resetAnimation() }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }} className="font-display">
      <video autoPlay loop muted playsInline src="/Bg.mp4"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Navbar />
        <main className="container py-10 flex flex-col items-center justify-center">

          {/* Header — same style as Recognition page */}
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-yellow-700 drop-shadow-[0_2px_12px_rgba(255,215,0,0.7)] tracking-tight leading-tight text-center uppercase border-b-4 border-yellow-500 pb-2"
            style={{ fontFamily: 'Georgia, serif', color: '#FFD700', letterSpacing: '0.12em', textShadow: '0 2px 12px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
            Step-by-Step Learning 📚
          </h1>
          <p className="mt-4 text-lg font-bold font-serif text-center" style={{ color: '#FFD700', textShadow: '0 2px 8px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
            Learn the ancient art of Kolam dot-by-dot. Watch Sikku loops and Pulli lines come alive!<br className="hidden md:inline" />
            <span className="text-yellow-700">Animated tutorials · Traceable paths · Pulli & Sikku styles</span>
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center mt-6 mb-4">
            <div className="flex gap-1 p-1 rounded-xl bg-yellow-100 border-2 border-yellow-400">
              <Button variant={filterMode === 'database' ? 'default' : 'ghost'} onClick={() => { setFilterMode('database'); setSelectedPatternId(''); resetAnimation(); }}
                className={`font-serif font-bold rounded-lg ${filterMode === 'database' ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white shadow-lg' : 'text-yellow-700'}`}>
                📚 Pattern Library
              </Button>
              <Button variant={filterMode === 'simple' ? 'default' : 'ghost'} onClick={() => { setFilterMode('simple'); setSelectedPatternId(''); resetAnimation(); }}
                className={`font-serif font-bold rounded-lg ${filterMode === 'simple' ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white shadow-lg' : 'text-yellow-700'}`}>
                🎯 Quick Practice
              </Button>
            </div>
          </div>

          {/* Pattern Library Selector */}
          {filterMode === 'database' && (
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {KOLAM_PATTERNS.slice(0, 8).map(pattern => (
                <Button key={pattern.id}
                  variant={selectedPatternId === pattern.id ? 'default' : 'outline'}
                  onClick={() => handlePatternSelect(pattern.id)}
                  className={`font-serif font-bold ${selectedPatternId === pattern.id ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white shadow-lg' : 'border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'}`}>
                  <span className="mr-2">{pattern.name.split(' ')[0]}</span>
                  <Badge className={`${difficultyColors[pattern.difficulty]} text-white text-xs`}>{pattern.difficulty}</Badge>
                </Button>
              ))}
            </div>
          )}

          <div className="mt-8 w-full flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start justify-center">

            {/* Left Panel — Yellow card like Recognition */}
            <Card className="lg:col-span-4 w-full bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-visible font-serif">
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
              <CardContent className="relative z-10 space-y-5 pt-6">

                {filterMode === 'simple' ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-yellow-700 font-extrabold font-serif text-lg">Kolam Style</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild><HelpCircle className="w-4 h-4 text-yellow-600 cursor-help" /></TooltipTrigger>
                            <TooltipContent className="bg-yellow-50 border-yellow-400 text-yellow-700">
                              <p className="max-w-xs"><strong>Pulli:</strong> Lines connect directly dot-to-dot.<br /><strong>Sikku:</strong> Curved lines weave around dots.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => { setKolamType('pulli'); resetAnimation(); }}
                          className={`font-serif font-bold rounded-xl ${kolamType === 'pulli' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-400'}`}>Pulli (Lines)</Button>
                        <Button onClick={() => { setKolamType('sikku'); resetAnimation(); }}
                          className={`font-serif font-bold rounded-xl ${kolamType === 'sikku' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-400'}`}>Sikku (Curves)</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-yellow-700 font-extrabold font-serif text-lg">Grid Size</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[3, 5, 7].map(size => (
                          <Button key={size} onClick={() => { setGridSize(size); resetAnimation(); }}
                            className={`font-serif font-bold rounded-xl ${gridSize === size ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-400'}`}>{size}x{size}</Button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : selectedPattern ? (
                  <div className="space-y-4">
                    <h3 className="text-yellow-700 font-extrabold font-serif text-xl">{selectedPattern.name}</h3>
                    <p className="text-sm text-yellow-600 italic">{selectedPattern.nameTamil}</p>
                    <div className="flex gap-2">
                      <Badge className={`${difficultyColors[selectedPattern.difficulty]} text-white`}>{selectedPattern.difficulty}</Badge>
                      <Badge className="bg-yellow-200 text-yellow-700">{selectedPattern.gridSize > 0 ? `${selectedPattern.gridSize}x${selectedPattern.gridSize}` : 'Custom'}</Badge>
                    </div>
                    <p className="text-sm text-yellow-800 font-serif">{selectedPattern.description}</p>
                    <div className="p-3 rounded-xl bg-yellow-100 border border-yellow-300">
                      <p className="text-xs font-bold text-yellow-700 mb-1">Cultural Significance:</p>
                      <p className="text-xs text-yellow-800">{selectedPattern.culturalSignificance}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-yellow-600 font-serif">Select a pattern from the library above</div>
                )}

                {/* Instructions */}
                <div className="p-4 rounded-xl bg-yellow-100/70 border border-yellow-300">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-yellow-700 mb-2">How to practice</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-yellow-800 font-serif">
                    <li>Grab paper or chalk</li>
                    <li>Draw the dot grid</li>
                    <li>Press Play to watch</li>
                    <li>Follow step-by-step</li>
                  </ol>
                </div>

                {/* Playback Controls */}
                <div className="flex gap-2 flex-wrap items-center">
                  <Button onClick={startAnimation} disabled={isPlaying}
                    className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 rounded-2xl font-serif flex-1">
                    {isPlaying ? '▶ Playing...' : '▶ Play'}
                  </Button>
                  <Button onClick={handlePrevStep} disabled={currentStep === 0} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif">◀</Button>
                  <Button onClick={handleNextStep} disabled={currentStep >= totalSteps} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif">▶</Button>
                  <Button onClick={() => { setShowFull(true); setAnimatedCount(totalSteps); setCurrentStep(totalSteps); }} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif">⊙</Button>
                  <Button onClick={resetAnimation} className="bg-yellow-50 text-red-500 border-2 border-yellow-400 rounded-xl font-serif">↺</Button>
                  <select 
                    value={animationSpeed} 
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="bg-yellow-50 border border-yellow-400 rounded-xl px-2 py-1 text-yellow-700 font-serif text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel: Canvas */}
            <div className="lg:col-span-8 flex flex-col items-center w-full">
              {selectedPattern ? (
                <PatternCanvas pattern={selectedPattern} currentStep={currentStep} showFull={showFull} animatedLines={animatedCount} />
              ) : (
                <SimpleCanvas kolamData={simpleKolamData} animatedPaths={animatedCount} showFull={showFull} />
              )}

              {/* Step Instructions */}
              {selectedPattern && currentStep > 0 && currentStep <= selectedPattern.steps.length && (
                <div className="mt-4 p-4 rounded-2xl max-w-lg w-full bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-lg font-serif">
                  <p className="font-bold text-yellow-700 mb-1">Step {currentStep}: {selectedPattern.steps[currentStep - 1].instruction}</p>
                  <p className="text-sm text-yellow-600 italic">{selectedPattern.steps[currentStep - 1].instructionTamil}</p>
                </div>
              )}

              {/* Tips */}
              {selectedPattern && selectedPattern.tips.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl max-w-lg w-full bg-yellow-50 border border-yellow-300 font-serif">
                  <p className="font-bold text-sm mb-2 text-yellow-700">💡 Tips:</p>
                  <ul className="text-xs space-y-1 text-yellow-800">
                    {selectedPattern.tips.map((tip, idx) => <li key={idx}>• {tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
