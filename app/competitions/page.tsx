'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/site/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/site/auth-context'
import { ShieldCheck, Trophy, Upload, Clock, Star, Award, Flame, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface ScoreDetail { symmetry: number; complexity: number; creativity: number; style: number }
interface Entry { id: string; competition_id: string; user_id: string; user: { id: string; username: string; avatar_url: string } | null; image_url: string; score: number; scores_detail: ScoreDetail; submitted_at: string }
interface Competition { id: string; title: string; description: string; theme: string; start_date: string; end_date: string; status: string; entries: Entry[] }

function getBadge(score: number) {
    if (score >= 90) return { label: '🥇 Gold', color: 'bg-yellow-500 text-black' }
    if (score >= 80) return { label: '🥈 Silver', color: 'bg-gray-300 text-black' }
    if (score >= 70) return { label: '🥉 Bronze', color: 'bg-amber-700 text-white' }
    return { label: '🎖️ Participant', color: 'bg-slate-500 text-white' }
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
        <div className="flex items-center gap-2 text-xs font-serif">
            <span className="w-20 text-yellow-700 font-bold">{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-yellow-100">
                <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} />
            </div>
            <span className="w-8 text-right font-extrabold text-yellow-800">{value}</span>
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
        try { const res = await fetch('/api/competitions'); if (res.ok) { const data = await res.json(); setCompetitions(data.competitions || []) } } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setSelectedImage(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    async function handleSubmit(competitionId: string) {
        if (!selectedImage || !user) return
        setSubmitting(true); setError(''); setResult(null)
        try {
            const res = await fetch('/api/competitions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ competition_id: competitionId, image: selectedImage, description }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Submission failed')
            setResult(data); setShowSubmitForm(false); setSelectedImage(null); setDescription('')
            fetchCompetitions()
        } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
    }

    const activeCompetitions = competitions.filter(c => c.status === 'active')
    const pastCompetitions = competitions.filter(c => c.status !== 'active')

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }} className="font-display">
            <video autoPlay loop muted playsInline src="/Bg.mp4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Navbar />
                <main className="container py-10 flex flex-col items-center justify-center">

                    {/* Header — matching Recognition page */}
                    <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-yellow-700 drop-shadow-[0_2px_12px_rgba(255,215,0,0.7)] tracking-tight leading-tight text-center uppercase border-b-4 border-yellow-500 pb-2"
                        style={{ fontFamily: 'Georgia, serif', color: '#FFD700', letterSpacing: '0.12em', textShadow: '0 2px 12px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
                        Virtual Kolam Competitions 🏆
                    </h1>
                    <p className="mt-4 text-lg font-bold font-serif text-center" style={{ color: '#FFD700', textShadow: '0 2px 8px rgba(255,215,0,0.7), 0 1px 0 #fff' }}>
                        Compete in online Kolam contests. AI judges creativity, symmetry, and style.<br className="hidden md:inline" />
                        <span className="text-yellow-700">Win badges & rewards · Online competitions · AI judging</span>
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap mt-4">
                        <Badge className="px-3 py-1 bg-yellow-200 text-yellow-800 border border-yellow-400"><ShieldCheck className="w-3 h-3 mr-1" /> AI Judging</Badge>
                        <Badge className="px-3 py-1 bg-yellow-200 text-yellow-800 border border-yellow-400"><Award className="w-3 h-3 mr-1" /> Win Badges</Badge>
                        <Badge className="px-3 py-1 bg-yellow-200 text-yellow-800 border border-yellow-400"><Flame className="w-3 h-3 mr-1" /> Earn Karma</Badge>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <svg className="w-8 h-8 text-yellow-500 animate-spin mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <p className="mt-3 text-yellow-600 font-serif">Loading competitions...</p>
                        </div>
                    ) : (
                        <>
                            {/* Result Alert */}
                            {result && (
                                <Card className="mt-8 w-full max-w-2xl bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-hidden font-serif">
                                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
                                    <CardContent className="relative z-10 p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Star className="w-8 h-8 text-yellow-600" />
                                            <h3 className="text-2xl font-extrabold text-yellow-700 font-serif">Submission Scored!</h3>
                                            <Badge className={`${getBadge(result.score).color} text-sm px-3 py-1 ml-auto`}>{getBadge(result.score).label}</Badge>
                                        </div>
                                        <div className="text-4xl font-black text-yellow-800 mb-4">{result.score}<span className="text-lg text-yellow-600">/100</span></div>
                                        <div className="space-y-2">
                                            <ScoreBar label="Symmetry" value={result.scores_detail.symmetry} color="bg-blue-400" />
                                            <ScoreBar label="Complexity" value={result.scores_detail.complexity} color="bg-green-400" />
                                            <ScoreBar label="Creativity" value={result.scores_detail.creativity} color="bg-purple-400" />
                                            <ScoreBar label="Style" value={result.scores_detail.style} color="bg-amber-400" />
                                        </div>
                                        <p className="mt-3 text-sm text-green-700 font-bold">+15 Kolam Karma awarded! 🎉</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Active Competitions */}
                            {activeCompetitions.map(comp => (
                                <Card key={comp.id} className="mt-8 w-full max-w-3xl bg-gradient-to-br from-[#fffde7] via-[#ffe082] to-[#ffd700] shadow-2xl rounded-3xl border-4 border-yellow-500 relative overflow-hidden font-serif">
                                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('/kolam-hero.jpg')] bg-repeat" style={{ zIndex: 0 }} />
                                    <CardContent className="relative z-10 p-6">
                                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-green-500 text-white">Active</Badge>
                                                    <span className="text-sm flex items-center gap-1 text-yellow-700"><Clock className="w-3 h-3" /> {getTimeRemaining(comp.end_date)}</span>
                                                </div>
                                                <h2 className="text-2xl font-extrabold text-yellow-700 font-serif">{comp.title}</h2>
                                                <p className="text-yellow-800 font-serif">{comp.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400">🎨 Theme: {comp.theme}</Badge>
                                                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300">{comp.entries.length} entries</Badge>
                                                </div>
                                                {user ? (
                                                    <Button onClick={() => setShowSubmitForm(!showSubmitForm)} className="mt-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl hover:from-yellow-600 hover:to-yellow-500 rounded-2xl font-serif">
                                                        <Upload className="w-4 h-4 mr-2" /> Submit Your Entry
                                                    </Button>
                                                ) : (
                                                    <Link href="/signin"><Button className="mt-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold rounded-2xl font-serif">Sign in to Compete</Button></Link>
                                                )}
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-4 md:gap-2 text-center">
                                                <div className="rounded-xl p-4 min-w-[100px] bg-yellow-100 border border-yellow-300">
                                                    <div className="text-2xl font-black text-yellow-700">{comp.entries.length}</div>
                                                    <div className="text-xs text-yellow-600">Entries</div>
                                                </div>
                                                <div className="rounded-xl p-4 min-w-[100px] bg-yellow-100 border border-yellow-300">
                                                    <div className="text-2xl font-black text-yellow-700">{comp.entries.length > 0 ? Math.max(...comp.entries.map(e => e.score)) : '—'}</div>
                                                    <div className="text-xs text-yellow-600">Top Score</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submit Form */}
                                        {showSubmitForm && (
                                            <div className="mt-6 p-6 rounded-2xl space-y-4 bg-yellow-50 border-2 border-yellow-300 font-serif">
                                                <h3 className="text-lg font-extrabold text-yellow-700 flex items-center gap-2"><Zap className="w-5 h-5" /> Submit Your Kolam</h3>
                                                <div>
                                                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageSelect} />
                                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-yellow-400 text-yellow-700 bg-yellow-50 font-serif">
                                                        <Upload className="w-4 h-4 mr-2" /> {selectedImage ? 'Change Image' : 'Select Kolam Image'}
                                                    </Button>
                                                </div>
                                                {selectedImage && (
                                                    <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-yellow-400">
                                                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                                                    </div>
                                                )}
                                                <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your Kolam (optional)"
                                                    className="bg-yellow-50 border-yellow-400 rounded-xl font-serif text-yellow-900" />
                                                {error && <div className="p-3 rounded-lg text-sm text-red-600 bg-red-50 border border-red-200">{error}</div>}
                                                <div className="flex gap-3">
                                                    <Button onClick={() => handleSubmit(comp.id)} disabled={!selectedImage || submitting}
                                                        className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-white font-extrabold shadow-xl rounded-2xl font-serif">
                                                        {submitting ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />AI Scoring...</>) : (<><Star className="w-4 h-4 mr-2" />Submit & Get AI Score</>)}
                                                    </Button>
                                                    <Button variant="outline" onClick={() => { setShowSubmitForm(false); setError('') }} className="border-yellow-400 text-yellow-700 font-serif">Cancel</Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Leaderboard */}
                                        {comp.entries.length > 0 && (
                                            <div className="mt-6">
                                                <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-yellow-700 font-serif"><Trophy className="w-5 h-5" /> Leaderboard</h3>
                                                <div className="space-y-3">
                                                    {comp.entries.sort((a, b) => b.score - a.score).map((entry, idx) => (
                                                        <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${idx === 0 ? 'bg-yellow-200/60 border-2 border-yellow-400' : 'bg-yellow-50 border border-yellow-200'}`}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-white' : idx === 1 ? 'bg-gray-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>{idx + 1}</div>
                                                            {entry.image_url && (
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-yellow-300">
                                                                    <Image src={entry.image_url} alt="Entry" width={48} height={48} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold truncate text-yellow-800">{entry.user?.username || 'Anonymous'}</div>
                                                                <div className="text-xs text-yellow-600">{new Date(entry.submitted_at).toLocaleDateString()}</div>
                                                            </div>
                                                            <Badge className={`${getBadge(entry.score).color} text-xs`}>{getBadge(entry.score).label}</Badge>
                                                            <div className="text-right"><div className="text-lg font-black text-yellow-700">{entry.score}</div><div className="text-xs text-yellow-600">points</div></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {activeCompetitions.length === 0 && (
                                <div className="mt-12 text-center py-16 rounded-3xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 w-full max-w-2xl">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                                    <h3 className="text-xl font-bold text-yellow-600 font-serif">No active competitions</h3>
                                    <p className="mt-2 text-yellow-500 font-serif">Check back soon for new Kolam contests!</p>
                                </div>
                            )}

                            {pastCompetitions.length > 0 && (
                                <div className="mt-12 w-full max-w-3xl">
                                    <h2 className="text-2xl font-extrabold mb-6 text-yellow-600 font-serif">Past Competitions</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {pastCompetitions.map(comp => (
                                            <Card key={comp.id} className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-2xl opacity-80 font-serif">
                                                <CardContent className="p-4">
                                                    <h3 className="font-bold text-yellow-700">{comp.title}</h3>
                                                    <p className="text-sm mt-1 text-yellow-600">{comp.description}</p>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge className="bg-yellow-100 text-yellow-600">{comp.entries.length} entries</Badge>
                                                        <Badge className="bg-red-100 text-red-500">Ended</Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
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
