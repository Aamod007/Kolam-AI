
"use client";
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { Button } from '@/components/ui/button';
import { BookOpen, MapPin, Sparkle, Info, HelpCircle } from 'lucide-react';
import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import indiaMap from './indiamap.png';
import traditionalKolam from './traditionalkolam.png';
import modernTechnology from './moderntechnology.png';
import andhraImage from './andhra.jpeg';
import kolkataImage from './kolkata.jpeg';
import northIndiaImage from './northindia.jpeg';
import tamilNaduImage from './tamilnadu.png';
import { useAuth } from '@/components/site/auth-context';

const kolamFacts = [
  "Kolams are drawn fresh every morning at the entrance of homes.",
  "Rice flour Kolams feed birds and ants, symbolizing harmony with nature.",
  "Dots in Kolam represent cosmic energy and order.",
  "Kolams are eco-friendly and foster community bonds.",
  "The word 'Kolam' comes from Sanskrit meaning 'beauty' or 'auspiciousness'.",
  "Kolams can have up to 10,000+ dots in complex designs.",
  "Ancient Tamil literature mentions Kolams as early as 2nd century BCE.",
  "Kolams are believed to ward off evil spirits and bring prosperity.",
  "Each dot in a Kolam represents a prayer or positive energy.",
  "Kolams are drawn with fingers, creating a meditative experience.",
  "The largest Kolam ever drawn spanned over 1.5 kilometers!",
  "Kolams use only natural materials like rice flour and flower petals.",
  "In some regions, Kolams are called 'Rangoli' or 'Muggu'.",
  "Kolam drawing is considered an art form passed down through generations.",
  "The symmetry in Kolams represents balance and harmony in life."
];

const regionImages = {
  'Tamil Nadu': tamilNaduImage,
  'Karnataka': kolkataImage, // Assuming kolkata.jpeg is for Karnataka
  'Andhra/Telangana': andhraImage,
  'North India': northIndiaImage
};

const quizQuestions = [
  {
    question: "Which state is famous for Pulli Kolam?",
    options: ["Karnataka", "Tamil Nadu", "Punjab", "Kerala"],
    answer: 1,
    category: "Regional",
    difficulty: "easy" as const
  },
  {
    question: "What is the eco-friendly material used for Kolam?",
    options: ["Plastic", "Rice Flour", "Paint", "Sand"],
    answer: 1,
    category: "Materials",
    difficulty: "easy" as const
  },
  {
    question: "Which festival is most associated with Kolam?",
    options: ["Pongal", "Holi", "Eid", "Christmas"],
    answer: 0,
    category: "Festivals",
    difficulty: "easy" as const
  },
  {
    question: "What do the dots in Kolam represent?",
    options: ["Money", "Cosmic Energy", "Animals", "Weather"],
    answer: 1,
    category: "Symbolism",
    difficulty: "medium" as const
  },
  {
    question: "Which region is known for Rangavalli patterns?",
    options: ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Maharashtra"],
    answer: 1,
    category: "Regional"
  },
  {
    question: "What is the traditional time to draw Kolams?",
    options: ["Afternoon", "Evening", "Morning", "Night"],
    answer: 2,
    category: "Tradition",
    difficulty: "medium" as const
  },
  {
    question: "Which state calls Kolam 'Muggu'?",
    options: ["Kerala", "Andhra Pradesh", "Telangana", "Goa"],
    answer: 1,
    category: "Regional"
  },
  {
    question: "What is the main purpose of Kolam?",
    options: ["Decoration", "Spiritual Welcome", "Art Competition", "Festival Celebration"],
    answer: 1,
    category: "Purpose"
  },
  {
    question: "Which animal benefits from rice flour Kolams?",
    options: ["Cats", "Birds and Ants", "Dogs", "Cows"],
    answer: 1,
    category: "Ecology"
  },
  {
    question: "What geometric shape is fundamental to Kolam?",
    options: ["Triangle", "Square", "Dot", "Circle"],
    answer: 2,
    category: "Design"
  },
  {
    question: "Which festival features elaborate Kolam competitions?",
    options: ["Diwali", "Pongal", "Holi", "Eid"],
    answer: 1,
    category: "Festivals"
  },
  {
    question: "What does Kolam symbolize in Hindu tradition?",
    options: ["Wealth", "Auspiciousness", "Power", "Knowledge"],
    answer: 1,
    category: "Symbolism"
  }
];

function TimelineSVG() {
  return (
    <svg width="100%" height="80" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="my-4">
      <circle cx="40" cy="40" r="18" fill="#fbbf24" />
      <text x="40" y="40" textAnchor="middle" dy=".3em" fontSize="14" fill="#fff">Dots</text>
      <rect x="80" y="30" width="60" height="20" rx="10" fill="#fde68a" />
      <text x="110" y="45" textAnchor="middle" fontSize="13" fill="#92400e">Lines</text>
      <ellipse cx="180" cy="40" rx="25" ry="18" fill="#f59e42" />
      <text x="180" y="40" textAnchor="middle" dy=".3em" fontSize="14" fill="#fff">Patterns</text>
      <rect x="230" y="30" width="60" height="20" rx="10" fill="#a7f3d0" />
      <text x="260" y="45" textAnchor="middle" fontSize="13" fill="#065f46">Festival</text>
      <ellipse cx="340" cy="40" rx="25" ry="18" fill="#818cf8" />
      <text x="340" y="40" textAnchor="middle" dy=".3em" fontSize="14" fill="#fff">Digital</text>
    </svg>
  );
}

