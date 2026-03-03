'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/site/auth-context'
import { Gamepad2, Puzzle, Swords, Trophy, Timer, Star, RotateCcw, ArrowRight, Zap, Crown } from 'lucide-react'

// ========== Kolam Pattern Puzzles ==========
const PUZZLE_PATTERNS = [
    {
        id: 'basic-3x3', name: 'Simple Cross', difficulty: 'Easy', gridSize: 3,
        dots: [
            { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },
            { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 },
            { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },
        ],
        targetLines: [
            { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 3, to: 4 }, { from: 4, to: 5 },
            { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 0, to: 3 }, { from: 3, to: 6 },
            { from: 1, to: 4 }, { from: 4, to: 7 }, { from: 2, to: 5 }, { from: 5, to: 8 },
        ],
    },
    {
        id: 'diamond-4', name: 'Diamond Pattern', difficulty: 'Easy', gridSize: 3,
        dots: [
            { x: 200, y: 80 }, { x: 120, y: 200 }, { x: 200, y: 200 }, { x: 280, y: 200 }, { x: 200, y: 320 },
        ],
        targetLines: [
            { from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 4 }, { from: 3, to: 4 },
            { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 0, to: 2 }, { from: 2, to: 4 },
        ],
    },
    {
        id: 'star-5', name: 'Star Kolam', difficulty: 'Medium', gridSize: 5,
        dots: [
            { x: 200, y: 60 }, { x: 100, y: 160 }, { x: 300, y: 160 },
            { x: 60, y: 280 }, { x: 200, y: 220 }, { x: 340, y: 280 },
            { x: 130, y: 360 }, { x: 270, y: 360 },
        ],
        targetLines: [
            { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 5 },
            { from: 3, to: 6 }, { from: 5, to: 7 }, { from: 6, to: 7 },
            { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 4, to: 6 }, { from: 4, to: 7 }, { from: 0, to: 4 },
        ],
    },
    {
        id: 'hex-6', name: 'Hexagonal Sikku', difficulty: 'Hard', gridSize: 5,
        dots: [
            { x: 200, y: 60 }, { x: 100, y: 130 }, { x: 300, y: 130 },
            { x: 60, y: 230 }, { x: 200, y: 200 }, { x: 340, y: 230 },
            { x: 100, y: 310 }, { x: 300, y: 310 }, { x: 200, y: 370 },
        ],
        targetLines: [
            { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 5 },
            { from: 3, to: 6 }, { from: 5, to: 7 }, { from: 6, to: 8 }, { from: 7, to: 8 },
            { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 4, to: 6 }, { from: 4, to: 7 },
            { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 0, to: 4 }, { from: 4, to: 8 },
        ],
    },
]

const BATTLE_PROMPTS = [
    'Draw a symmetrical Kolam with at least 4 loops',
    'Create a Kolam using only curved lines around 5 dots',
    'Design a Kolam that looks like a flower',
    'Draw a traditional Pulli Kolam with straight lines connecting all dots',
    'Create an interlocking Sikku pattern around a diamond grid',
]

