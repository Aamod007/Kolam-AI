'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { generatePulliKolam, generateSikkuKolam } from '@/lib/kolam-generators'
import { 
  getPatternById, 
  getPatternsByDifficulty, 
  KOLAM_PATTERNS,
  type KolamPattern,
  type PatternStep
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

interface Dot {
  x: number
  y: number
}

interface Line {
  from: Dot
  to: Dot
}

interface KolamData {
  dots: Dot[]
  lines: Line[]
}

function LearningCanvas({ 
  kolamData, 
  currentStep = 0, 
  showFull = false,
  animatedLines = 0 
}: { 
  kolamData: KolamData
  currentStep?: number
  showFull?: boolean
  animatedLines?: number
}) {
  const [dimensions] = useState({ width: 400, height: 400 })
  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2
  const scale = 0.9

  const offsetX = centerX - (280 / 2)
  const offsetY = centerY - (280 / 2)

  return (
    <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden" 
         style={{ width: dimensions.width, height: dimensions.height }}>
      <svg 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
      >
        {/* Background grid pattern for guidance */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Transform for centering */}
        <g transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
          {/* Draw completed lines */}
          {showFull 
            ? kolamData.lines.map((line: Line, idx: number) => (
                <line
                  key={idx}
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke="#1f2937"
                  strokeWidth={4}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))
            : kolamData.lines.slice(0, animatedLines).map((line: Line, idx: number) => (
                <line
                  key={idx}
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke="#1f2937"
                  strokeWidth={4}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))
          }

          {/* Draw dots on top */}
          {kolamData.dots.map((dot: Dot, idx: number) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={6}
              fill="#ef4444"
              stroke="#fef2f2"
              strokeWidth={2}
            />
          ))}
        </g>
      </svg>

      {/* Step indicator */}
      {animatedLines > 0 && (
        <div className="absolute top-2 right-2 bg-slate-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
          Step {Math.min(currentStep, kolamData.lines.length)} / {kolamData.lines.length}
        </div>
      )}
    </div>
  )
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500', 
  advanced: 'bg-orange-500',
  expert: 'bg-red-500'
}

