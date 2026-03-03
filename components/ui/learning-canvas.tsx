"use client";

import React, { useEffect, useRef, useState } from 'react';
import { KolamData } from '@/lib/kolam-generators';
import { Button } from './button';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface LearningCanvasProps {
    kolamData: KolamData;
}

export function LearningCanvas({ kolamData }: LearningCanvasProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);

    // Base animation duration in ms (10 seconds for a full draw)
    const baseDuration = 10000;

    // Calculate total length of all paths to normalize animation across multiple segments
    const [totalLength, setTotalLength] = useState(0);

    useEffect(() => {
        // Reset when data changes
        setIsPlaying(false);
        setProgress(0);

        let length = 0;
        pathRefs.current.forEach(path => {
            if (path) {
                length += path.getTotalLength();
            }
        });
        setTotalLength(length);

        // Set initial dasharrays
        pathRefs.current.forEach(path => {
            if (path) {
                const l = path.getTotalLength();
                path.style.strokeDasharray = `${l} ${l}`;
                path.style.strokeDashoffset = `${l}`;
            }
        });
    }, [kolamData]);

    // Animation Loop
    useEffect(() => {
        if (!isPlaying) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const animate = (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            setProgress(prev => {
                const nextProgress = prev + (deltaTime / (baseDuration / speedMultiplier)) * 100;
                if (nextProgress >= 100) {
                    setIsPlaying(false);
                    return 100;
                }
                return nextProgress;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, speedMultiplier]);

    // When play is toggled cleanly
    const togglePlay = () => {
        if (progress >= 100) {
            setProgress(0); // auto-restart
        }
        setIsPlaying(!isPlaying);
        lastTimeRef.current = 0; // reset delta Time
    };

    const reset = () => {
        setIsPlaying(false);
        setProgress(0);
        lastTimeRef.current = 0;
    };

    const cycleSpeed = () => {
        const speeds = [1, 2, 4];
        const currentIndex = speeds.indexOf(speedMultiplier);
        setSpeedMultiplier(speeds[(currentIndex + 1) % speeds.length]);
    };

    // Sync progress to SVG paths
    useEffect(() => {
        let lengthsAccumulated = 0;
        const targetLength = (progress / 100) * totalLength;

        pathRefs.current.forEach(path => {
            if (!path) return;
            const l = path.getTotalLength();

            if (lengthsAccumulated + l <= targetLength) {
                // This path should be completely drawn
                path.style.strokeDashoffset = '0';
            } else if (lengthsAccumulated < targetLength) {
                // This path is partially drawn
                const drawnPart = targetLength - lengthsAccumulated;
                path.style.strokeDashoffset = `${l - drawnPart}`;
            } else {
                // This path is not yet drawn
                path.style.strokeDashoffset = `${l}`;
            }

            lengthsAccumulated += l;
        });
    }, [progress, totalLength]);

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">

            {/* Canvas */}
            <div className="relative w-full aspect-square bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 mb-6">
                <svg
                    viewBox={`0 0 ${kolamData.width} ${kolamData.height}`}
                    className="w-full h-full max-w-[90%] max-h-[90%]"
                >
                    {/* Dots */}
                    {kolamData.dots.map((dot, i) => (
                        <circle
                            key={dot.id}
                            cx={dot.x}
                            cy={dot.y}
                            r="3"
                            fill="#94a3b8"
                            className="transition-opacity duration-500"
                            style={{ opacity: progress > 0 ? 0.7 : 0.3 }}
                        />
                    ))}

                    {/* Paths */}
                    {kolamData.paths.map((pathDef, i) => (
                        <path
                            key={`path-${i}`}
                            ref={el => { pathRefs.current[i] = el; }}
                            d={pathDef}
                            fill="none"
                            stroke="#fbbf24" // Amber-400
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        />
                    ))}
                </svg>
            </div>

            {/* Controls */}
            <div className="w-full space-y-4">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-400 transition-all duration-75 ease-linear"
                        style={{ width: \`\${progress}%\` }}
          />
                </div>

                {/* Buttons */}
                <div className="flex justify-center items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={reset}
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>

                    <Button
                        size="lg"
                        onClick={togglePlay}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 w-32 font-bold"
                    >
                        {isPlaying ? (
                            <><Pause className="mr-2 h-5 w-5" /> Pause</>
                        ) : (
                            <><Play className="mr-2 h-5 w-5 fill-current" /> {progress >= 100 ? 'Replay' : 'Play'}</>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={cycleSpeed}
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 w-20 px-2"
                    >
                        <FastForward className="h-4 w-4 mr-1" /> {speedMultiplier}x
                    </Button>
                </div>
            </div>
        </div>
    );
}