// ========== Puzzle Game ==========
function PuzzleGame({ onComplete }: { onComplete: (score: number, level: number, timeMs: number) => void }) {
    const [currentLevel, setCurrentLevel] = useState(0)
    const [drawnLines, setDrawnLines] = useState<{ from: number; to: number }[]>([])
    const [selectedDot, setSelectedDot] = useState<number | null>(null)
    const [startTime, setStartTime] = useState<number>(Date.now())
    const [elapsed, setElapsed] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [showTarget, setShowTarget] = useState(true)
    const [score, setScore] = useState(0)
    const pattern = PUZZLE_PATTERNS[currentLevel]

    useEffect(() => {
        const timer = setInterval(() => { if (!completed) setElapsed(Date.now() - startTime) }, 100)
        return () => clearInterval(timer)
    }, [startTime, completed])

    useEffect(() => {
        setShowTarget(true)
        const timer = setTimeout(() => setShowTarget(false), 3000)
        return () => clearTimeout(timer)
    }, [currentLevel])

    const handleDotClick = (dotIdx: number) => {
        if (completed) return
        if (selectedDot === null) { setSelectedDot(dotIdx); return }
        if (selectedDot === dotIdx) { setSelectedDot(null); return }
        const exists = drawnLines.some(l => (l.from === selectedDot && l.to === dotIdx) || (l.from === dotIdx && l.to === selectedDot))
        if (!exists) {
            const newLines = [...drawnLines, { from: selectedDot, to: dotIdx }]
            setDrawnLines(newLines)
            checkCompletion(newLines)
        }
        setSelectedDot(null)
    }

    const checkCompletion = (lines: { from: number; to: number }[]) => {
        const targetSet = new Set(pattern.targetLines.map(l => `${Math.min(l.from, l.to)}-${Math.max(l.from, l.to)}`))
        const drawnSet = new Set(lines.map(l => `${Math.min(l.from, l.to)}-${Math.max(l.from, l.to)}`))
        let matched = 0
        targetSet.forEach(t => { if (drawnSet.has(t)) matched++ })
        const accuracy = (matched / targetSet.size) * 100
        if (accuracy >= 80) {
            const timeBonus = Math.max(0, 50 - Math.floor(elapsed / 1000))
            setScore(prev => prev + Math.round(accuracy + timeBonus))
            setCompleted(true)
        }
    }

    const handleNextLevel = () => {
        if (currentLevel < PUZZLE_PATTERNS.length - 1) {
            setCurrentLevel(prev => prev + 1); setDrawnLines([]); setSelectedDot(null); setCompleted(false); setStartTime(Date.now())
        } else { onComplete(score, currentLevel + 1, elapsed) }
    }

    const handleReset = () => { setDrawnLines([]); setSelectedDot(null); setCompleted(false); setStartTime(Date.now()) }

    const isLineCorrect = (from: number, to: number) => pattern.targetLines.some(l => (l.from === from && l.to === to) || (l.from === to && l.to === from))

    const diffBadgeColor = pattern.difficulty === 'Easy' ? '#2d6a2e' : pattern.difficulty === 'Medium' ? '#b8860b' : '#8b0000'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge style={{ background: diffBadgeColor, color: '#fff' }}>{pattern.difficulty}</Badge>
                    <span className="font-bold" style={{ color: '#ffd700' }}>{pattern.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm flex items-center gap-1" style={{ color: '#bfa335' }}>
                        <Timer className="w-4 h-4" /> {(elapsed / 1000).toFixed(1)}s
                    </span>
                    <span className="font-bold flex items-center gap-1" style={{ color: '#ffd700' }}>
                        <Star className="w-4 h-4" /> {score}
                    </span>
                    <span className="text-sm" style={{ color: '#bfa33599' }}>Level {currentLevel + 1}/{PUZZLE_PATTERNS.length}</span>
                </div>
            </div>

            {showTarget && (
                <div className="p-3 rounded-lg text-sm text-center animate-pulse" style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}>
                    📐 Memorize the pattern! It will disappear in a moment...
                </div>
            )}

            <div className="relative rounded-2xl overflow-hidden mx-auto" style={{ width: 400, height: 400, background: '#1a0a12', border: '2px solid #bfa335' }}>
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    {showTarget && pattern.targetLines.map((line, idx) => (
                        <line key={`t-${idx}`} x1={pattern.dots[line.from].x} y1={pattern.dots[line.from].y} x2={pattern.dots[line.to].x} y2={pattern.dots[line.to].y}
                            stroke="#bfa335" strokeWidth={3} strokeDasharray="8,4" opacity={0.4} />
                    ))}
                    {drawnLines.map((line, idx) => (
                        <line key={`d-${idx}`} x1={pattern.dots[line.from].x} y1={pattern.dots[line.from].y} x2={pattern.dots[line.to].x} y2={pattern.dots[line.to].y}
                            stroke={isLineCorrect(line.from, line.to) ? '#ffd700' : '#ef4444'} strokeWidth={4} strokeLinecap="round" className="transition-all duration-300" />
                    ))}
                    {pattern.dots.map((dot, idx) => (
                        <g key={idx} onClick={() => handleDotClick(idx)} className="cursor-pointer">
                            <circle cx={dot.x} cy={dot.y} r={selectedDot === idx ? 14 : 10}
                                fill={selectedDot === idx ? '#ffd700' : '#ef4444'} stroke={selectedDot === idx ? '#fcd34d' : '#fca5a5'} strokeWidth={3} className="transition-all duration-200" />
                            <text x={dot.x} y={dot.y + 1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" fontWeight="bold" className="pointer-events-none select-none">{idx + 1}</text>
                        </g>
                    ))}
                </svg>
                {completed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in" style={{ background: 'rgba(26,10,18,0.9)' }}>
                        <Star className="w-16 h-16 mb-4" style={{ color: '#ffd700' }} />
                        <h3 className="text-2xl font-bold mb-2" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>Level Complete!</h3>
                        <p className="text-sm mb-4" style={{ color: '#bfa335' }}>Great pattern matching!</p>
                        <Button onClick={handleNextLevel} style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}>
                            {currentLevel < PUZZLE_PATTERNS.length - 1 ? (<>Next Level <ArrowRight className="w-4 h-4 ml-2" /></>) : (<>Finish Game <Trophy className="w-4 h-4 ml-2" /></>)}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleReset} style={{ borderColor: '#bfa335', color: '#bfa335' }}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
                <Button variant="outline" onClick={() => setShowTarget(true)} style={{ borderColor: '#bfa335', color: '#ffd700' }}>👁 Peek Pattern</Button>
            </div>
            <p className="text-center text-xs" style={{ color: '#bfa33588' }}>Click two dots to draw a line. Recreate the pattern from memory!</p>
        </div>
    )
}

