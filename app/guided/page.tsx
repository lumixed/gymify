'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { loadPlan, WorkoutPlan, TrainingDay, Exercise } from '@/lib/plan'
import styles from './page.module.css'

type Phase = 'preview' | 'exercise' | 'rest' | 'complete'

interface SetLog {
    exerciseIdx: number
    setNum: number
    reps: number
    timestamp: number
}

function parseRestSeconds(rest: string): number {
    const match = rest.match(/(\d+)/)
    if (!match) return 60
    const num = parseInt(match[1], 10)
    if (rest.toLowerCase().includes('min')) return num * 60
    return num
}

function getTodayDayIndex(plan: WorkoutPlan): number {
    const dow = new Date().getDay()
    const idx = dow === 0 ? 6 : dow - 1
    return idx % plan.days.length
}

function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function GuidedPage() {
    const [plan, setPlan] = useState<WorkoutPlan | null>(null)
    const [dayIdx, setDayIdx] = useState(0)
    const [phase, setPhase] = useState<Phase>('preview')
    const [exIdx, setExIdx] = useState(0)
    const [currentSet, setCurrentSet] = useState(1)
    const [restTime, setRestTime] = useState(0)
    const [setLogs, setSetLogs] = useState<SetLog[]>([])
    const [startTime, setStartTime] = useState(0)
    const [loaded, setLoaded] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<AudioContext | null>(null)

    useEffect(() => {
        const p = loadPlan()
        if (p) {
            setPlan(p)
            setDayIdx(getTodayDayIndex(p))
        }
        setLoaded(true)
    }, [])

    // Rest timer countdown
    useEffect(() => {
        if (phase !== 'rest' || restTime <= 0) return
        timerRef.current = setInterval(() => {
            setRestTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    playBeep()
                    handleRestDone()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, restTime > 0 ? 1 : 0])

    const playBeep = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new AudioContext()
            }
            const ctx = audioRef.current
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.value = 0.3
            osc.start()
            osc.stop(ctx.currentTime + 0.15)
            setTimeout(() => {
                const osc2 = ctx.createOscillator()
                const gain2 = ctx.createGain()
                osc2.connect(gain2)
                gain2.connect(ctx.destination)
                osc2.frequency.value = 1100
                gain2.gain.value = 0.3
                osc2.start()
                osc2.stop(ctx.currentTime + 0.2)
            }, 200)
        } catch {
            // Audio not available
        }
    }, [])

    if (!loaded) return null

    if (!plan) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏃</div>
                    <h1 className={styles.emptyTitle}>No workout plan yet</h1>
                    <p className={styles.emptyDesc}>
                        Generate a training plan first, then come back to follow
                        it step by step.
                    </p>
                    <Link href="/plan" className={styles.actionBtn}>
                        Generate Plan →
                    </Link>
                </div>
            </div>
        )
    }

    const today: TrainingDay = plan.days[dayIdx]
    const exercises: Exercise[] = today.exercises
    const currentExercise: Exercise | undefined = exercises[exIdx]
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0)
    const completedSets = setLogs.length

    function handleStart() {
        setPhase('exercise')
        setExIdx(0)
        setCurrentSet(1)
        setSetLogs([])
        setStartTime(Date.now())
    }

    function handleCompleteSet() {
        if (!currentExercise) return

        const repsTarget = parseInt(currentExercise.reps.split('-').pop() || '0', 10) || 0
        const log: SetLog = {
            exerciseIdx: exIdx,
            setNum: currentSet,
            reps: repsTarget,
            timestamp: Date.now(),
        }
        setSetLogs(prev => [...prev, log])

        if (currentSet < currentExercise.sets) {
            // More sets remaining → rest
            const restSecs = parseRestSeconds(currentExercise.rest)
            setRestTime(restSecs)
            setPhase('rest')
        } else if (exIdx < exercises.length - 1) {
            // Move to next exercise → rest first
            const restSecs = parseRestSeconds(currentExercise.rest)
            setRestTime(restSecs)
            setPhase('rest')
        } else {
            // All done
            setPhase('complete')
        }
    }

    function handleRestDone() {
        if (!currentExercise) return

        if (currentSet < currentExercise.sets) {
            setCurrentSet(prev => prev + 1)
        } else {
            setExIdx(prev => prev + 1)
            setCurrentSet(1)
        }
        setPhase('exercise')
    }

    function handleSkipRest() {
        if (timerRef.current) clearInterval(timerRef.current)
        setRestTime(0)
        handleRestDone()
    }

    function handleSkipExercise() {
        if (exIdx < exercises.length - 1) {
            setExIdx(prev => prev + 1)
            setCurrentSet(1)
            setPhase('exercise')
        } else {
            setPhase('complete')
        }
    }

    function handleSelectDay(idx: number) {
        setDayIdx(idx)
        setPhase('preview')
        setExIdx(0)
        setCurrentSet(1)
        setSetLogs([])
    }

    const elapsedMs = startTime ? Date.now() - startTime : 0
    const elapsedMins = Math.floor(elapsedMs / 60000)

    // ── Preview phase ────────────────
    if (phase === 'preview') {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Guided Workout</h1>
                </div>

                <div className={styles.daySelector}>
                    {plan.days.map((d, i) => (
                        <button
                            key={i}
                            className={`${styles.daySelectorBtn} ${i === dayIdx ? styles.daySelectorActive : ''}`}
                            onClick={() => handleSelectDay(i)}
                        >
                            Day {d.day}
                        </button>
                    ))}
                </div>

                <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                        <span className={styles.previewBadge}>Day {today.day}</span>
                        <h2 className={styles.previewName}>{today.name}</h2>
                        <p className={styles.previewFocus}>{today.focus}</p>
                    </div>

                    <div className={styles.previewStats}>
                        <div className={styles.previewStat}>
                            <span className={styles.previewStatVal}>{exercises.length}</span>
                            <span className={styles.previewStatLbl}>Exercises</span>
                        </div>
                        <div className={styles.previewStat}>
                            <span className={styles.previewStatVal}>{totalSets}</span>
                            <span className={styles.previewStatLbl}>Total Sets</span>
                        </div>
                    </div>

                    <div className={styles.previewExList}>
                        {exercises.map((ex, i) => (
                            <div key={i} className={styles.previewExRow}>
                                <span className={styles.previewExIdx}>{i + 1}</span>
                                <div className={styles.previewExInfo}>
                                    <span className={styles.previewExName}>{ex.name}</span>
                                    <span className={styles.previewExConfig}>
                                        {ex.sets} × {ex.reps} · {ex.rest} rest
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.startBtn} onClick={handleStart}>
                        Start Workout →
                    </button>
                </div>
            </div>
        )
    }

    // ── Exercise phase ───────────────
    if (phase === 'exercise' && currentExercise) {
        const progressPct = Math.round((completedSets / totalSets) * 100)

        return (
            <div className={styles.page}>
                <div className={styles.exerciseTop}>
                    <div className={styles.progressBarBg}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <div className={styles.exerciseTopInfo}>
                        <span className={styles.exerciseTopLabel}>
                            Exercise {exIdx + 1}/{exercises.length}
                        </span>
                        <span className={styles.exerciseTopTime}>
                            {elapsedMins} min
                        </span>
                    </div>
                </div>

                <div className={styles.exerciseCard}>
                    <h2 className={styles.exerciseName}>{currentExercise.name}</h2>
                    <div className={styles.setIndicator}>
                        <span className={styles.setLabel}>Set</span>
                        <span className={styles.setCurrent}>{currentSet}</span>
                        <span className={styles.setTotal}>/ {currentExercise.sets}</span>
                    </div>
                    <div className={styles.repTarget}>
                        <span className={styles.repValue}>{currentExercise.reps}</span>
                        <span className={styles.repLabel}>reps</span>
                    </div>
                    {currentExercise.notes && (
                        <p className={styles.exerciseTip}>💡 {currentExercise.notes}</p>
                    )}
                </div>

                <div className={styles.exerciseActions}>
                    <button className={styles.completeBtn} onClick={handleCompleteSet}>
                        Complete Set ✓
                    </button>
                    <button className={styles.skipBtn} onClick={handleSkipExercise}>
                        Skip Exercise →
                    </button>
                </div>

                <div className={styles.upNext}>
                    <span className={styles.upNextLabel}>Up Next</span>
                    {currentSet < currentExercise.sets ? (
                        <span className={styles.upNextValue}>
                            Set {currentSet + 1} of {currentExercise.name}
                        </span>
                    ) : exIdx < exercises.length - 1 ? (
                        <span className={styles.upNextValue}>
                            {exercises[exIdx + 1].name}
                        </span>
                    ) : (
                        <span className={styles.upNextValue}>Finish! 🎉</span>
                    )}
                </div>
            </div>
        )
    }

    // ── Rest phase ───────────────────
    if (phase === 'rest') {
        const totalRest = currentExercise ? parseRestSeconds(currentExercise.rest) : 60
        const pct = totalRest > 0 ? Math.round(((totalRest - restTime) / totalRest) * 100) : 100

        return (
            <div className={styles.page}>
                <div className={styles.restContainer}>
                    <p className={styles.restLabel}>Rest</p>

                    <div className={styles.timerRing}>
                        <svg viewBox="0 0 120 120" className={styles.timerSvg}>
                            <circle
                                cx="60" cy="60" r="52"
                                fill="none"
                                stroke="var(--border)"
                                strokeWidth="6"
                            />
                            <circle
                                cx="60" cy="60" r="52"
                                fill="none"
                                stroke="var(--accent)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
                                transform="rotate(-90 60 60)"
                                className={styles.timerCircle}
                            />
                        </svg>
                        <span className={styles.timerValue}>{formatTimer(restTime)}</span>
                    </div>

                    <div className={styles.restInfo}>
                        {currentSet < (currentExercise?.sets ?? 0) ? (
                            <p className={styles.restNext}>
                                Next: Set {currentSet + 1} of {currentExercise?.name}
                            </p>
                        ) : exIdx < exercises.length - 1 ? (
                            <p className={styles.restNext}>
                                Next: {exercises[exIdx + 1].name}
                            </p>
                        ) : null}
                    </div>

                    <button className={styles.skipRestBtn} onClick={handleSkipRest}>
                        Skip Rest →
                    </button>
                </div>
            </div>
        )
    }

    // ── Complete phase ───────────────
    if (phase === 'complete') {
        const totalReps = setLogs.reduce((sum, l) => sum + l.reps, 0)
        const totalTime = Math.round((Date.now() - startTime) / 1000)
        const totalMins = Math.floor(totalTime / 60)

        return (
            <div className={styles.page}>
                <div className={styles.completeContainer}>
                    <div className={styles.completeIcon}>🎉</div>
                    <h1 className={styles.completeTitle}>Workout Complete!</h1>
                    <p className={styles.completeSub}>{today.name}</p>

                    <div className={styles.completeStats}>
                        <div className={styles.completeStat}>
                            <span className={styles.completeStatVal}>{completedSets}</span>
                            <span className={styles.completeStatLbl}>Sets</span>
                        </div>
                        <div className={styles.completeStat}>
                            <span className={styles.completeStatVal}>{totalReps}</span>
                            <span className={styles.completeStatLbl}>Reps</span>
                        </div>
                        <div className={styles.completeStat}>
                            <span className={styles.completeStatVal}>{totalMins}</span>
                            <span className={styles.completeStatLbl}>Minutes</span>
                        </div>
                    </div>

                    <div className={styles.completeActions}>
                        <Link href="/dashboard" className={styles.actionBtn}>
                            Back to Dashboard
                        </Link>
                        <Link href="/progress" className={styles.secondaryBtn}>
                            View Progress
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
