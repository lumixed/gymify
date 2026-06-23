'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadHistory, getStats, formatDuration, formatDate, clearHistory, WorkoutSession } from '@/lib/history'
import styles from './page.module.css'

export default function HistoryPage() {
    const [history, setHistory] = useState<WorkoutSession[]>([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        setHistory(loadHistory())
        setLoaded(true)
    }, [])

    const stats = getStats(history)

    function handleClear() {
        if (window.confirm('Clear all workout history? This cannot be undone.')) {
            clearHistory()
            setHistory([])
        }
    }

    function getScoreColor(score: number): string {
        if (score >= 90) return '#4ade80'
        if (score >= 70) return '#facc15'
        return '#ef4444'
    }

    if (!loaded) return null

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Workout History</h1>
                    <p className={styles.subtitle}>
                        {history.length > 0
                            ? `${history.length} session${history.length === 1 ? '' : 's'} logged`
                            : 'No workouts yet'}
                    </p>
                </div>
                {history.length > 0 && (
                    <button className={styles.clearBtn} onClick={handleClear}>
                        Clear All
                    </button>
                )}
            </div>

            {history.length > 0 && (
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
                        <span className={styles.statValue} style={{ color: getScoreColor(stats.avgScore) }}>
                            {stats.avgScore}
                        </span>
                        <span className={styles.statLabel}>Avg Score</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{formatDuration(stats.totalTime)}</span>
                        <span className={styles.statLabel}>Total Time</span>
                    </div>
                </div>
            )}

            {history.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🏋️</div>
                    <h2 className={styles.emptyTitle}>No workouts yet</h2>
                    <p className={styles.emptyDesc}>
                        Complete a workout session and hit reset to save it here.
                    </p>
                    <Link href="/workout" className={styles.startBtn}>
                        Start a Workout →
                    </Link>
                </div>
            ) : (
                <div className={styles.sessionList}>
                    {history.map(session => (
                        <div key={session.id} className={styles.sessionCard}>
                            <div className={styles.sessionHeader}>
                                <div className={styles.sessionExercise}>{session.exercise}</div>
                                <div className={styles.sessionDate}>{formatDate(session.date)}</div>
                            </div>

                            <div className={styles.sessionStats}>
                                <div className={styles.sessionStat}>
                                    <span className={styles.sessionStatValue}>{session.reps}</span>
                                    <span className={styles.sessionStatLabel}>reps</span>
                                </div>
                                <div className={styles.sessionDivider} />
                                <div className={styles.sessionStat}>
                                    <span
                                        className={styles.sessionStatValue}
                                        style={{ color: getScoreColor(session.avgScore) }}
                                    >
                                        {session.avgScore}
                                    </span>
                                    <span className={styles.sessionStatLabel}>score</span>
                                </div>
                                <div className={styles.sessionDivider} />
                                <div className={styles.sessionStat}>
                                    <span className={styles.sessionStatValue}>
                                        {formatDuration(session.duration)}
                                    </span>
                                    <span className={styles.sessionStatLabel}>time</span>
                                </div>
                                <div className={styles.sessionDivider} />
                                <div className={styles.sessionStat}>
                                    <span className={styles.sessionStatValue}>{session.side}</span>
                                    <span className={styles.sessionStatLabel}>side</span>
                                </div>
                            </div>

                            {session.scores.length > 0 && (
                                <div className={styles.scoreBar}>
                                    {session.scores.map((score, idx) => (
                                        <div
                                            key={idx}
                                            className={styles.scoreSegment}
                                            style={{
                                                height: `${Math.max(score, 10)}%`,
                                                backgroundColor: getScoreColor(score),
                                            }}
                                            title={`Rep ${idx + 1}: ${score}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
