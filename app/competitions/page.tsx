'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/site/auth-context'
import { ShieldCheck, Trophy, Upload, Clock, Star, Award, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ScoreDetail {
    symmetry: number
    complexity: number
    creativity: number
    style: number
}

interface Entry {
    id: string
    competition_id: string
    user_id: string
    user: { id: string; username: string; avatar_url: string } | null
    image_url: string
    score: number
    scores_detail: ScoreDetail
    submitted_at: string
}

interface Competition {
    id: string
    title: string
    description: string
    theme: string
    start_date: string
    end_date: string
    status: string
    entries: Entry[]
}

function getBadge(score: number) {
    if (score >= 90) return { label: '🥇 Gold', color: 'bg-yellow-500 text-black' }
    if (score >= 80) return { label: '🥈 Silver', color: 'bg-gray-300 text-black' }
    if (score >= 70) return { label: '🥉 Bronze', color: 'bg-amber-700 text-white' }
    return { label: '🎖️ Participant', color: 'bg-slate-600 text-white' }
}

function getTimeRemaining(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h remaining`
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-20" style={{ color: '#bfa335' }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1a0a12' }}>
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="w-8 text-right font-bold" style={{ color: '#ffd700' }}>{value}</span>
        </div>
    )
}

export default function CompetitionsPage() {
    const auth = useAuth()
    const user = auth?.user
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [description, setDescription] = useState('')
    const [result, setResult] = useState<{ score: number; scores_detail: ScoreDetail; badge: string } | null>(null)
    const [error, setError] = useState('')
    const [showSubmitForm, setShowSubmitForm] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { fetchCompetitions() }, [])

    async function fetchCompetitions() {
        try {
            const res = await fetch('/api/competitions')
            if (res.ok) {
                const data = await res.json()
                setCompetitions(data.competitions || [])
            }
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setSelectedImage(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    async function handleSubmit(competitionId: string) {
        if (!selectedImage || !user) return
        setSubmitting(true); setError(''); setResult(null)
        try {
            const res = await fetch('/api/competitions', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ competition_id: competitionId, image: selectedImage, description }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Submission failed')
            setResult(data); setShowSubmitForm(false); setSelectedImage(null); setDescription('')
            fetchCompetitions()
        } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
    }

    const activeCompetitions = competitions.filter(c => c.status === 'active')
    const pastCompetitions = competitions.filter(c => c.status !== 'active')

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
            <video autoPlay loop muted playsInline src="/Bg.mp4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
            />
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Navbar />
                <main className="container mx-auto max-w-5xl pt-10 px-4 pb-12">

                    {/* Hero */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <Trophy className="w-10 h-10" style={{ color: '#ffd700' }} />
                            <h1 className="text-4xl md:text-5xl font-black drop-shadow-md" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#ffd700', textShadow: '0 2px 12px #800000' }}>
                                Virtual Kolam Competitions
                            </h1>
                        </div>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#FFF8E1', fontFamily: 'Merriweather, serif', textShadow: '0 1px 8px #800000' }}>
                            Compete in online Kolam contests. AI judges creativity, symmetry, and style. Win badges and showcase your skills!
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Badge className="px-3 py-1" style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa335' }}>
                                <ShieldCheck className="w-3 h-3 mr-1" /> AI Judging
                            </Badge>
                            <Badge className="px-3 py-1" style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa335' }}>
                                <Award className="w-3 h-3 mr-1" /> Win Badges
                            </Badge>
                            <Badge className="px-3 py-1" style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa335' }}>
                                <Flame className="w-3 h-3 mr-1" /> Earn Karma
                            </Badge>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: '#ffd700', borderTopColor: 'transparent' }}></div>
                            <p className="mt-3" style={{ color: '#bfa335' }}>Loading competitions...</p>
                        </div>
                    ) : (
                        <>
                            {/* Result Alert */}
                            {result && (
                                <div className="mb-8 p-6 rounded-2xl shadow-xl animate-in slide-in-from-top-4" style={{ background: 'linear-gradient(135deg, #3a0a2a 0%, #4B1E13 100%)', border: '2px solid #ffd700' }}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Star className="w-8 h-8" style={{ color: '#ffd700' }} />
                                        <h3 className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>Submission Scored!</h3>
                                        <Badge className={`${getBadge(result.score).color} text-sm px-3 py-1 ml-auto`}>
                                            {getBadge(result.score).label}
                                        </Badge>
                                    </div>
                                    <div className="text-4xl font-black mb-4" style={{ color: '#fff' }}>{result.score}<span className="text-lg" style={{ color: '#bfa335' }}>/100</span></div>
                                    <div className="space-y-2">
                                        <ScoreBar label="Symmetry" value={result.scores_detail.symmetry} color="bg-blue-500" />
                                        <ScoreBar label="Complexity" value={result.scores_detail.complexity} color="bg-green-500" />
                                        <ScoreBar label="Creativity" value={result.scores_detail.creativity} color="bg-purple-500" />
                                        <ScoreBar label="Style" value={result.scores_detail.style} color="bg-amber-500" />
                                    </div>
                                    <p className="mt-3 text-sm" style={{ color: '#22c55e' }}>+15 Kolam Karma awarded! 🎉</p>
                                </div>
                            )}

                            {/* Active Competitions */}
                            {activeCompetitions.map(comp => (
                                <div key={comp.id} className="mb-10">
                                    <div className="p-6 rounded-2xl shadow-xl" style={{ background: 'linear-gradient(180deg, #1d1925 0%, #280c1a 100%)', border: '2px solid #bfa335' }}>
                                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge style={{ background: '#2d6a2e', color: '#fff' }}>Active</Badge>
                                                    <span className="text-sm flex items-center gap-1" style={{ color: '#bfa335' }}>
                                                        <Clock className="w-3 h-3" /> {getTimeRemaining(comp.end_date)}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl font-bold" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>{comp.title}</h2>
                                                <p style={{ color: '#FFF8E1' }}>{comp.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#ffd700', border: '1px solid #bfa335' }}>
                                                        🎨 Theme: {comp.theme}
                                                    </Badge>
                                                    <Badge style={{ background: 'rgba(75,30,19,0.7)', color: '#bfa335', border: '1px solid #bfa33577' }}>
                                                        {comp.entries.length} entries
                                                    </Badge>
                                                </div>

                                                {user ? (
                                                    <Button
                                                        onClick={() => setShowSubmitForm(!showSubmitForm)}
                                                        style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }}
                                                        className="mt-4"
                                                    >
                                                        <Upload className="w-4 h-4 mr-2" /> Submit Your Entry
                                                    </Button>
                                                ) : (
                                                    <Link href="/signin">
                                                        <Button style={{ background: 'linear-gradient(90deg, #b8860b, #ffd700)', color: '#1a0a12', fontWeight: 700 }} className="mt-4">
                                                            Sign in to Compete
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-center">
                                                <div className="rounded-xl p-4 min-w-[100px]" style={{ background: 'rgba(58,10,42,0.8)', border: '1px solid #bfa33555' }}>
                                                    <div className="text-2xl font-black" style={{ color: '#ffd700' }}>{comp.entries.length}</div>
                                                    <div className="text-xs" style={{ color: '#bfa335' }}>Entries</div>
                                                </div>
                                                <div className="rounded-xl p-4 min-w-[100px]" style={{ background: 'rgba(58,10,42,0.8)', border: '1px solid #bfa33555' }}>
                                                    <div className="text-2xl font-black" style={{ color: '#ffd700' }}>
                                                        {comp.entries.length > 0 ? Math.max(...comp.entries.map(e => e.score)) : '—'}
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#bfa335' }}>Top Score</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Form */}
                                        {showSubmitForm && (
                                            <div className="mt-6 p-6 rounded-xl space-y-4 animate-in slide-in-from-top-2" style={{ background: 'rgba(26,10,18,0.9)', border: '1px solid #bfa33555' }}>
                                                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#ffd700' }}>
                                                    <Zap className="w-5 h-5" /> Submit Your Kolam
                                                </h3>
                                                <div>
                                                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
                                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} style={{ borderColor: '#bfa335', color: '#bfa335' }}>
                                                        <Upload className="w-4 h-4 mr-2" /> {selectedImage ? 'Change Image' : 'Select Kolam Image'}
                                                    </Button>
                                                </div>
                                                {selectedImage && (
                                                    <div className="relative w-48 h-48 rounded-xl overflow-hidden" style={{ border: '2px solid #bfa335' }}>
                                                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                                    </div>
                                                )}
                                                <input
                                                    type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Describe your Kolam (optional)"
                                                    className="w-full p-3 rounded-lg focus:outline-none"
                                                    style={{ background: '#1a0a12', border: '1px solid #bfa33577', color: '#FFF8E1' }}
                                                />
                                                {error && (
                                                    <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{error}</div>
                                                )}
                                                <div className="flex gap-3">
                                                    <Button onClick={() => handleSubmit(comp.id)} disabled={!selectedImage || submitting}
                                                        style={{ background: 'linear-gradient(90deg, #2d6a2e, #3a8b3c)', color: '#fff', fontWeight: 700 }}>
                                                        {submitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />AI Scoring...</>) : (<><Star className="w-4 h-4 mr-2" />Submit & Get AI Score</>)}
                                                    </Button>
                                                    <Button variant="outline" onClick={() => { setShowSubmitForm(false); setError('') }} style={{ borderColor: '#bfa335', color: '#bfa335' }}>Cancel</Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Leaderboard */}
                                        {comp.entries.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#ffd700', fontFamily: 'Cinzel Decorative, serif' }}>
                                                    <Trophy className="w-5 h-5" /> Leaderboard
                                                </h3>
                                                <div className="space-y-3">
                                                    {comp.entries.sort((a, b) => b.score - a.score).map((entry, idx) => (
                                                        <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                                                            style={{
                                                                background: idx === 0 ? 'rgba(255,215,0,0.08)' : 'rgba(58,10,42,0.5)',
                                                                border: idx === 0 ? '1px solid rgba(255,215,0,0.4)' : idx === 1 ? '1px solid rgba(191,163,53,0.3)' : '1px solid rgba(191,163,53,0.15)'
                                                            }}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : ''}`}
                                                                style={idx > 2 ? { background: '#3a0a2a', color: '#bfa335', border: '1px solid #bfa33555' } : {}}>
                                                                {idx + 1}
                                                            </div>
                                                            {entry.image_url && (
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid #bfa33555' }}>
                                                                    <Image src={entry.image_url} alt="Entry" width={48} height={48} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold truncate" style={{ color: '#FFF8E1' }}>{entry.user?.username || 'Anonymous'}</div>
                                                                <div className="text-xs" style={{ color: '#bfa335' }}>{new Date(entry.submitted_at).toLocaleDateString()}</div>
                                                            </div>
                                                            <Badge className={`${getBadge(entry.score).color} text-xs`}>{getBadge(entry.score).label}</Badge>
                                                            <div className="text-right">
                                                                <div className="text-lg font-black" style={{ color: '#ffd700' }}>{entry.score}</div>
                                                                <div className="text-xs" style={{ color: '#bfa335' }}>points</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {activeCompetitions.length === 0 && !loading && (
                                <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(58,10,42,0.5)', border: '1px solid #bfa33555' }}>
                                    <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: '#bfa335' }} />
                                    <h3 className="text-xl font-bold" style={{ color: '#bfa335' }}>No active competitions</h3>
                                    <p className="mt-2" style={{ color: '#bfa33599' }}>Check back soon for new Kolam contests!</p>
                                </div>
                            )}

                            {pastCompetitions.length > 0 && (
                                <div className="mt-12">
                                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#bfa335', fontFamily: 'Cinzel Decorative, serif' }}>Past Competitions</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {pastCompetitions.map(comp => (
                                            <div key={comp.id} className="p-4 rounded-xl opacity-70" style={{ background: 'rgba(58,10,42,0.5)', border: '1px solid #bfa33544' }}>
                                                <h3 className="font-bold" style={{ color: '#FFF8E1' }}>{comp.title}</h3>
                                                <p className="text-sm mt-1" style={{ color: '#bfa335' }}>{comp.description}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Badge style={{ background: '#3a0a2a', color: '#bfa335' }}>{comp.entries.length} entries</Badge>
                                                    <Badge style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Ended</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
