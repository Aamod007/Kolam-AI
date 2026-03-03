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
  const [dimensions] = useState({ width: 400, height: 400 })
  const scale = 0.9
  const offsetX = (dimensions.width / 2) - 140
  const offsetY = (dimensions.height / 2) - 140

  const visibleLines = showFull ? pattern.lines : pattern.lines.slice(0, animatedLines)

  return (
    <div className="relative rounded-xl shadow-2xl overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height, background: '#1a0a12', border: '2px solid #bfa335' }}>
      <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a1520" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {visibleLines.map((line, idx) => (
            <line key={idx} x1={line.from.x} y1={line.from.y} x2={line.to.x} y2={line.to.y}
              stroke="#ffd700" strokeWidth={4} strokeLinecap="round" className="transition-all duration-300" />
          ))}
          {pattern.dots.map((dot, idx) => (
            <circle key={idx} cx={dot.x} cy={dot.y} r={6} fill="#ef4444" stroke="#fca5a5" strokeWidth={2} />
          ))}
        </g>
      </svg>
      {animatedLines > 0 && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: 'rgba(58,10,42,0.9)', color: '#ffd700', border: '1px solid #bfa335' }}>
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
    <div className="relative rounded-xl shadow-2xl overflow-hidden"
      style={{ width: dimensions.width, height: dimensions.height, background: '#1a0a12', border: '2px solid #bfa335' }}>
      <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full">
        <defs>
          <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a1520" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid2)" />
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {visiblePaths.map((p, idx) => (
            <path key={idx} d={p} fill="none" stroke="#ffd700" strokeWidth={3} strokeLinecap="round" className="transition-all duration-500" />
          ))}
          {kolamData.dots.map((dot, idx) => (
            <circle key={idx} cx={dot.x} cy={dot.y} r={5} fill="#ef4444" stroke="#fca5a5" strokeWidth={2} />
          ))}
        </g>
      </svg>
      {animatedPaths > 0 && (
        <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ background: 'rgba(58,10,42,0.9)', color: '#ffd700', border: '1px solid #bfa335' }}>
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

  const selectedPattern = selectedPatternId ? getPatternById(selectedPatternId) : null

  // For simple mode
  const simpleKolamData = kolamType === 'pulli' ? generatePulliKolam(gridSize, 50) : generateSikkuKolam(gridSize, 50)

  const totalSteps = selectedPattern ? selectedPattern.lines.length : simpleKolamData.paths.length

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setAnimatedCount(0)
    setShowFull(false)
    setIsPlaying(false)
  }, [])

  const startAnimation = useCallback(() => {
    resetAnimation()
    setIsPlaying(true)
  }, [resetAnimation])

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setAnimatedCount(prev => prev + 1)
        setCurrentStep(prev => prev + 1)
      }, selectedPattern ? 2000 : 500)
      return () => clearTimeout(timer)
    } else {
      setIsPlaying(false)
    }
  }, [currentStep, isPlaying, selectedPattern, totalSteps])

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setAnimatedCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      setAnimatedCount(prev => prev + 1)
    }
  }

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId)
    resetAnimation()
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <video autoPlay loop muted playsInline src="/Bg.mp4"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <Navbar />
        <main className="container mx-auto max-w-6xl pt-10 px-4 pb-12">

          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="w-10 h-10" style={{ color: '#ffd700' }} />
              <h1 className="text-4xl md:text-5xl font-black drop-shadow-md" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#ffd700', textShadow: '0 2px 12px #800000' }}>
                Step-by-Step Learning
              </h1>
            </div>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#FFF8E1', fontFamily: 'Merriweather, serif', textShadow: '0 1px 8px #800000' }}>
              Learn the ancient art of Kolam dot-by-dot. Watch how the interlaced loops (Sikku) or connecting lines (Pulli) are drawn, then try it yourself!
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="p-1 rounded-lg flex gap-1" style={{ background: 'rgba(58,10,42,0.8)', border: '1px solid #bfa335' }}>
              <Button
                variant={filterMode === 'database' ? 'default' : 'ghost'}
                onClick={() => { setFilterMode('database'); setSelectedPatternId(''); resetAnimation(); }}
                style={filterMode === 'database' ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 } : { color: '#bfa335' }}
              >📚 Pattern Library</Button>
              <Button
                variant={filterMode === 'simple' ? 'default' : 'ghost'}
                onClick={() => { setFilterMode('simple'); setSelectedPatternId(''); resetAnimation(); }}
                style={filterMode === 'simple' ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 } : { color: '#bfa335' }}
              >🎯 Quick Practice</Button>
            </div>
          </div>

          {/* Pattern Library Selector */}
          {filterMode === 'database' && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {KOLAM_PATTERNS.slice(0, 8).map(pattern => (
                  <Button key={pattern.id}
                    variant={selectedPatternId === pattern.id ? 'default' : 'outline'}
                    onClick={() => handlePatternSelect(pattern.id)}
                    style={selectedPatternId === pattern.id
                      ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }
                      : { borderColor: '#bfa335', color: '#bfa335', background: 'rgba(58,10,42,0.5)' }}>
                    <span className="mr-2">{pattern.name.split(' ')[0]}</span>
                    <Badge className={`${difficultyColors[pattern.difficulty]} text-white text-xs`}>{pattern.difficulty}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-12 gap-8 items-start">

            {/* Left Panel */}
            <div className="md:col-span-4 rounded-2xl p-6 shadow-xl space-y-6" style={{ background: 'linear-gradient(180deg, #1d1925 0%, #280c1a 100%)', border: '2px solid #bfa335' }}>

              {filterMode === 'simple' ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>Kolam Style</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 cursor-help" style={{ color: '#bfa335' }} />
                          </TooltipTrigger>
                          <TooltipContent style={{ background: '#280c1a', border: '1px solid #bfa335', color: '#FFF8E1' }}>
                            <p className="max-w-xs"><strong>Pulli:</strong> Lines connect directly dot-to-dot.<br /><strong>Sikku:</strong> Continuous curved lines weave around dots.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={kolamType === 'pulli' ? 'default' : 'outline'} onClick={() => { setKolamType('pulli'); resetAnimation(); }}
                        style={kolamType === 'pulli' ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 } : { borderColor: '#bfa335', color: '#bfa335' }}>Pulli (Lines)</Button>
                      <Button variant={kolamType === 'sikku' ? 'default' : 'outline'} onClick={() => { setKolamType('sikku'); resetAnimation(); }}
                        style={kolamType === 'sikku' ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 } : { borderColor: '#bfa335', color: '#bfa335' }}>Sikku (Curves)</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>Grid Size</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 7].map(size => (
                        <Button key={size} variant={gridSize === size ? 'default' : 'outline'} onClick={() => { setGridSize(size); resetAnimation(); }}
                          style={gridSize === size ? { background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 } : { borderColor: '#bfa335', color: '#bfa335' }}>{size}x{size}</Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : selectedPattern ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>{selectedPattern.name}</h3>
                    <p className="text-sm mb-2" style={{ color: '#bfa335' }}>{selectedPattern.nameTamil}</p>
                    <div className="flex gap-2">
                      <Badge className={`${difficultyColors[selectedPattern.difficulty]} text-white`}>{selectedPattern.difficulty}</Badge>
                      <Badge style={{ background: '#4B1E13', color: '#ffd700', border: '1px solid #bfa335' }}>
                        {selectedPattern.gridSize > 0 ? `${selectedPattern.gridSize}x${selectedPattern.gridSize}` : 'Custom'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: '#FFF8E1' }}>{selectedPattern.description}</p>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(75,30,19,0.6)', border: '1px solid #bfa33555' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#ffd700' }}>Cultural Significance:</p>
                    <p className="text-xs" style={{ color: '#FFF8E1' }}>{selectedPattern.culturalSignificance}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: '#bfa335' }}>
                  <p>Select a pattern from the library above</p>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 rounded-lg" style={{ background: 'rgba(75,30,19,0.4)', border: '1px solid #bfa33544' }}>
                <h4 className="font-bold mb-2 text-sm uppercase tracking-wider" style={{ color: '#ffd700' }}>How to practice</h4>
                <ol className="list-decimal list-inside text-sm space-y-1" style={{ color: '#FFF8E1' }}>
                  <li>Grab paper or chalk</li>
                  <li>Draw the dot grid</li>
                  <li>Press Play to watch</li>
                  <li>Follow step-by-step</li>
                </ol>
              </div>

              {/* Playback Controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button onClick={startAnimation} disabled={isPlaying}
                    style={{ background: 'linear-gradient(90deg, #2d6a2e, #3a8b3c)', color: '#fff', fontWeight: 700, flex: 1 }}>
                    {isPlaying ? '▶ Playing...' : '▶ Play'}
                  </Button>
                  <Button onClick={handlePrevStep} disabled={currentStep === 0} variant="outline" style={{ borderColor: '#bfa335', color: '#bfa335' }}>◀</Button>
                  <Button onClick={handleNextStep} disabled={currentStep >= totalSteps} variant="outline" style={{ borderColor: '#bfa335', color: '#bfa335' }}>▶</Button>
                  <Button onClick={() => { setShowFull(true); setAnimatedCount(totalSteps); setCurrentStep(totalSteps); }} variant="outline" style={{ borderColor: '#bfa335', color: '#bfa335' }}>⊙</Button>
                  <Button onClick={resetAnimation} variant="outline" style={{ borderColor: '#bfa335', color: '#ef4444' }}>↺</Button>
                </div>
              </div>
            </div>

            {/* Right Panel: Canvas */}
            <div className="md:col-span-8 flex flex-col items-center">
              {selectedPattern ? (
                <PatternCanvas pattern={selectedPattern} currentStep={currentStep} showFull={showFull} animatedLines={animatedCount} />
              ) : (
                <SimpleCanvas kolamData={simpleKolamData} animatedPaths={animatedCount} showFull={showFull} />
              )}

              {/* Step Instructions */}
              {selectedPattern && currentStep > 0 && currentStep <= selectedPattern.steps.length && (
                <div className="mt-4 p-4 rounded-lg max-w-lg w-full" style={{ background: 'rgba(58,10,42,0.9)', border: '1px solid #bfa335', color: '#ffd700' }}>
                  <p className="font-semibold mb-1">Step {currentStep}: {selectedPattern.steps[currentStep - 1].instruction}</p>
                  <p className="text-sm" style={{ color: '#FFF8E1' }}>{selectedPattern.steps[currentStep - 1].instructionTamil}</p>
                </div>
              )}

              {/* Tips */}
              {selectedPattern && selectedPattern.tips.length > 0 && (
                <div className="mt-4 p-4 rounded-lg max-w-lg w-full" style={{ background: 'rgba(75,30,19,0.6)', border: '1px solid #bfa33577' }}>
                  <p className="font-semibold text-sm mb-2" style={{ color: '#ffd700' }}>💡 Tips:</p>
                  <ul className="text-xs space-y-1" style={{ color: '#FFF8E1' }}>
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
