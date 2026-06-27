'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadProfile } from '@/lib/profile'
import { loadPlan, savePlan, clearPlan, WorkoutPlan, TrainingDay } from '@/lib/plan'
import styles from './page.module.css'

export default function PlanPage() {
    const [plan, setPlan] = useState<WorkoutPlan | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expandedDay, setExpandedDay] = useState<number | null>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const cached = loadPlan()
        if (cached) setPlan(cached)
        setLoaded(true)
    }, [])

    async function generatePlan() {
        const profile = loadProfile()
        if (!profile) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Something went wrong')
                return
            }

            const fullPlan: WorkoutPlan = {
                ...data.plan,
                generatedAt: new Date().toISOString(),
            }

            savePlan(fullPlan)
            setPlan(fullPlan)
            setExpandedDay(0)
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleRegenerate() {
        clearPlan()
        setPlan(null)
        setExpandedDay(null)
        generatePlan()
    }

    function toggleDay(idx: number) {
        setExpandedDay(expandedDay === idx ? null : idx)
    }

    if (!loaded) return null

    const profile = loadProfile()
    const hasProfile = profile !== null

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Training Plan</h1>
                {plan && (
                    <p className={styles.subtitle}>
                        {plan.split} · {plan.days.length} days/week
                    </p>
                )}
            </div>

            {!hasProfile && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h2 className={styles.emptyTitle}>Set up your profile first</h2>
                    <p className={styles.emptyDesc}>
                        We need to know your goals, fitness level, and schedule 
                        to build a personalized plan.
                    </p>
                    <Link href="/onboarding" className={styles.actionBtn}>
                        Set Up Profile →
                    </Link>
                </div>
            )}

            {hasProfile && !plan && !loading && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🤖</div>
                    <h2 className={styles.emptyTitle}>Ready to generate your plan</h2>
                    <p className={styles.emptyDesc}>
                        Our AI will create a personalized {profile.daysPerWeek}-day training split 
                        based on your profile as a {profile.fitnessLevel} looking to {profile.goal.replace('-', ' ')}.
                    </p>
                    <button className={styles.actionBtn} onClick={generatePlan}>
                        Generate My Plan →
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            )}

            {loading && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Building your plan...</p>
                    <p className={styles.loadingSub}>This takes a few seconds</p>
                </div>
            )}

            {plan && !loading && (
                <>
                    <div className={styles.dayList}>
                        {plan.days.map((day: TrainingDay, idx: number) => (
                            <div key={idx} className={styles.dayCard}>
                                <button
                                    className={styles.dayHeader}
                                    onClick={() => toggleDay(idx)}
                                >
                                    <div className={styles.dayInfo}>
                                        <span className={styles.dayNumber}>Day {day.day}</span>
                                        <span className={styles.dayName}>{day.name}</span>
                                    </div>
                                    <div className={styles.dayMeta}>
                                        <span className={styles.dayFocus}>{day.focus}</span>
                                        <span className={styles.chevron}>
                                            {expandedDay === idx ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </button>

                                {expandedDay === idx && (
                                    <div className={styles.exerciseList}>
                                        {day.exercises.map((ex, exIdx) => (
                                            <div key={exIdx} className={styles.exerciseRow}>
                                                <div className={styles.exerciseMain}>
                                                    <span className={styles.exerciseIdx}>
                                                        {exIdx + 1}
                                                    </span>
                                                    <div className={styles.exerciseDetails}>
                                                        <span className={styles.exerciseName}>
                                                            {ex.name}
                                                        </span>
                                                        {ex.notes && (
                                                            <span className={styles.exerciseNotes}>
                                                                {ex.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles.exerciseConfig}>
                                                    <span className={styles.configItem}>
                                                        {ex.sets} × {ex.reps}
                                                    </span>
                                                    <span className={styles.configDivider}>·</span>
                                                    <span className={styles.configItem}>
                                                        {ex.rest} rest
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={styles.planActions}>
                        <Link href="/checkin" className={styles.checkinBtn}>
                            Phase Check-In →
                        </Link>
                        <button className={styles.regenBtn} onClick={handleRegenerate}>
                            Regenerate Plan
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </div>
                </>
            )}
        </div>
    )
}
