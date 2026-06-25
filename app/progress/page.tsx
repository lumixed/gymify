'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { loadHistory, getStats, formatDuration, WorkoutSession } from '@/lib/history'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import styles from './page.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
)

const ACCENT = '#c8f542'
const ACCENT_MUTED = 'rgba(200, 245, 66, 0.15)'
const BLUE = '#60a5fa'
const BLUE_MUTED = 'rgba(96, 165, 250, 0.15)'
const PINK = '#f472b6'
const AMBER = '#fbbf24'
const EMERALD = '#34d399'
const RED = '#f87171'
const GRID_COLOR = 'rgba(255,255,255,0.06)'
const TICK_COLOR = '#666'

function getShortDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getDayKey(iso: string): string {
    return new Date(iso).toISOString().split('T')[0]
}

function getStreak(history: WorkoutSession[]): number {
    if (history.length === 0) return 0
    const days = new Set(history.map(s => getDayKey(s.date)))
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        if (days.has(key)) {
            streak++
        } else if (i > 0) {
            break
        }
    }
    return streak
}

function getLast30DaysActivity(history: WorkoutSession[]): { date: string; count: number }[] {
    const map = new Map<string, number>()
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        map.set(d.toISOString().split('T')[0], 0)
    }
    history.forEach(s => {
        const key = getDayKey(s.date)
        if (map.has(key)) {
            map.set(key, (map.get(key) || 0) + 1)
        }
    })
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }))
}

const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 } },
        },
        y: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 } },
        },
    },
}

export default function ProgressPage() {
    const [history, setHistory] = useState<WorkoutSession[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setHistory(loadHistory())
        setLoaded(true)
    }, [])

    const stats = useMemo(() => getStats(history), [history])
    const streak = useMemo(() => getStreak(history), [history])

    // ── Form score trend (last 20 sessions, chronological) ──
    const formData = useMemo(() => {
        const recent = [...history].reverse().slice(-20)
        return {
            labels: recent.map(s => getShortDate(s.date)),
            datasets: [
                {
                    data: recent.map(s => s.avgScore),
                    borderColor: ACCENT,
                    backgroundColor: ACCENT_MUTED,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: ACCENT,
                },
            ],
        }
    }, [history])

    // ── Volume per day (last 14 days) ──
    const volumeData = useMemo(() => {
        const last14 = getLast30DaysActivity(history).slice(-14)
        const dayReps = new Map<string, number>()
        last14.forEach(d => dayReps.set(d.date, 0))
        history.forEach(s => {
            const key = getDayKey(s.date)
            if (dayReps.has(key)) {
                dayReps.set(key, (dayReps.get(key) || 0) + s.reps)
            }
        })
        const entries = Array.from(dayReps.entries())
        return {
            labels: entries.map(([d]) => {
                const date = new Date(d)
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }),
            datasets: [
                {
                    data: entries.map(([, reps]) => reps),
                    backgroundColor: BLUE_MUTED,
                    borderColor: BLUE,
                    borderWidth: 1.5,
                    borderRadius: 4,
                },
            ],
        }
    }, [history])

    // ── Exercise breakdown (doughnut) ──
    const exerciseData = useMemo(() => {
        const map = new Map<string, number>()
        history.forEach(s => {
            map.set(s.exercise, (map.get(s.exercise) || 0) + s.reps)
        })
        const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
        const colors = [ACCENT, BLUE, PINK, AMBER, EMERALD, RED]
        return {
            labels: sorted.map(([name]) => name),
            datasets: [
                {
                    data: sorted.map(([, reps]) => reps),
                    backgroundColor: colors.slice(0, sorted.length),
                    borderWidth: 0,
                },
            ],
        }
    }, [history])

    // ── Activity heatmap data ──
    const activityData = useMemo(() => getLast30DaysActivity(history), [history])
    const maxActivity = useMemo(
        () => Math.max(1, ...activityData.map(d => d.count)),
        [activityData]
    )

    if (!loaded) return null

    if (history.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📊</div>
                    <h1 className={styles.emptyTitle}>No data yet</h1>
                    <p className={styles.emptyDesc}>
                        Complete your first workout to start tracking progress.
                        Your form scores, volume, and consistency will appear here.
                    </p>
                    <Link href="/workout" className={styles.actionBtn}>
                        Start a Workout →
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Progress</h1>
                <p className={styles.subtitle}>
                    {stats.totalSessions} sessions tracked
                </p>
            </div>

            {/* ── Stat pills ──────────────────── */}
            <div className={styles.statPills}>
                <div className={styles.pill}>
                    <span className={styles.pillValue}>{streak}</span>
                    <span className={styles.pillLabel}>Day Streak</span>
                </div>
                <div className={styles.pill}>
                    <span className={styles.pillValue}>{stats.totalReps}</span>
                    <span className={styles.pillLabel}>Total Reps</span>
                </div>
                <div className={styles.pill}>
                    <span className={styles.pillValue}>
                        {stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}
                    </span>
                    <span className={styles.pillLabel}>Avg Form</span>
                </div>
                <div className={styles.pill}>
                    <span className={styles.pillValue}>
                        {stats.totalTime > 0 ? formatDuration(stats.totalTime) : '—'}
                    </span>
                    <span className={styles.pillLabel}>Total Time</span>
                </div>
            </div>

            {/* ── Activity heatmap ────────────── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Last 30 Days</h2>
                <div className={styles.heatmapGrid}>
                    {activityData.map((d, i) => {
                        const opacity = d.count === 0 ? 0 : 0.3 + (d.count / maxActivity) * 0.7
                        const dayNum = new Date(d.date).getDate()
                        return (
                            <div
                                key={i}
                                className={styles.heatCell}
                                style={{
                                    backgroundColor: d.count > 0
                                        ? `rgba(200, 245, 66, ${opacity})`
                                        : 'var(--bg-elevated)',
                                }}
                                title={`${d.date}: ${d.count} session${d.count !== 1 ? 's' : ''}`}
                            >
                                <span className={styles.heatDay}>{dayNum}</span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ── Form score trend ────────────── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Form Score Trend</h2>
                <div className={styles.chartContainer}>
                    <Line
                        data={formData}
                        options={{
                            ...chartBaseOptions,
                            scales: {
                                ...chartBaseOptions.scales,
                                y: {
                                    ...chartBaseOptions.scales.y,
                                    min: 0,
                                    max: 100,
                                },
                            },
                        }}
                    />
                </div>
            </section>

            {/* ── Volume per day ──────────────── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Daily Volume (Reps)</h2>
                <div className={styles.chartContainer}>
                    <Bar
                        data={volumeData}
                        options={{
                            ...chartBaseOptions,
                            scales: {
                                ...chartBaseOptions.scales,
                                y: {
                                    ...chartBaseOptions.scales.y,
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </div>
            </section>

            {/* ── Exercise breakdown ──────────── */}
            {exerciseData.labels.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Exercise Breakdown</h2>
                    <div className={styles.doughnutWrap}>
                        <div className={styles.doughnutChart}>
                            <Doughnut
                                data={exerciseData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                    },
                                    cutout: '65%',
                                }}
                            />
                        </div>
                        <div className={styles.doughnutLegend}>
                            {exerciseData.labels.map((label, i) => (
                                <div key={i} className={styles.legendItem}>
                                    <span
                                        className={styles.legendDot}
                                        style={{
                                            backgroundColor:
                                                exerciseData.datasets[0].backgroundColor[i],
                                        }}
                                    />
                                    <span className={styles.legendLabel}>{label}</span>
                                    <span className={styles.legendValue}>
                                        {exerciseData.datasets[0].data[i]} reps
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
