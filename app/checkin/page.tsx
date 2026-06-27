'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadProfile, UserProfile } from '@/lib/profile'
import { loadPlan, savePlan, WorkoutPlan } from '@/lib/plan'
import { loadHistory, WorkoutSession } from '@/lib/history'
import { loadMeasurements, MeasurementEntry } from '@/lib/measurements'
import styles from './page.module.css'

export default function CheckInPage() {
    const router = useRouter()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [plan, setPlan] = useState<WorkoutPlan | null>(null)
    const [history, setHistory] = useState<WorkoutSession[]>([])
    const [measurements, setMeasurements] = useState<MeasurementEntry[]>([])
    const [loaded, setLoaded] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        setProfile(loadProfile())
        setPlan(loadPlan())
        setHistory(loadHistory())
        setMeasurements(loadMeasurements())
        setLoaded(true)
    }, [])

    const stats = useMemo(() => {
        if (!plan || !profile) return null

        const planDate = new Date(plan.generatedAt).getTime()
        const now = Date.now()
        const daysSince = Math.floor((now - planDate) / (1000 * 60 * 60 * 24))

        const workoutsSince = history.filter(
            s => new Date(s.date).getTime() >= planDate
        )

        const startWeight = profile.weight
        const currentWeight = measurements.length > 0 ? measurements[0].weight : profile.weight
        const weightDiff = currentWeight - startWeight

        const avgScore = workoutsSince.length > 0
            ? Math.round(workoutsSince.reduce((sum, s) => sum + s.avgScore, 0) / workoutsSince.length)
            : 0

        return {
            daysSince,
            workoutsCompleted: workoutsSince.length,
            weightDiff,
            currentWeight,
            avgScore
        }
    }, [plan, profile, history, measurements])

    async function handleAdaptPlan() {
        if (!profile || !plan) return
        setIsGenerating(true)

        try {
            const res = await fetch('/api/adapt-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile,
                    currentPlan: plan,
                    history,
                    measurements
                })
            })

            if (!res.ok) throw new Error('Failed to adapt plan')
            
            const newPlan = await res.json()
            savePlan(newPlan)
            router.push('/plan')
        } catch (err) {
            console.error(err)
            alert('Failed to generate new phase. Please try again.')
            setIsGenerating(false)
        }
    }

    if (!loaded) return null

    if (!profile || !plan) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <h1 className={styles.emptyTitle}>No active plan found</h1>
                    <p className={styles.emptyDesc}>Generate a plan first before checking in.</p>
                    <Link href="/plan" className={styles.actionBtn}>Go to Plan</Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase Check-In</h1>
                <p className={styles.subtitle}>Review your progress and adapt your training phase</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📅</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.daysSince}</span>
                        <span className={styles.statLabel}>Days in Phase</span>
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🏋️</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.workoutsCompleted}</span>
                        <span className={styles.statLabel}>Workouts Done</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⚖️</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {stats && stats.weightDiff > 0 ? '+' : ''}{stats?.weightDiff.toFixed(1)} kg
                        </span>
                        <span className={styles.statLabel}>Weight Change</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🎯</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.avgScore}%</span>
                        <span className={styles.statLabel}>Avg Form Score</span>
                    </div>
                </div>
            </div>

            <div className={styles.actionCard}>
                <h2 className={styles.actionTitle}>Ready for the next phase?</h2>
                <p className={styles.actionDesc}>
                    Based on your recent form scores, consistency, and weight changes, your AI coach will generate a new training split with adjusted volume and intensity to keep you progressing.
                </p>
                
                <button 
                    className={styles.generateBtn} 
                    onClick={handleAdaptPlan}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className={styles.spinner}></span>
                            Analyzing Progress...
                        </>
                    ) : (
                        'Adapt & Generate Next Phase →'
                    )}
                </button>
            </div>
        </div>
    )
}