// ========== Battle Arena ==========
function BattleArena({ onComplete }: { onComplete: (score: number, level: number, timeMs: number) => void }) {
    const [prompt, setPrompt] = useState('')
    const [timeLeft, setTimeLeft] = useState(60)
    const [started, setStarted] = useState(false)
    const [finished, setFinished] = useState(false)
    const [dots, setDots] = useState<{ x: number; y: number }[]>([])
    const [lines, setLines] = useState<{ from: number; to: number }[]>([])
    const [selectedDot, setSelectedDot] = useState<number | null>(null)
    const [opponentScore, setOpponentScore] = useState(0)
    const [playerScore, setPlayerScore] = useState(0)

    const startBattle = () => {
        setPrompt(BATTLE_PROMPTS[Math.floor(Math.random() * BATTLE_PROMPTS.length)])
        setStarted(true); setFinished(false); setTimeLeft(60); setLines([]); setSelectedDot(null)
        const newDots: { x: number; y: number }[] = []
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) newDots.push({ x: 70 + c * 90, y: 70 + r * 90 })
        setDots(newDots)
    }

    useEffect(() => {
        if (!started || finished) return
        if (timeLeft <= 0) { finishBattle(); return }
        const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
        return () => clearTimeout(timer)
    }, [timeLeft, started, finished])

    const handleDotClick = (idx: number) => {
        if (finished || !started) return
        if (selectedDot === null) { setSelectedDot(idx); return }
        if (selectedDot === idx) { setSelectedDot(null); return }
        const exists = lines.some(l => (l.from === selectedDot && l.to === idx) || (l.from === idx && l.to === selectedDot))
        if (!exists) setLines(prev => [...prev, { from: selectedDot, to: idx }])
        setSelectedDot(null)
    }

    const finishBattle = () => {
        setFinished(true)
        const lineCount = lines.length
        const timeBonus = Math.max(0, timeLeft * 2)
        const symmetryBonus = lineCount > 4 ? 20 : 0
        const pScore = Math.min(100, Math.round(lineCount * 5 + timeBonus + symmetryBonus))
        const oScore = Math.floor(Math.random() * 30) + 55
        setPlayerScore(pScore); setOpponentScore(oScore)
        onComplete(pScore, 1, (60 - timeLeft) * 1000)
    }

    return (
        <div className="space-y-4">
            {!started ? (
                <div className="text-center py-10 space-y-6">
                    <Swords className="w-16 h-16 mx-auto" style={{ color: '#ffd700' }} />
                    <h3 className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>1v1 Battle Arena</h3>
                    <p className="max-w-md mx-auto" style={{ color: '#bfa335' }}>
                        You'll get a random prompt. Draw a Kolam in 60 seconds. Your design will be scored against an AI opponent!
                    </p>
                    <Button onClick={startBattle} className="text-lg px-8 py-3" style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}>
                        <Swords className="w-5 h-5 mr-2" /> Start Battle!
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <Badge className="flex items-center gap-1" style={{ background: '#8b0000', color: '#ffd700' }}>
                            <Swords className="w-3 h-3" /> Battle Mode
                        </Badge>
                        <div className={`text-lg font-mono font-bold flex items-center gap-1 ${timeLeft <= 10 ? 'animate-pulse' : ''}`}
                            style={{ color: timeLeft <= 10 ? '#ef4444' : '#ffd700' }}>
                            <Timer className="w-4 h-4" /> {timeLeft}s
                        </div>
                    </div>

                    <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
                        <span className="font-medium text-sm" style={{ color: '#bfa335' }}>✨ Prompt: </span>
                        <span className="font-bold" style={{ color: '#ffd700' }}>{prompt}</span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden mx-auto" style={{ width: 400, height: 400, background: '#1a0a12', border: '2px solid #bfa335' }}>
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            {lines.map((line, idx) => (
                                <line key={idx} x1={dots[line.from].x} y1={dots[line.from].y} x2={dots[line.to].x} y2={dots[line.to].y}
                                    stroke="#ffd700" strokeWidth={3} strokeLinecap="round" />
                            ))}
                            {dots.map((dot, idx) => (
                                <g key={idx} onClick={() => handleDotClick(idx)} className="cursor-pointer">
                                    <circle cx={dot.x} cy={dot.y} r={selectedDot === idx ? 12 : 8}
                                        fill={selectedDot === idx ? '#ffd700' : '#ef4444'} stroke={selectedDot === idx ? '#fcd34d' : '#fca5a5'} strokeWidth={2} className="transition-all duration-200" />
                                </g>
                            ))}
                        </svg>
                        {finished && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in" style={{ background: 'rgba(26,10,18,0.92)' }}>
                                <Crown className="w-12 h-12 mb-3" style={{ color: '#ffd700' }} />
                                <h3 className="text-xl font-bold mb-4" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>
                                    {playerScore > opponentScore ? '🎉 You Win!' : playerScore === opponentScore ? '🤝 Tie!' : '😅 Opponent Wins!'}
                                </h3>
                                <div className="flex gap-8 mb-6">
                                    <div className="text-center"><div className="text-3xl font-black" style={{ color: '#ffd700' }}>{playerScore}</div><div className="text-xs" style={{ color: '#bfa335' }}>You</div></div>
                                    <div className="text-2xl font-bold self-center" style={{ color: '#bfa33577' }}>vs</div>
                                    <div className="text-center"><div className="text-3xl font-black" style={{ color: '#ef4444' }}>{opponentScore}</div><div className="text-xs" style={{ color: '#bfa335' }}>AI Opponent</div></div>
                                </div>
                                <Button onClick={startBattle} style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}>
                                    <RotateCcw className="w-4 h-4 mr-2" /> Rematch
                                </Button>
                            </div>
                        )}
                    </div>

                    {!finished && (
                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={() => { setLines([]); setSelectedDot(null) }} style={{ borderColor: '#bfa335', color: '#bfa335' }}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Clear
                            </Button>
                            <Button onClick={finishBattle} style={{ background: 'linear-gradient(90deg, #2d6a2e, #3a8b3c)', color: '#fff', fontWeight: 700 }}>
                                <Zap className="w-4 h-4 mr-2" /> Submit Early
                            </Button>
                        </div>
                    )}
                    <p className="text-center text-xs" style={{ color: '#bfa33588' }}>Click two dots to connect them. Draw your Kolam before time runs out!</p>
                </>
            )}
        </div>
    )
}