function IndiaMap({ onRegionClick }: { onRegionClick: (region: string) => void }) {
  return (
    <svg viewBox="0 0 300 300" width="100%" height="180" className="my-4">
      <g>
        <rect x="40" y="120" width="40" height="40" fill="#fbbf24" onClick={() => onRegionClick('Tamil Nadu')} />
        <rect x="90" y="100" width="40" height="40" fill="#34d399" onClick={() => onRegionClick('Karnataka')} />
        <rect x="140" y="80" width="40" height="40" fill="#818cf8" onClick={() => onRegionClick('Andhra/Telangana')} />
        <rect x="190" y="60" width="40" height="40" fill="#f472b6" onClick={() => onRegionClick('North India')} />
      </g>
      <text x="60" y="115" fontSize="12" textAnchor="middle">Tamil Nadu</text>
      <text x="110" y="95" fontSize="12" textAnchor="middle">Karnataka</text>
      <text x="160" y="75" fontSize="12" textAnchor="middle">Andhra/Telangana</text>
      <text x="210" y="55" fontSize="12" textAnchor="middle">North India</text>
    </svg>
  );
}

export default function HeritageExplorerPage() {
  const auth = useAuth();
  const user = auth?.user;

  // Rotating Globe and Stars React Component
  const GlobeBanner = () => (
    <div className="section-banner mx-auto mb-6">
      <div id="star-1">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-2">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-3">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-4">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-5">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-6">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
      <div id="star-7">
        <div className="curved-corner-star">
          <div id="curved-corner-bottomright"></div>
          <div id="curved-corner-bottomleft"></div>
        </div>
        <div className="curved-corner-star">
          <div id="curved-corner-topright"></div>
          <div id="curved-corner-topleft"></div>
        </div>
      </div>
    </div>
  );
  // Rotating Earth JSX (converted from HTML/CSS)
  const RotatingEarth = () => (
    <div className="section-banner mx-auto mb-6" style={{ height: 250, width: 250 }}>
      {[...Array(7)].map((_, i) => (
        <div key={i} id={`star-${i + 1}`} className="absolute">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>
      ))}
    </div>
  );
  const [factIdx, setFactIdx] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [kolamKarma, setKolamKarma] = useState(0);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<(typeof quizQuestions[0] & { difficulty?: string; explanation?: string })[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('mixed');
  const [selectedDifficulty, setSelectedDifficulty] = useState('mixed');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [questionTimer, setQuestionTimer] = useState<NodeJS.Timeout | null>(null);
  const [quizKarmaEarned, setQuizKarmaEarned] = useState(0);
  const [factTimeout, setFactTimeout] = useState<NodeJS.Timeout | null>(null);
  const [karmaSaved, setKarmaSaved] = useState(false);
  const [karmaAnimation, setKarmaAnimation] = useState(false);
  const [earnedKarmaDisplay, setEarnedKarmaDisplay] = useState<number | null>(null);
  const [karmaUpdateCounter, setKarmaUpdateCounter] = useState(0);

  // Load initial karma from local DB
  useEffect(() => {
    const loadInitialKarma = async () => {
      if (!user) return;

      try {
        const res = await fetch('/api/user/karma');
        if (!res.ok) {
          console.error('Error loading initial karma');
          return;
        }

        const data = await res.json();
        const currentKarma = data.kolam_karma || 0;
        setKolamKarma(currentKarma);
        console.log('Loaded initial karma:', currentKarma);
      } catch (error) {
        console.error('Unexpected error loading initial karma:', error);
      }
    };

    loadInitialKarma();
  }, [user]);

  const saveKolamKarma = async (earnedKarma: number) => {
    if (!user) {
      console.error('No user logged in, skipping karma save');
      return false;
    }

    if (earnedKarma <= 0) {
      console.error('Invalid earned karma value:', earnedKarma);
      return false;
    }

    try {
      console.log('Saving earned Kolam Karma:', earnedKarma, 'for user:', (user as any).id);

      const res = await fetch('/api/user/karma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ earnedKarma })
      });

      if (!res.ok) {
        console.error('Failed to update karma', await res.text());
        return false;
      }

      const data = await res.json();
      console.log('✅ Kolam Karma updated successfully. New total:', data.kolam_karma);
      setKarmaSaved(true);
      return true;
    } catch (error) {
      console.error('Unexpected error saving Kolam Karma:', error);
      return false;
    }
  };

  // Debug effect to track karma changes
  useEffect(() => {
    console.log('KolamKarma state changed to:', kolamKarma);
  }, [kolamKarma]);

  // Timer effect for questions
  // ...existing code...

  // Shuffle array utility function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch questions from Gemini API
  const fetchQuizQuestions = async () => {
    setIsLoadingQuestions(true);
    setQuizError(null);

    try {
      // Add timestamp to ensure fresh requests
      const timestamp = Date.now();
      const params = new URLSearchParams({
        count: questionCount.toString(),
        category: 'mixed',
        difficulty: 'mixed',
        t: timestamp.toString() // Add timestamp to prevent caching
      });

      const response = await fetch(`/api/quiz-questions?${params}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      if (data.questions && Array.isArray(data.questions)) {
        setCurrentQuizQuestions(data.questions);
        return data.questions;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      setQuizError(error instanceof Error ? error.message : 'Failed to load questions');
      // Fallback to static questions if API fails
      const fallbackQuestions = shuffleArray(quizQuestions).slice(0, questionCount);
      setCurrentQuizQuestions(fallbackQuestions);
      return fallbackQuestions;
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Start new quiz with random questions
  const startNewQuiz = async () => {
    const questions = await fetchQuizQuestions();
    if (questions && questions.length > 0) {
      setQuizIdx(0);
      setScore(0);
      setShowQuizResult(false);
      setQuizStarted(true);
      setTimeLeft(30); // Start timer
      setQuizKarmaEarned(0); // Reset karma earned for this quiz
      setKarmaSaved(false); // Reset karma saved status
    }
  };

  const handleNextFact = () => {
    setFactIdx((prev) => (prev + 1) % kolamFacts.length);
    setShowFact(true);
    // Clear any existing timeout
    if (factTimeout) {
      clearTimeout(factTimeout);
    }
    // Set new timeout to hide fact after 8 seconds (increased from 1.8s)
    const newTimeout = setTimeout(() => setShowFact(false), 8000);
    setFactTimeout(newTimeout);
  };

  const handleRegionClick = (region: string) => {
    if (selectedRegion === region) {
      // If clicking the same region, go back to map
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedRegion('');
        setIsTransitioning(false);
      }, 150);
    } else {
      // If clicking a different region, transition to it
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedRegion(region);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleQuizAnswer = (idx: number) => {
    const currentQuestion = currentQuizQuestions[quizIdx];
    const isCorrect = idx === currentQuestion.answer;
    const isTimeout = idx === -1;

    let karmaEarned = 0;
    if (isCorrect && !isTimeout) {
      setScore(prev => prev + 1);
      karmaEarned = 1;
      setQuizKarmaEarned(prev => prev + 1); // Track karma earned this session
    }

    if (quizIdx + 1 < currentQuizQuestions.length) {
      setQuizIdx(quizIdx + 1);
      setTimeLeft(30); // Reset timer for next question
      // Award karma for correct answer
      if (karmaEarned > 0) {
        // Update local karma immediately for real-time display
        setKolamKarma(prev => {
          const newKarma = prev + karmaEarned;
          console.log('Real-time karma update:', newKarma);
          return newKarma;
        });
        setKarmaUpdateCounter(prev => prev + 1); // Force re-render

        // Trigger animation and earned display separately
        setKarmaAnimation(true);
        setEarnedKarmaDisplay(karmaEarned);
        setTimeout(() => {
          setKarmaAnimation(false);
          setEarnedKarmaDisplay(null);
        }, 1000);

        // Save earned karma to MongoDB
        saveKolamKarma(karmaEarned).then(success => {
          if (!success) {
            console.error('Failed to save karma for individual question');
            // Revert local state if save failed
            setKolamKarma(prev => {
              const reverted = prev - karmaEarned;
              console.log('Reverting karma due to save failure:', reverted);
              return reverted;
            });
          } else {
            console.log('Karma saved successfully for individual question. New total should be:', kolamKarma + karmaEarned);
          }
        });
      }
    } else {
      setShowQuizResult(true);
      setQuizStarted(false);

      // Calculate final karma including bonus
      const currentKarma = kolamKarma;
      const finalScore = isCorrect && !isTimeout ? score + 1 : score;
      const bonusKarma = finalScore >= Math.floor(currentQuizQuestions.length * 0.7) ? 2 : 0;
      const totalKarmaEarned = karmaEarned + bonusKarma;

      // Update session karma earned
      setQuizKarmaEarned(prev => prev + totalKarmaEarned);

      // Update local karma immediately for real-time display
      setKolamKarma(prev => {
        const newKarma = prev + totalKarmaEarned;
        console.log('Final quiz karma update:', newKarma);
        return newKarma;
      });
      setKarmaUpdateCounter(prev => prev + 1); // Force re-render

      // Trigger animation and earned display separately
      setKarmaAnimation(true);
      setEarnedKarmaDisplay(totalKarmaEarned);
      setTimeout(() => {
        setKarmaAnimation(false);
        setEarnedKarmaDisplay(null);
      }, 2000);

      // Save final earned karma to MongoDB
      saveKolamKarma(totalKarmaEarned).then(success => {
        if (success) {
          console.log('Final quiz karma saved successfully');
          setKarmaSaved(true);
        } else {
          console.error('Failed to save final quiz karma');
          // Revert local state if save failed
          setKolamKarma(prev => {
            const reverted = prev - totalKarmaEarned;
            console.log('Reverting final karma due to save failure:', reverted);
            return reverted;
          });
        }
      });
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/Bg.mp4"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'brightness(0.95) saturate(1.1) blur(0px)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <Navbar />
        <main className="container py-4 sm:py-8 px-4 sm:px-6 max-w-full sm:max-w-3xl mx-auto font-serif" style={{ fontFamily: 'Merriweather, serif', color: '#4B1E13' }}>
          {/* Hero Section */}
          <section className="mb-10 text-center flex flex-col items-center justify-center">
            {/* Unique Kolam SVG Motif */}
            <div className="mb-4 flex justify-center">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <circle cx="60" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <circle cx="100" cy="20" r="18" stroke="#FFD700" strokeWidth="2" fill="#80000022" />
                <path d="M20 20 Q40 0 60 20 Q80 40 100 20" stroke="#FFD700" strokeWidth="2" fill="none" />
              </svg>
            </div>
            {/* Hero Content Overlay */}
            <div className="relative rounded-2xl shadow-xl p-6 mx-auto" style={{ background: 'linear-gradient(120deg, #4B1E13 80%, #FFD700 20%)', boxShadow: '0 6px 32px 0 rgba(75,30,19,0.18)', maxWidth: 700, zIndex: 2 }}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #800000, 0 0px 24px #FFD700', letterSpacing: '0.04em', position: 'relative' }}>
                <span style={{ display: 'inline-block', padding: '0 8px', borderRadius: '12px', background: 'linear-gradient(90deg, #FFD700 60%, #800000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', boxShadow: '0 2px 12px #800000' }}>Kolam Heritage Explorer</span>
                <span className="absolute left-0 right-0 -bottom-2 mx-auto w-2/3 h-1 bg-gradient-to-r from-[#FFD700] via-[#800000] to-[#FFD700] opacity-60 rounded-full"></span>
              </h1>
              <div className="mb-2">
                <span className="block animate-shimmer" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', fontSize: '1.25rem', letterSpacing: '0.05em', textShadow: '0 1px 8px #800000', background: 'linear-gradient(90deg, #FFD700 60%, #800000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  मङ्गलं भगवान् विष्णुः
                </span>
                <style>{`
                @keyframes shimmer {
                  0% { opacity: 0.7; }
                  50% { opacity: 1; text-shadow: 0 0 16px #FFD700, 0 1px 8px #800000; }
                  100% { opacity: 0.7; }
                }
                .animate-shimmer {
                  animation: shimmer 2.5s infinite;
                }
              `}</style>
              </div>
              <p className="text-base sm:text-lg max-w-xl mx-auto px-4" style={{ color: '#FFF8E1', textShadow: '0 1px 8px #800000', fontFamily: 'Merriweather, serif' }}>
                Explore the vibrant history, cultural depth, and artistic evolution of Kolams—South India&apos;s living tradition of art and welcome.
              </p>
              {/* Floating Kolam Dots Accent */}
              <div className="absolute top-2 right-6 animate-bounce" style={{ color: '#FFD700', fontSize: '1.5rem', opacity: 0.7 }}>• • •</div>
              <div className="absolute bottom-2 left-6 animate-bounce" style={{ color: '#800000', fontSize: '1.5rem', opacity: 0.7 }}>• • •</div>
            </div>
          </section>

          {/* History & Origin Section */}
          <section className="mb-8 p-4 sm:p-6 rounded-xl shadow mx-4 sm:mx-0 border-2 border-yellow-700/40 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/10" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.08)' }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13' }}>
              History & Origin
            </h2>
            <p className="mb-2 text-sm sm:text-base" style={{ color: '#FFF8E1', textShadow: '0 1px 8px #4B1E13' }}>
              Kolams are intricate patterns drawn at the thresholds of homes, especially in Tamil Nadu and South India. Their roots trace back centuries, symbolizing auspiciousness and daily renewal. Traditionally made with rice flour, Kolams are part of morning rituals, festivals like Pongal, and special occasions—welcoming prosperity and guests.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 rounded-lg flex flex-col items-center justify-center border-2 border-yellow-700/40 overflow-hidden relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-700/30 hover:-translate-y-1">
                <Image
                  src={traditionalKolam}
                  alt="Traditional Kolam"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:brightness-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 transform transition-all duration-300 group-hover:bg-black/80">
                  <span className="font-bold text-xs sm:text-sm text-[#FFD700]">Traditional Kolam</span>
                  <span className="block text-xs text-[#FFD700]">Rice flour, doorstep</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#4B1E13]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </div>
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center border overflow-hidden relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 rounded-lg flex flex-col items-center justify-center border-2 border-yellow-700/40 overflow-hidden relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-700/30 hover:-translate-y-1">
                  <Image
                    src={modernTechnology}
                    alt="Modern Kolam Technology"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:brightness-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 transform transition-all duration-300 group-hover:bg-black/80">
                    <span className="font-bold text-xs sm:text-sm text-[#FFD700]">Modern Kolam</span>
                    <span className="block text-xs text-[#FFD700]">Digital, creative</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4B1E13]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Cultural Significance Section */}
          <section className="mb-8 p-4 sm:p-6 rounded-xl shadow mx-4 sm:mx-0 border-2 border-[#800000]/40 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/10" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.08)' }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13' }}>
              Cultural Significance
            </h2>
            <div className="flex justify-center mb-4">
              <GlobeBanner />
            </div>
            <ul className="list-disc pl-4 sm:pl-6 text-sm sm:text-base mb-2 space-y-2" style={{ color: '#800000' }}>
              <li><b style={{ color: '#FFD700' }}>Dots & Symmetry:</b> <span style={{ color: '#FFF8E1' }}>Dots represent cosmic energy and order; symmetry reflects balance and harmony.</span></li>
              <li><b style={{ color: '#FFD700' }}>Spiritual Meaning:</b> <span style={{ color: '#FFF8E1' }}>Kolams are believed to bring prosperity, protection, and a connection with nature.</span></li>
              <li><b style={{ color: '#FFD700' }}>Eco-Friendly:</b> <span style={{ color: '#FFF8E1' }}>Made with rice flour, Kolams feed birds and ants, supporting local ecology.</span></li>
              <li><b style={{ color: '#FFD700' }}>Community Bond:</b> <span style={{ color: '#FFF8E1' }}>Drawing Kolams fosters creativity, patience, and social connection.</span></li>
            </ul>
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-full max-w-md mx-auto">
                <video
                  className="w-full rounded-lg shadow-lg border-2 border-yellow-700"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/dotsPattern.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-yellow-700/10 pointer-events-none"></div>
              </div>
              <span className="text-xs mt-2" style={{ color: '#800000' }}>✨ Watch dots transform into beautiful Kolam patterns</span>
            </div>
          </section>

          {/* Evolution Gallery */}
          <section className="mb-8 p-4 sm:p-6 rounded-xl shadow mx-4 sm:mx-0 border-2 border-[#800000]/60 bg-gradient-to-br from-[#800000]/90 via-[#FFD700]/20 to-[#4B1E13]/80" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.12)' }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13' }}>
              Evolution of Kolam Art
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 border-2 border-[#FFD700]/50 hover:shadow-xl hover:shadow-[#FFD700]/30 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-[#FFF8E1]">•</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Dots</h3>
                <p className="text-xs" style={{ color: '#FFF8E1' }}>Foundation of all Kolams</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 border-2 border-[#FFD700]/50 hover:shadow-xl hover:shadow-[#FFD700]/30 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] flex items-center justify-center shadow-lg">
                  <span className="text-xl text-[#FFF8E1]">✦</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Lines</h3>
                <p className="text-xs" style={{ color: '#FFF8E1' }}>Connecting the cosmic energy</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 border-2 border-[#FFD700]/50 hover:shadow-xl hover:shadow-[#FFD700]/30 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] flex items-center justify-center shadow-lg">
                  <span className="text-xl text-[#FFF8E1]">❋</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Patterns</h3>
                <p className="text-xs" style={{ color: '#FFF8E1' }}>Intricate geometric designs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#4B1E13] via-[#800000]/80 to-[#FFD700]/30 border-2 border-[#FFD700]/50 hover:shadow-xl hover:shadow-[#FFD700]/30 transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] flex items-center justify-center shadow-lg">
                  <span className="text-xl text-[#FFF8E1]">💻</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Digital</h3>
                <p className="text-xs" style={{ color: '#FFF8E1' }}>Modern AI-generated Kolams</p>
              </div>
            </div>
            <div className="text-center mt-4 text-sm" style={{ color: '#FFD700', textShadow: '0 1px 4px #800000' }}>
              <span style={{ color: '#FFD700', textShadow: '0 1px 4px #4B1E13' }}>From simple dots to AI-powered creations: Kolam&apos;s artistic journey through time</span>
            </div>
          </section>

          {/* Regional Variations Section */}
          <section className="mb-8 p-6 rounded-xl shadow border-2 border-[#800000]/50 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.10)' }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13' }}>
              Regional Kolam Styles
            </h2>
            {/* Interactive Region Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 border-2 border-[#FFD700]/40 hover:shadow-xl hover:shadow-yellow-700/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 backdrop-blur-sm" onClick={() => handleRegionClick('Tamil Nadu')}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] border border-yellow-700/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Tamil Nadu</h3>
                    <p className="text-sm text-[#FFF8E1]">Pulli Kolam (dot grids)</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#FFF8E1' }}>The birthplace of Kolam art with intricate dot-based patterns</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 border-2 border-[#FFD700]/40 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 backdrop-blur-sm" onClick={() => handleRegionClick('Karnataka')}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] border border-purple-400/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🌿</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Karnataka</h3>
                    <p className="text-sm text-[#FFF8E1]">Rangavalli</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#FFF8E1' }}>Known for colorful Rangavalli patterns with natural motifs</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 border-2 border-[#FFD700]/40 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 backdrop-blur-sm" onClick={() => handleRegionClick('Andhra/Telangana')}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] border border-pink-400/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Andhra/Telangana</h3>
                    <p className="text-sm text-[#FFF8E1]">Muggu</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#FFF8E1' }}>Famous for Muggu designs with rice flour artistry</p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 border-2 border-[#FFD700]/40 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 backdrop-blur-sm" onClick={() => handleRegionClick('North India')}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#800000] border border-blue-400/40 flex items-center justify-center shadow-lg">
                    <span className="text-xl">🌈</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#FFD700]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>North India</h3>
                    <p className="text-sm text-[#FFF8E1]">Rangoli (colorful version)</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#FFF8E1' }}>Vibrant Rangoli patterns with colorful expressions</p>
              </div>
            </div>

            {selectedRegion && (
              <div className={`text-center mb-4 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
                }`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#800000]/10 text-[#800000] rounded-full font-semibold mb-4" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                  <MapPin className="w-4 h-4 text-[#FFD700]" />
                  {selectedRegion} style selected!
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setSelectedRegion('');
                      setIsTransitioning(false);
                    }, 150);
                  }}
                  className="mb-4 transition-all duration-200 hover:scale-105"
                >
                  Back to Map
                </Button>
              </div>
            )}

            <div className="mt-4 w-full flex justify-center">
              <div className="relative max-w-sm">
                <Image
                  src={selectedRegion ? regionImages[selectedRegion as keyof typeof regionImages] : indiaMap}
                  alt={selectedRegion ? `${selectedRegion} Kolam Style` : "Map of India"}
                  width={320}
                  height={240}
                  className={`rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl object-contain ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                  style={{ transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out', border: '2px solid #FFD700' }}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-[#FFD700]/10 pointer-events-none"></div>
              </div>
            </div>
          </section>

          {/* Did You Know Section - Enhanced */}
          <section className="mb-8 p-6 rounded-xl shadow border-2 border-[#800000]/40 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 relative overflow-hidden backdrop-blur-sm" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.10)' }}>
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFD700]/15 to-transparent rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#800000]/15 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-[#FFD700]/8 to-[#800000]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Floating Sparkles */}
            <div className="absolute top-4 right-4 text-[#FFD700] animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-4 left-4 text-[#800000] animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</div>
            <div className="absolute top-1/2 right-8 text-[#FFD700] animate-bounce" style={{ animationDelay: '2.5s' }}>💫</div>

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(128,0,0,0.10) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13', opacity: 1, transition: 'opacity 0.2s' }}>Did You Know?</h2>

              {/* Fact Counter */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFF8E1]/80 backdrop-blur-sm rounded-full border border-[#FFD700]/30 shadow-lg">
                  <span className="text-sm text-[#800000]">Fact</span>
                  <span className="font-bold text-lg text-[#FFD700]">{factIdx + 1}</span>
                  <span className="text-sm text-[#800000]">of</span>
                  <span className="font-bold text-lg text-[#FFD700]">{kolamFacts.length}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto mb-6">
                <div className="w-full bg-[#FFD700]/20 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#FFD700] via-[#800000] to-[#4B1E13] rounded-full transition-all duration-700 ease-out shadow-lg relative"
                    style={{ width: `${((factIdx + 1) / kolamFacts.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                {/* Enhanced Button */}
                <Button
                  variant="outline"
                  onClick={handleNextFact}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#FFD700]/80 to-[#800000]/80 hover:from-[#FFD700]/90 hover:to-[#800000]/90 border-2 border-[#FFD700]/40 hover:border-[#800000]/50 text-[#800000] font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  style={{ fontFamily: 'Cinzel Decorative, serif' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative flex items-center gap-3">
                    <span className="text-xl animate-spin group-hover:animate-pulse">🔮</span>
                    <span>Reveal Kolam Wisdom</span>
                    <span className="text-xl animate-spin group-hover:animate-pulse" style={{ animationDirection: 'reverse' }}>✨</span>
                  </span>
                </Button>

                {/* Enhanced Fact Display */}
                {showFact && (
                  <div className={`relative max-w-2xl mx-auto transition-all duration-700 transform ${showFact ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                    }`}>
                    {/* Fact Card */}
                    <div className="relative p-6 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 border-2 border-[#FFD700]/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm hover:shadow-xl hover:shadow-yellow-700/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1">
                      {/* Animated Background Elements */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FFD700]/10 to-transparent rounded-full blur-xl animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#800000]/10 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-[#FFD700]/5 to-[#800000]/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>

                      {/* Floating Sparkles */}
                      <div className="absolute top-3 right-3 text-[#FFD700] animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
                      <div className="absolute bottom-3 left-3 text-[#800000] animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</div>
                      <div className="absolute top-1/2 right-6 text-[#FFD700] animate-bounce" style={{ animationDelay: '2.5s' }}>💫</div>

                      {/* Subtle Grid Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(128,0,0,0.10) 1px, transparent 0)`,
                          backgroundSize: '15px 15px'
                        }}></div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-2 left-2 text-2xl animate-bounce">💡</div>
                      <div className="absolute top-2 right-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
                      <div className="absolute bottom-2 left-2 text-xl animate-pulse">✨</div>
                      <div className="absolute bottom-2 right-2 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>

                      {/* Inner Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#800000]/5 rounded-2xl"></div>

                      {/* Animated Border */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FFD700]/20 via-[#800000]/20 to-[#4B1E13]/20 animate-pulse"></div>
                      <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-[#FFF8E1]/90 to-[#800000]/90"></div>

                      {/* Floating Particles */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FFD700] rounded-full animate-ping opacity-75"></div>
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#800000] rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FFD700] rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#800000] rounded-full animate-ping opacity-75" style={{ animationDelay: '1.5s' }}></div>

                      {/* Fact Content */}
                      <div className="relative z-10 text-center">
                        <div className="inline-block p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#800000]/20 rounded-xl border border-[#FFD700]/30 mb-4 shadow-xl backdrop-blur-sm">
                          <p className="text-lg sm:text-xl font-semibold text-[#800000] leading-relaxed animate-fade-in drop-shadow-sm" style={{ fontFamily: 'Merriweather, serif' }}>
                            {kolamFacts[factIdx]}
                          </p>
                        </div>

                        {/* Fact Stats */}
                        <div className="flex justify-center gap-4 text-sm text-[#FFD700]">
                          <span className="flex items-center gap-1 px-3 py-1 bg-[#FFF8E1]/60 rounded-full border border-[#FFD700]/20 backdrop-blur-sm">
                            <span className="text-[#FFD700]">📚</span>
                            Wisdom #{factIdx + 1}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1 bg-[#FFF8E1]/60 rounded-full border border-[#FFD700]/20 backdrop-blur-sm">
                            <span className="text-[#800000]">🎯</span>
                            {Math.round(((factIdx + 1) / kolamFacts.length) * 100)}% Explored
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Particles */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FFD700] rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-[#800000] rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FFD700] rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#800000] rounded-full animate-ping opacity-75" style={{ animationDelay: '1.5s' }}></div>
                  </div>
                )}

                {/* Fun Stats */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-[#800000]">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFF8E1]/80 rounded-full border border-[#FFD700]/20 backdrop-blur-sm">
                    <span className="text-[#FFD700]">🎭</span>
                    <span>{kolamFacts.length} Facts</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFF8E1]/80 rounded-full border border-[#FFD700]/20 backdrop-blur-sm">
                    <span className="text-[#800000]">🌍</span>
                    <span>Ancient Wisdom</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FFF8E1]/80 rounded-full border border-[#FFD700]/20 backdrop-blur-sm">
                    <span className="text-[#800000]">🎨</span>
                    <span>Cultural Heritage</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gamified Quiz Section */}
          <section className="mb-8 p-4 sm:p-6 rounded-xl shadow border-2 border-[#800000]/40 bg-gradient-to-br from-[#FFF8E1]/90 via-[#FFD700]/30 to-[#800000]/20 relative overflow-hidden mx-4 sm:mx-0" style={{ boxShadow: '0 4px 24px 0 rgba(128,0,0,0.10)' }}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-bl from-[#FFD700]/10 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#800000]/10 to-transparent rounded-full blur-xl"></div>

            {/* Credits Display */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-center" style={{ fontFamily: 'Cinzel Decorative, serif', color: '#FFD700', textShadow: '0 2px 12px #4B1E13' }}>
                Kolam Quiz Challenge
              </h2>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#800000]/10 rounded-full border border-[#FFD700]/30 self-center sm:self-auto relative">
                <span className={`text-[#FFD700] font-bold text-sm sm:text-base transition-all duration-300 ${karmaAnimation ? 'scale-110 text-yellow-300 animate-pulse' : ''}`} key={`karma-${kolamKarma}-${karmaUpdateCounter}`}>🪙 {kolamKarma}</span>
                <span className="text-[#800000] text-xs sm:text-sm">Karma</span>
                {earnedKarmaDisplay && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                    +{earnedKarmaDisplay}
                  </div>
                )}
              </div>
            </div>

            {!quizStarted ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FFD700] to-[#800000] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl">⏱️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-[#800000]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>AI-Powered Kolam Quiz!</h3>
                  <p className="text-[#4B1E13] mb-4">Dynamic questions generated by Gemini AI</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-sm text-[#800000]">
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-green-700">✓</span> Correct: +1 Karma
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-[#FFD700]">⭐</span> 70%+ score: +2 bonus
                    </span>
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-red-700">⏱️</span> 30s per question
                    </span>
                  </div>
                </div>

                {quizError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-sm">⚠️ {quizError}</p>
                    <p className="text-red-400 text-xs mt-1">Using fallback questions...</p>
                  </div>
                )}

                <Button
                  onClick={startNewQuiz}
                  disabled={isLoadingQuestions}
                  className="bg-gradient-to-r from-[#FFD700] to-[#800000] hover:from-[#FFD700]/90 hover:to-[#800000]/90 text-[#800000] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Cinzel Decorative, serif' }}
                >
                  {isLoadingQuestions ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
                      Generating Questions...
                    </span>
                  ) : (
                    'Start AI Quiz ⏱️'
                  )}
                </Button>
              </div>
            ) : !showQuizResult ? (
              <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-[#FFF8E1]/60 via-[#FFD700]/20 to-[#800000]/10 border border-[#FFD700]/30 backdrop-blur-sm mx-auto max-w-full">
                {/* Mobile-friendly header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <div className="text-sm text-slate-400 text-center sm:text-left">
                    Question {quizIdx + 1} of {currentQuizQuestions.length}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${timeLeft > 10 ? 'bg-green-500/20 text-green-300' :
                      timeLeft > 5 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300 animate-pulse'
                      }`}>
                      <span className="text-lg">⏱️</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <div className="flex gap-1 justify-center">
                      {Array.from({ length: currentQuizQuestions.length }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${i < quizIdx ? 'bg-green-500' : i === quizIdx ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2 sm:px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#800000]/20 text-[#800000] text-xs font-semibold rounded-full border border-[#FFD700]/30" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                    {currentQuizQuestions[quizIdx]?.category}
                    {(currentQuizQuestions[quizIdx] as any)?.difficulty && ` • ${(currentQuizQuestions[quizIdx] as any)?.difficulty}`}
                  </span>
                </div>

                <div className="font-bold text-base sm:text-lg mb-6 text-[#800000] leading-relaxed break-words" style={{ fontFamily: 'Merriweather, serif' }}>
                  {currentQuizQuestions[quizIdx]?.question}
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  {currentQuizQuestions[quizIdx]?.options.map((opt, idx) => (
                    <Button
                      key={opt}
                      variant="secondary"
                      onClick={() => handleQuizAnswer(idx)}
                      className="text-left justify-start p-3 sm:p-4 h-auto bg-gradient-to-r from-[#FFF8E1]/60 to-[#FFD700]/30 hover:from-[#FFD700]/40 hover:to-[#800000]/20 border border-[#FFD700]/20 hover:border-[#800000]/30 transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-md text-[#800000] font-medium text-sm sm:text-base min-h-[3rem] sm:min-h-[3.5rem]"
                      style={{ fontFamily: 'Merriweather, serif' }}
                    >
                      <span className="flex items-start gap-3 w-full">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-[#FFD700]/30 to-[#800000]/20 border border-[#FFD700]/30 flex items-center justify-center text-xs sm:text-sm font-bold text-[#800000] flex-shrink-0 mt-0.5" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 break-words leading-relaxed text-left">
                          {opt}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 text-sm">
                  <span className="text-[#800000] text-center sm:text-left">
                    Score: <span className="text-green-700 font-bold">{score}</span>
                  </span>
                  <span className="text-[#800000] text-center sm:text-right relative">
                    Karma: <span className={`text-[#FFD700] font-bold transition-all duration-300 ${karmaAnimation ? 'scale-110 text-yellow-300 animate-pulse' : ''}`} key={`karma-display-${kolamKarma}-${karmaUpdateCounter}`}>{kolamKarma}</span>
                    {earnedKarmaDisplay && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                        +{earnedKarmaDisplay}
                      </div>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${score >= Math.floor(currentQuizQuestions.length * 0.7)
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-[#FFD700] to-[#800000]'
                    }`}>
                    <span className="text-4xl">
                      {score >= Math.floor(currentQuizQuestions.length * 0.7) ? '🎉' : '👍'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-[#800000]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>Quiz Complete!</h3>

                  {karmaSaved && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg animate-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                        <span className="text-2xl">🎉</span>
                        Kolam Karma Updated!
                      </div>
                      <div className="text-green-700 text-sm mt-1">
                        Your new total is {kolamKarma} Kolam Karma points!
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#FFD700] to-[#800000] bg-clip-text mb-2" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
                      {score} / {currentQuizQuestions.length}
                    </div>
                    <div className="text-[#4B1E13]">
                      {score >= Math.floor(currentQuizQuestions.length * 0.7)
                        ? "Excellent! You're a Kolam expert! 🌟"
                        : "Good job! Keep learning about Kolam! 📚"
                      }
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#800000]/20 rounded-lg p-4 mb-6 border border-[#FFD700]/30">
                    <div className="text-[#FFD700] font-bold text-lg">
                      🪙 +{quizKarmaEarned} Karma Earned!
                    </div>
                    <div className="text-[#800000] text-sm mt-1">
                      {karmaSaved ? (
                        <span className="text-green-700 font-semibold">
                          ✅ Updated Total: {kolamKarma} Kolam Karma
                        </span>
                      ) : (
                        <span className="text-blue-700">
                          Saving to database...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={startNewQuiz}
                    className="bg-gradient-to-r from-[#FFD700] to-[#800000] hover:from-[#FFD700]/90 hover:to-[#800000]/90 text-[#800000] font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{ fontFamily: 'Cinzel Decorative, serif' }}
                  >
                    Play Again 🔄
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setQuizStarted(false)}
                    className="border-[#FFD700]/50 text-[#800000] hover:bg-[#FFD700]/10 py-3 px-6 rounded-full"
                    style={{ fontFamily: 'Cinzel Decorative, serif' }}
                  >
                    Back to Menu
                  </Button>
                </div>
              </div>
            )}
          </section>

          <div className="text-center mt-10">
            <Button
              asChild
              className="bg-gradient-to-r from-[#FFD700] to-[#800000] hover:from-[#FFD700]/90 hover:to-[#800000]/90 text-[#800000] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-[#FFD700]/50"
              style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '1.15rem', letterSpacing: '0.04em' }}
            >
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </main>
        {/* Footer is now handled globally in layout.tsx */}
      </div>
    </div>

  );
}