export default function LearningModePage() {
  const [kolamType, setKolamType] = useState<'pulli' | 'sikku'>('pulli')
  const [gridSize, setGridSize] = useState<number>(3)
  const [selectedPatternId, setSelectedPatternId] = useState<string>('')
  const [currentStep, setCurrentStep] = useState(0)
  const [animatedLines, setAnimatedLines] = useState(0)
  const [showFullPattern, setShowFullPattern] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [filterMode, setFilterMode] = useState<'simple' | 'database'>('database')

  const selectedPattern = selectedPatternId ? getPatternById(selectedPatternId) : null

  const simpleKolamData = (() => {
    if (kolamType === 'pulli') {
      return generatePulliKolam(gridSize, 50)
    } else {
      return generateSikkuKolam(gridSize, 50)
    }
  })()

  const kolamData = selectedPattern ? {
    dots: selectedPattern.dots.map(d => ({ x: d.x, y: d.y })),
    lines: selectedPattern.lines
  } : simpleKolamData

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setAnimatedLines(0)
    setShowFullPattern(false)
    setIsPlaying(false)
  }, [])

  const startAnimation = useCallback(() => {
    resetAnimation()
    setIsPlaying(true)
  }, [resetAnimation])

  useEffect(() => {
    if (!isPlaying) return

    const totalSteps = selectedPattern?.steps.length || kolamData.lines.length
    
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setAnimatedLines(prev => prev + 1)
        setCurrentStep(prev => prev + 1)
      }, selectedPattern ? 2000 : 500)
      return () => clearTimeout(timer)
    } else {
      setIsPlaying(false)
    }
  }, [currentStep, isPlaying, selectedPattern, kolamData.lines.length])

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setAnimatedLines(prev => Math.max(0, prev - 1))
    }
  }

  const handleNextStep = () => {
    const totalSteps = selectedPattern?.steps.length || kolamData.lines.length
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
      setAnimatedLines(prev => prev + 1)
    }
  }

  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId)
    resetAnimation()
  }

  const patternsByDifficulty = getPatternsByDifficulty(kolamType === 'pulli' ? 'beginner' : 'intermediate')

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 pb-12">
      <Navbar />

      <main className="container mx-auto max-w-6xl pt-10 px-4">

        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-black font-serif text-amber-400 drop-shadow-md">
              Step-by-Step Learning
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Learn the ancient art of Kolam dot-by-dot. Watch how the interlaced loops (Sikku) or connecting lines (Pulli) are drawn, then try it yourself!
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-900 p-1 rounded-lg flex gap-1">
            <Button
              variant={filterMode === 'database' ? 'default' : 'ghost'}
              onClick={() => { setFilterMode('database'); setSelectedPatternId(''); resetAnimation(); }}
              className={filterMode === 'database' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}
            >
              📚 Pattern Library
            </Button>
            <Button
              variant={filterMode === 'simple' ? 'default' : 'ghost'}
              onClick={() => { setFilterMode('simple'); setSelectedPatternId(''); resetAnimation(); }}
              className={filterMode === 'simple' ? 'bg-amber-500 text-slate-900' : 'text-slate-400'}
            >
              🎯 Quick Practice
            </Button>
          </div>
        </div>

        {filterMode === 'database' && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {KOLAM_PATTERNS.slice(0, 8).map(pattern => (
                <Button
                  key={pattern.id}
                  variant={selectedPatternId === pattern.id ? 'default' : 'outline'}
                  onClick={() => handlePatternSelect(pattern.id)}
                  className={`${selectedPatternId === pattern.id ? 'bg-amber-500 text-slate-900' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <span className="mr-2">{pattern.name.split(' ')[0]}</span>
                  <Badge className={`${difficultyColors[pattern.difficulty]} text-white text-xs`}>
                    {pattern.difficulty}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Controls */}
          <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

            {filterMode === 'simple' ? (
              <>
                {/* Type Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-200">Kolam Style</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-800 border-slate-700 text-slate-200">
                          <p className="max-w-xs">
                            <strong>Pulli:</strong> Lines connect directly dot-to-dot.<br />
                            <strong>Sikku:</strong> Continuous curved lines weave around dots.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={kolamType === 'pulli' ? 'default' : 'outline'}
                      onClick={() => setKolamType('pulli')}
                      className={kolamType === 'pulli' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold' : 'border-slate-700 text-slate-400'}
                    >
                      Pulli (Lines)
                    </Button>
                    <Button
                      variant={kolamType === 'sikku' ? 'default' : 'outline'}
                      onClick={() => setKolamType('sikku')}
                      className={kolamType === 'sikku' ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold' : 'border-slate-700 text-slate-400'}
                    >
                      Sikku (Curves)
                    </Button>
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-200">Grid Size</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 5, 7].map(size => (
                      <Button
                        key={size}
                        variant={gridSize === size ? 'default' : 'outline'}
                        onClick={() => setGridSize(size)}
                        className={gridSize === size ? 'bg-indigo-500 text-white font-bold' : 'border-slate-700 text-slate-400'}
                      >
                        {size}x{size}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : selectedPattern ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-amber-400 mb-2">{selectedPattern.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">{selectedPattern.nameTamil}</p>
                  <div className="flex gap-2">
                    <Badge className={`${difficultyColors[selectedPattern.difficulty]} text-white`}>
                      {selectedPattern.difficulty}
                    </Badge>
                    <Badge className="bg-purple-600 text-white">
                      {selectedPattern.gridSize > 0 ? `${selectedPattern.gridSize}x${selectedPattern.gridSize}` : 'Custom'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-300">{selectedPattern.description}</p>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-xs text-amber-400 font-semibold mb-1">Cultural Significance:</p>
                  <p className="text-xs text-slate-400">{selectedPattern.culturalSignificance}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Select a pattern from the library above</p>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h4 className="font-bold text-amber-400 mb-2 text-sm uppercase tracking-wider">How to practice</h4>
              <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                <li>Grab paper or chalk</li>
                <li>Draw the dot grid</li>
                <li>Press Play to watch</li>
                <li>Follow step-by-step</li>
              </ol>
            </div>

            {/* Playback Controls */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={startAnimation}
                  disabled={isPlaying}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isPlaying ? '▶ Playing...' : '▶ Play'}
                </Button>
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border-slate-700"
                >
                  ◀
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={currentStep >= (selectedPattern?.steps.length || kolamData.lines.length)}
                  variant="outline"
                  className="border-slate-700"
                >
                  ▶
                </Button>
                <Button
                  onClick={() => { setShowFullPattern(true); setAnimatedLines(kolamData.lines.length); setCurrentStep(kolamData.lines.length); }}
                  variant="outline"
                  className="border-slate-700"
                >
                  ⊙
                </Button>
                <Button
                  onClick={resetAnimation}
                  variant="outline"
                  className="border-slate-700 text-red-400"
                >
                  ↺
                </Button>
              </div>
            </div>

          </div>

          {/* Right Panel: Canvas */}
          <div className="md:col-span-8 flex flex-col items-center">
            <LearningCanvas 
              kolamData={kolamData}
              currentStep={currentStep}
              showFull={showFullPattern}
              animatedLines={animatedLines}
            />

            {/* Step Instructions */}
            {selectedPattern && currentStep > 0 && currentStep <= selectedPattern.steps.length && (
              <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700 max-w-lg w-full">
                <p className="text-amber-400 font-semibold mb-1">
                  Step {currentStep}: {selectedPattern.steps[currentStep - 1].instruction}
                </p>
                <p className="text-slate-400 text-sm">
                  {selectedPattern.steps[currentStep - 1].instructionTamil}
                </p>
              </div>
            )}

            {/* Tips */}
            {selectedPattern && selectedPattern.tips.length > 0 && (
              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-800 max-w-lg w-full">
                <p className="text-blue-400 font-semibold text-sm mb-2">💡 Tips:</p>
                <ul className="text-xs text-blue-200 space-y-1">
                  {selectedPattern.tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
