'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/site/auth-context'
import { Gamepad2, Puzzle, Swords, Trophy, Timer, Star, RotateCcw, ArrowRight, Zap, Crown } from 'lucide-react'

// ========== Puzzle Patterns ==========
const PUZZLE_PATTERNS = [
    {
        id: 'basic-3x3', name: 'Simple Cross', difficulty: 'Easy', dots: [
            { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },
            { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 },
            { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 }],
        targetLines: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 0, to: 3 }, { from: 3, to: 6 }, { from: 1, to: 4 }, { from: 4, to: 7 }, { from: 2, to: 5 }, { from: 5, to: 8 }]
    },
    {
        id: 'diamond-4', name: 'Diamond', difficulty: 'Easy', dots: [
            { x: 200, y: 80 }, { x: 120, y: 200 }, { x: 200, y: 200 }, { x: 280, y: 200 }, { x: 200, y: 320 }],
        targetLines: [{ from: 0, to: 1 }, { from: 0, to: 3 }, { from: 1, to: 4 }, { from: 3, to: 4 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 0, to: 2 }, { from: 2, to: 4 }]
    },
    {
        id: 'star-5', name: 'Star Kolam', difficulty: 'Medium', dots: [
            { x: 200, y: 60 }, { x: 100, y: 160 }, { x: 300, y: 160 }, { x: 60, y: 280 }, { x: 200, y: 220 }, { x: 340, y: 280 }, { x: 130, y: 360 }, { x: 270, y: 360 }],
        targetLines: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 5 }, { from: 3, to: 6 }, { from: 5, to: 7 }, { from: 6, to: 7 }, { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 4, to: 6 }, { from: 4, to: 7 }, { from: 0, to: 4 }]
    },
    {
        id: 'hex-6', name: 'Hexagonal', difficulty: 'Hard', dots: [
            { x: 200, y: 60 }, { x: 100, y: 130 }, { x: 300, y: 130 }, { x: 60, y: 230 }, { x: 200, y: 200 }, { x: 340, y: 230 }, { x: 100, y: 310 }, { x: 300, y: 310 }, { x: 200, y: 370 }],
        targetLines: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 5 }, { from: 3, to: 6 }, { from: 5, to: 7 }, { from: 6, to: 8 }, { from: 7, to: 8 }, { from: 1, to: 4 }, { from: 2, to: 4 }, { from: 4, to: 6 }, { from: 4, to: 7 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 0, to: 4 }, { from: 4, to: 8 }]
    },
]

