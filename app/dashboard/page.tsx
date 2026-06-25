'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadProfile, calculateMacros, calculateTargetCalories, UserProfile } from '@/lib/profile'
import { loadPlan, WorkoutPlan, TrainingDay } from '@/lib/plan'
import { loadNutrition, NutritionPlan } from '@/lib/nutrition'
import { loadHistory, getStats, formatDate, formatDuration, WorkoutSession } from '@/lib/history'
import styles from './page.module.css'

function getTodayDayIndex(plan: WorkoutPlan): number {
    const dow = new Date().getDay()
    const idx = dow === 0 ? 6 : dow - 1
    return idx % plan.days.length
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [plan, setPlan] = useState<WorkoutPlan | null>(null)
    const [nutrition, setNutrition] = useState<NutritionPlan | null>(null)
    const [history, setHistory] = useState<WorkoutSession[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setProfile(loadProfile())
        setPlan(loadPlan())
        setNutrition(loadNutrition())
        setHistory(loadHistory())
        setLoaded(true)
    }, [])

    if (!loaded) return null

    if (!profile) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏋️</div>
                    <h1 className={styles.emptyTitle}>Welcome to Gymify</h1>
                    <p className={styles.emptyDesc}>
                        Set up your profile to unlock your AI-powered personal trainer
                        with custom workout plans, nutrition guidance, and form tracking.
                    </p>
                    <Link href="/onboarding" className={styles.actionBtn}>
                        Get Started →
                    </Link>
                </div>
            </div>
        )
    }

    const macros = calculateMacros(profile)
    const targetCals = calculateTargetCalories(profile)
    const stats = getStats(history)
    const todayPlan: TrainingDay | null = plan ? plan.days[getTodayDayIndex(plan)] : null
    const recentSessions = history.slice(0, 3)

    const goalLabels: Record<string, string> = {
        'lose-fat': 'Fat Loss',
        'build-muscle': 'Muscle Building',
        'stay-healthy': 'General Health',
        'get-stronger': 'Strength',
    }

    return (
        <div className={styles.page}>
            {/* ── Greeting ─────────────────────── */}
            <div className={styles.greeting}>
                <h1 className={styles.greetingTitle}>
                    {getGreeting()}, {profile.name.split(' ')[0]}
                </h1>
                <p className={styles.greetingSub}>
                    {goalLabels[profile.goal] || profile.goal} · {profile.daysPerWeek} days/week · {profile.fitnessLevel}
                </p>
            </div>

            {/* ── Quick actions ────────────────── */}
            <div className={styles.quickActions}>
                <Link href="/guided" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🏃</span>
                    <span className={styles.qaLabel}>Guided</span>
                </Link>
                <Link href="/plan" className={styles.quickAction}>
                    <span className={styles.qaIcon}>📋</span>
                    <span className={styles.qaLabel}>{plan ? 'View Plan' : 'Generate Plan'}</span>
                </Link>
                <Link href="/nutrition" className={styles.quickAction}>
                    <span className={styles.qaIcon}>🥗</span>
                    <span className={styles.qaLabel}>{nutrition ? 'Meals' : 'Nutrition'}</span>
                </Link>
                <Link href="/progress" className={styles.quickAction}>
                    <span className={styles.qaIcon}>📊</span>
                    <span className={styles.qaLabel}>Progress</span>
                </Link>
            </div>

            {/* ── Stats overview ───────────────── */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.totalSessions}</span>
                    <span className={styles.statLabel}>Sessions</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.totalReps}</span>
                    <span className={styles.statLabel}>Total Reps</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>
                        {stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}
                    </span>
                    <span className={styles.statLabel}>Avg Form</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>
                        {stats.totalTime > 0 ? formatDuration(stats.totalTime) : '—'}
                    </span>
                    <span className={styles.statLabel}>Total Time</span>
                </div>
            </div>

            {/* ── Today's workout ──────────────── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Today&apos;s Workout</h2>
                    {plan && <Link href="/plan" className={styles.sectionLink}>Full Plan →</Link>}
                </div>

                {todayPlan ? (
                    <div className={styles.todayCard}>
                        <div className={styles.todayTop}>
                            <div>
                                <span className={styles.todayBadge}>Day {todayPlan.day}</span>
                                <h3 className={styles.todayName}>{todayPlan.name}</h3>
                                <p className={styles.todayFocus}>{todayPlan.focus}</p>
                            </div>
                            <Link href="/guided" className={styles.startBtn}>
                                Start →
                            </Link>
                        </div>
                        <div className={styles.todayExercises}>
                            {todayPlan.exercises.map((ex, i) => (
                                <div key={i} className={styles.todayExRow}>
                                    <span className={styles.todayExName}>{ex.name}</span>
                                    <span className={styles.todayExConfig}>
                                        {ex.sets} × {ex.reps}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyCard}>
                        <p>No workout plan yet.</p>
                        <Link href="/plan" className={styles.emptyCardLink}>
                            Generate a plan →
                        </Link>
                    </div>
                )}
            </section>

            {/* ── Nutrition overview ───────────── */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Daily Nutrition</h2>
                    <Link href="/nutrition" className={styles.sectionLink}>Details →</Link>
                </div>

                <div className={styles.nutritionCard}>
                    <div className={styles.macroGrid}>
                        <div className={`${styles.macroItem} ${styles.macroHighlight}`}>
                            <span className={styles.macroVal}>{targetCals}</span>
                            <span className={styles.macroLbl}>kcal target</span>
                        </div>
                        <div className={styles.macroItem}>
                            <span className={styles.macroVal}>{macros.protein}g</span>
                            <span className={styles.macroLbl}>Protein</span>
                        </div>
                        <div className={styles.macroItem}>
                            <span className={styles.macroVal}>{macros.carbs}g</span>
                            <span className={styles.macroLbl}>Carbs</span>
                        </div>
                        <div className={styles.macroItem}>
                            <span className={styles.macroVal}>{macros.fat}g</span>
                            <span className={styles.macroLbl}>Fat</span>
                        </div>
                    </div>

                    {nutrition ? (
                        <div className={styles.mealPreview}>
                            {nutrition.meals.map((meal, i) => (
                                <div key={i} className={styles.mealPreviewRow}>
                                    <span className={styles.mealPreviewName}>{meal.name}</span>
                                    <span className={styles.mealPreviewCals}>
                                        {meal.totalCalories} kcal
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyCardInline}>
                            <Link href="/nutrition" className={styles.emptyCardLink}>
                                Generate meal plan →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Recent sessions ──────────────── */}
            {recentSessions.length > 0 && (
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Sessions</h2>
                        <Link href="/history" className={styles.sectionLink}>All →</Link>
                    </div>

                    <div className={styles.sessionList}>
                        {recentSessions.map((s) => (
                            <div key={s.id} className={styles.sessionRow}>
                                <div className={styles.sessionInfo}>
                                    <span className={styles.sessionExercise}>{s.exercise}</span>
                                    <span className={styles.sessionDate}>{formatDate(s.date)}</span>
                                </div>
                                <div className={styles.sessionStats}>
                                    <span className={styles.sessionReps}>{s.reps} reps</span>
                                    <span
                                        className={styles.sessionScore}
                                        data-quality={s.avgScore >= 80 ? 'good' : s.avgScore >= 60 ? 'ok' : 'poor'}
                                    >
                                        {s.avgScore}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}