// ========== Main Page ==========
export default function GamesPage() {
    const auth = useAuth()
    const user = auth?.user
    const [activeGame, setActiveGame] = useState<'puzzle' | 'battle' | null>(null)
    const [lastResult, setLastResult] = useState<{ score: number; karma: number } | null>(null)

    async function handleGameComplete(gameType: string, score: number, level: number, timeMs: number) {
        if (!user) return
        try {
            const res = await fetch('/api/games', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ game_type: gameType, score, level, time_ms: timeMs }),
            })
            const data = await res.json()
            if (data.success) setLastResult({ score, karma: data.karmaAwarded })
        } catch (err) { console.error(err) }
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
            <video autoPlay loop muted playsInline src="/Bg.mp4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Navbar />
                <main className="container mx-auto max-w-5xl pt-10 px-4 pb-12">

                    {/* Hero */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <Gamepad2 className="w-10 h-10" style={{ color: '#ffd700' }} />
                            <h1 className="text-4xl md:text-5xl font-black drop-shadow-md" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#ffd700', textShadow: '0 2px 12px #800000' }}>
                                Interactive Kolam Games
                            </h1>
                        </div>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#FFF8E1', fontFamily: 'Merriweather, serif', textShadow: '0 1px 8px #800000' }}>
                            Gamify Kolam patterns! Puzzle games, 1v1 Battle Arena, unlock levels, challenge friends, and more.
                        </p>
                    </div>

                    {/* Result Alert */}
                    {lastResult && (
                        <div className="mb-6 p-4 rounded-xl text-center animate-in slide-in-from-top-2" style={{ background: 'linear-gradient(135deg, rgba(58,10,42,0.8), rgba(75,30,19,0.6))', border: '1px solid rgba(255,215,0,0.3)' }}>
                            <span className="font-bold" style={{ color: '#ffd700' }}>Score: {lastResult.score}</span>
                            <span className="mx-3" style={{ color: '#bfa33555' }}>|</span>
                            <span className="font-bold" style={{ color: '#22c55e' }}>+{lastResult.karma} Karma 🎉</span>
                        </div>
                    )}

                    {!activeGame ? (
                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {/* Puzzle Card */}
                            <div
                                className="p-6 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => setActiveGame('puzzle')}
                                style={{ background: 'linear-gradient(180deg, #1d1925 0%, #280c1a 100%)', border: '2px solid #bfa335', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                            >
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid #bfa33555' }}>
                                        <Puzzle className="w-10 h-10" style={{ color: '#ffd700' }} />
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>Kolam Puzzle</h2>
                                    <p className="text-sm" style={{ color: '#bfa335' }}>
                                        Memorize the pattern, then recreate it! Connect dots to match the Kolam design. Progress through 4 levels of increasing difficulty.
                                    </p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>Pattern Matching</Badge>
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>4 Levels</Badge>
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>Memory Game</Badge>
                                    </div>
                                    <Button className="w-full mt-4" style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}>
                                        <Puzzle className="w-4 h-4 mr-2" /> Play Puzzle
                                    </Button>
                                </div>
                            </div>

                            {/* Battle Card */}
                            <div
                                className="p-6 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => setActiveGame('battle')}
                                style={{ background: 'linear-gradient(180deg, #1d1925 0%, #280c1a 100%)', border: '2px solid #bfa335', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
                            >
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(139,0,0,0.15)', border: '1px solid #bfa33555' }}>
                                        <Swords className="w-10 h-10" style={{ color: '#ffd700' }} />
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>1v1 Battle Arena</h2>
                                    <p className="text-sm" style={{ color: '#bfa335' }}>
                                        Get a random prompt, draw a Kolam in 60 seconds, and compete against an AI opponent! Score based on complexity and speed.
                                    </p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>Timed Challenge</Badge>
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>vs AI</Badge>
                                        <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa33555' }}>60 Seconds</Badge>
                                    </div>
                                    <Button className="w-full mt-4" style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}>
                                        <Swords className="w-4 h-4 mr-2" /> Enter Arena
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-lg mx-auto">
                            <Button variant="outline" onClick={() => { setActiveGame(null); setLastResult(null) }} className="mb-6" style={{ borderColor: '#bfa335', color: '#bfa335' }}>← Back to Games</Button>
                            <div className="p-6 rounded-2xl shadow-xl" style={{ background: 'linear-gradient(180deg, #1d1925 0%, #280c1a 100%)', border: '2px solid #bfa335' }}>
                                {activeGame === 'puzzle' ? (
                                    <PuzzleGame onComplete={(score, level, timeMs) => handleGameComplete('puzzle', score, level, timeMs)} />
                                ) : (
                                    <BattleArena onComplete={(score, level, timeMs) => handleGameComplete('battle', score, level, timeMs)} />
                                )}
                            </div>
                        </div>
                    )}

                    {!user && (
                        <div className="mt-8 text-center p-4 rounded-xl" style={{ background: 'rgba(58,10,42,0.5)', border: '1px solid #bfa33555' }}>
                            <p className="text-sm" style={{ color: '#bfa335' }}>
                                <a href="/signin" className="font-bold hover:underline" style={{ color: '#ffd700' }}>Sign in</a> to track your scores and earn Kolam Karma!
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