const BATTLE_PROMPTS = [
    'Draw a symmetrical Kolam with at least 4 loops', 'Create a Kolam using only curved lines around 5 dots',
    'Design a Kolam that looks like a flower', 'Draw a traditional Pulli Kolam connecting all dots',
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

    useEffect(() => { const timer = setInterval(() => { if (!completed) setElapsed(Date.now() - startTime) }, 100); return () => clearInterval(timer) }, [startTime, completed])
    useEffect(() => { setShowTarget(true); const timer = setTimeout(() => setShowTarget(false), 3000); return () => clearTimeout(timer) }, [currentLevel])

    const handleDotClick = (dotIdx: number) => {
        if (completed) return
        if (selectedDot === null) { setSelectedDot(dotIdx); return }
        if (selectedDot === dotIdx) { setSelectedDot(null); return }
        const exists = drawnLines.some(l => (l.from === selectedDot && l.to === dotIdx) || (l.from === dotIdx && l.to === selectedDot))
        if (!exists) { const newLines = [...drawnLines, { from: selectedDot, to: dotIdx }]; setDrawnLines(newLines); checkCompletion(newLines) }
        setSelectedDot(null)
    }

    const checkCompletion = (lines: { from: number; to: number }[]) => {
        const targetSet = new Set(pattern.targetLines.map(l => `${Math.min(l.from, l.to)}-${Math.max(l.from, l.to)}`))
        const drawnSet = new Set(lines.map(l => `${Math.min(l.from, l.to)}-${Math.max(l.from, l.to)}`))
        let matched = 0; targetSet.forEach(t => { if (drawnSet.has(t)) matched++ })
        const accuracy = (matched / targetSet.size) * 100
        if (accuracy >= 80) { const timeBonus = Math.max(0, 50 - Math.floor(elapsed / 1000)); setScore(prev => prev + Math.round(accuracy + timeBonus)); setCompleted(true) }
    }

    const handleNextLevel = () => {
        if (currentLevel < PUZZLE_PATTERNS.length - 1) { setCurrentLevel(prev => prev + 1); setDrawnLines([]); setSelectedDot(null); setCompleted(false); setStartTime(Date.now()) }
        else { onComplete(score, currentLevel + 1, elapsed) }
    }
    const handleReset = () => { setDrawnLines([]); setSelectedDot(null); setCompleted(false); setStartTime(Date.now()) }
    const isLineCorrect = (from: number, to: number) => pattern.targetLines.some(l => (l.from === from && l.to === to) || (l.from === to && l.to === from))
    const diffColor = pattern.difficulty === 'Easy' ? 'bg-green-500' : pattern.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge className={`${diffColor} text-white`}>{pattern.difficulty}</Badge>
                    <span className="font-bold text-yellow-700 font-serif">{pattern.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm flex items-center gap-1 text-yellow-600"><Timer className="w-4 h-4" /> {(elapsed / 1000).toFixed(1)}s</span>
                    <span className="font-bold flex items-center gap-1 text-yellow-700"><Star className="w-4 h-4" /> {score}</span>
                    <span className="text-sm text-yellow-500">Level {currentLevel + 1}/{PUZZLE_PATTERNS.length}</span>
                </div>
            </div>
            {showTarget && (
                <div className="p-3 rounded-xl text-sm text-center animate-pulse bg-yellow-100 border border-yellow-300 text-yellow-700 font-serif">
                    📐 Memorize the pattern! It will disappear in a moment...
                </div>
            )}
            <div className="relative rounded-2xl overflow-hidden mx-auto border-4 border-yellow-500 shadow-2xl" style={{ width: 400, height: 400, background: 'linear-gradient(135deg, #fffde7, #ffe082)' }}>
                <svg viewBox="0 0 400 400" className="w-full h-full">
                    {showTarget && pattern.targetLines.map((line, idx) => (
                        <line key={`t-${idx}`} x1={pattern.dots[line.from].x} y1={pattern.dots[line.from].y} x2={pattern.dots[line.to].x} y2={pattern.dots[line.to].y}
                            stroke="#b8860b" strokeWidth={3} strokeDasharray="8,4" opacity={0.4} />
                    ))}
                    {drawnLines.map((line, idx) => (
                        <line key={`d-${idx}`} x1={pattern.dots[line.from].x} y1={pattern.dots[line.from].y} x2={pattern.dots[line.to].x} y2={pattern.dots[line.to].y}
                            stroke={isLineCorrect(line.from, line.to) ? '#b8860b' : '#ef4444'} strokeWidth={4} strokeLinecap="round" />
                    ))}
                    {pattern.dots.map((dot, idx) => (
                        <g key={idx} onClick={() => handleDotClick(idx)} className="cursor-pointer">
                            <circle cx={dot.x} cy={dot.y} r={selectedDot === idx ? 14 : 10}
                                fill={selectedDot === idx ? '#ffd700' : '#e6b800'} stroke={selectedDot === idx ? '#b8860b' : '#ffd700'} strokeWidth={3} className="transition-all duration-200" />
                            <text x={dot.x} y={dot.y + 1} textAnchor="middle" dominantBaseline="central" fill="#5c3d0a" fontSize="10" fontWeight="bold" className="pointer-events-none select-none">{idx + 1}</text>
                        </g>
                    ))}
                </svg>
                {completed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(255,253,231,0.95)' }}>
                        <Star className="w-16 h-16 mb-4 text-yellow-500" />
                        <h3 className="text-2xl font-extrabold mb-2 text-yellow-700 font-serif">Level Complete!</h3>
                        <p className="text-sm mb-4 text-yellow-600">Great pattern matching!</p>
                        <Button onClick={handleNextLevel} className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl font-serif">
                            {currentLevel < PUZZLE_PATTERNS.length - 1 ? (<>Next Level <ArrowRight className="w-4 h-4 ml-2" /></>) : (<>Finish Game <Trophy className="w-4 h-4 ml-2" /></>)}
                        </Button>
                    </div>
                )}
            </div>
            <div className="flex gap-3 justify-center">
                <Button onClick={handleReset} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif"><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
                <Button onClick={() => setShowTarget(true)} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif">👁 Peek Pattern</Button>
            </div>
            <p className="text-center text-xs text-yellow-500 font-serif">Click two dots to draw a line. Recreate the pattern from memory!</p>
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
        const pScore = Math.min(100, Math.round(lines.length * 5 + Math.max(0, timeLeft * 2) + (lines.length > 4 ? 20 : 0)))
        const oScore = Math.floor(Math.random() * 30) + 55
        setPlayerScore(pScore); setOpponentScore(oScore)
        onComplete(pScore, 1, (60 - timeLeft) * 1000)
    }

    return (
        <div className="space-y-4">
            {!started ? (
                <div className="text-center py-10 space-y-6">
                    <Swords className="w-16 h-16 mx-auto text-yellow-500" />
                    <h3 className="text-2xl font-extrabold text-yellow-700 font-serif">1v1 Battle Arena</h3>
                    <p className="max-w-md mx-auto text-yellow-600 font-serif">Get a random prompt. Draw a Kolam in 60 seconds. Your design will be scored against an AI opponent!</p>
                    <Button onClick={startBattle} className="text-lg px-8 py-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl font-serif shadow-xl">
                        <Swords className="w-5 h-5 mr-2" /> Start Battle!
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <Badge className="bg-red-500 text-white flex items-center gap-1"><Swords className="w-3 h-3" /> Battle Mode</Badge>
                        <div className={`text-lg font-mono font-bold flex items-center gap-1 ${timeLeft <= 10 ? 'animate-pulse text-red-500' : 'text-yellow-700'}`}><Timer className="w-4 h-4" /> {timeLeft}s</div>
                    </div>
                    <div className="p-3 rounded-xl text-center bg-yellow-100 border border-yellow-300 font-serif">
                        <span className="font-medium text-sm text-yellow-600">✨ Prompt: </span>
                        <span className="font-bold text-yellow-700">{prompt}</span>
                    </div>
                    <div className="relative rounded-2xl overflow-hidden mx-auto border-4 border-yellow-500 shadow-2xl" style={{ width: 400, height: 400, background: 'linear-gradient(135deg, #fffde7, #ffe082)' }}>
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                            {lines.map((line, idx) => (
                                <line key={idx} x1={dots[line.from].x} y1={dots[line.from].y} x2={dots[line.to].x} y2={dots[line.to].y}
                                    stroke="#b8860b" strokeWidth={3} strokeLinecap="round" />
                            ))}
                            {dots.map((dot, idx) => (
                                <g key={idx} onClick={() => handleDotClick(idx)} className="cursor-pointer">
                                    <circle cx={dot.x} cy={dot.y} r={selectedDot === idx ? 12 : 8}
                                        fill={selectedDot === idx ? '#ffd700' : '#e6b800'} stroke={selectedDot === idx ? '#b8860b' : '#ffd700'} strokeWidth={2} className="transition-all duration-200" />
                                </g>
                            ))}
                        </svg>
                        {finished && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(255,253,231,0.95)' }}>
                                <Crown className="w-12 h-12 mb-3 text-yellow-500" />
                                <h3 className="text-xl font-extrabold mb-4 text-yellow-700 font-serif">
                                    {playerScore > opponentScore ? '🎉 You Win!' : playerScore === opponentScore ? '🤝 Tie!' : '😅 Opponent Wins!'}
                                </h3>
                                <div className="flex gap-8 mb-6">
                                    <div className="text-center"><div className="text-3xl font-black text-yellow-700">{playerScore}</div><div className="text-xs text-yellow-600">You</div></div>
                                    <div className="text-2xl font-bold self-center text-yellow-400">vs</div>
                                    <div className="text-center"><div className="text-3xl font-black text-red-500">{opponentScore}</div><div className="text-xs text-yellow-600">AI Opponent</div></div>
                                </div>
                                <Button onClick={startBattle} className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl font-serif">
                                    <RotateCcw className="w-4 h-4 mr-2" /> Rematch
                                </Button>
                            </div>
                        )}
                    </div>
                    {!finished && (
                        <div className="flex justify-center gap-3">
                            <Button onClick={() => { setLines([]); setSelectedDot(null) }} className="bg-yellow-50 text-yellow-700 border-2 border-yellow-400 rounded-xl font-serif"><RotateCcw className="w-4 h-4 mr-2" /> Clear</Button>
                            <Button onClick={finishBattle} className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl font-serif"><Zap className="w-4 h-4 mr-2" /> Submit Early</Button>
                        </div>
                    )}
                    <p className="text-center text-xs text-yellow-500 font-serif">Click two dots to connect them. Draw your Kolam before time runs out!</p>
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
            const res = await fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game_type: gameType, score, level, time_ms: timeMs }) })
            const data = await res.json()
            if (data.success) setLastResult({ score, karma: data.karmaAwarded })
        } catch (err) { console.error(err) }
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }} className="font-display">
            <video autoPlay loop muted playsInline src="/Bg.mp4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Navbar />
                <main className="container py-10 flex flex-col items-center justify-center">

                    {/* Header */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-yellow-700 drop-shadow-[0_2px_12px_rgba(255,215,0,0.7)] tracking-tight leading-tight text-center uppercase border-b-4 border-yellow-500 pb-2"
                        style={{ fontFamily: 'Georgia, serif', color: '#FFD700', letterSpacing: '0.12em', textShadow: '0 2px 12px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
                        Interactive Kolam Games 🎮
                    </h1>
                    <p className="mt-4 text-lg font-bold font-serif text-center" style={{ color: '#FFD700', textShadow: '0 2px 8px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
                        Gamify Kolam patterns! Puzzle games, 1v1 Battles, unlock levels, challenge friends.<br className="hidden md:inline" />
                        <span className="text-yellow-700">Puzzle games · 1v1 Battles Arena · More games coming</span>
                    </p>

                    {/* Result Alert */}
                    {lastResult && (
                        <div className="mt-6 p-4 rounded-2xl text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-lg font-serif">
                            <span className="font-bold text-yellow-700">Score: {lastResult.score}</span>
                            <span className="mx-3 text-yellow-300">|</span>
                            <span className="font-bold text-green-600">+{lastResult.karma} Karma 🎉</span>
                        </div>
                    )}

                    {!activeGame ? (
                        <div className="mt-8 w-full grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {/* Puzzle Card */}
                            <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-hidden font-serif cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => setActiveGame('puzzle')}>
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
                                <CardContent className="relative z-10 p-6 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-yellow-100 border-2 border-yellow-400">
                                        <Puzzle className="w-10 h-10 text-yellow-600" />
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-yellow-700">Kolam Puzzle</h2>
                                    <p className="text-sm text-yellow-800">Memorize the pattern, then recreate it! Connect dots to match the Kolam design. Progress through 4 levels.</p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">Pattern Matching</Badge>
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">4 Levels</Badge>
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">Memory Game</Badge>
                                    </div>
                                    <Button className="w-full mt-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl shadow-xl">
                                        <Puzzle className="w-4 h-4 mr-2" /> Play Puzzle
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Battle Card */}
                            <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-hidden font-serif cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => setActiveGame('battle')}>
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
                                <CardContent className="relative z-10 p-6 text-center space-y-4">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-yellow-100 border-2 border-yellow-400">
                                        <Swords className="w-10 h-10 text-yellow-600" />
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-yellow-700">1v1 Battle Arena</h2>
                                    <p className="text-sm text-yellow-800">Get a random prompt, draw a Kolam in 60 seconds, and compete against an AI opponent!</p>
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">Timed Challenge</Badge>
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">vs AI</Badge>
                                        <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">60 Seconds</Badge>
                                    </div>
                                    <Button className="w-full mt-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl shadow-xl">
                                        <Swords className="w-4 h-4 mr-2" /> Enter Arena
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="mt-8 max-w-lg mx-auto w-full">
                            <Button variant="ghost" onClick={() => { setActiveGame(null); setLastResult(null) }} className="mb-6 text-yellow-600 hover:text-yellow-700 font-serif">← Back to Games</Button>
                            <Card className="bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-hidden font-serif">
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
                                <CardContent className="relative z-10 p-6">
                                    {activeGame === 'puzzle' ? (
                                        <PuzzleGame onComplete={(score, level, timeMs) => handleGameComplete('puzzle', score, level, timeMs)} />
                                    ) : (
                                        <BattleArena onComplete={(score, level, timeMs) => handleGameComplete('battle', score, level, timeMs)} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {!user && (
                        <div className="mt-8 text-center p-4 rounded-2xl bg-yellow-50 border border-yellow-300 font-serif">
                            <p className="text-sm text-yellow-700">
                                <a href="/signin" className="font-bold hover:underline text-yellow-800">Sign in</a> to track your scores and earn Kolam Karma!
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
