'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import styles from './page.module.css'

interface LeaderboardEntry {
    id: string
    name: string
    image: string | null
    totalReps: number
    totalBadges: number
    score: number
}

export default function LeaderboardPage() {
    const { data: session } = useSession()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/db/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEntries(data)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <div className="skeleton" style={{ height: '40px', width: '60%', margin: '0 auto 12px' }} />
                    <div className="skeleton" style={{ height: '18px', width: '45%', margin: '0 auto' }} />
                </div>
                <div className={styles.list}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px' }} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={`${styles.page} animate-in`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Global Leaderboard</h1>
                <p className={styles.subtitle}>See how you stack up against the Gymify community.</p>
            </div>

            <div className={styles.list}>
                {entries.length === 0 ? (
                    <p className={styles.empty}>No workout data found yet.</p>
                ) : (
                    entries.map((entry, index) => {
                        const isMe = session?.user?.id === entry.id
                        return (
                            <div key={entry.id} className={`${styles.row} ${isMe ? styles.rowMe : ''}`}>
                                <div className={styles.rank}>
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </div>
                                <div className={styles.userInfo}>
                                    {entry.image ? (
                                        <Image src={entry.image} alt={entry.name} width={40} height={40} className={styles.avatar} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            {entry.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={styles.name}>
                                        {entry.name}
                                        {isMe && <span className={styles.youBadge}>You</span>}
                                    </span>
                                </div>
                                <div className={styles.stats}>
                                    <div className={styles.statGroup}>
                                        <span className={styles.statValue}>{entry.totalReps}</span>
                                        <span className={styles.statLabel}>Reps</span>
                                    </div>
                                    <div className={styles.statGroup}>
                                        <span className={styles.statValue}>{entry.totalBadges}</span>
                                        <span className={styles.statLabel}>Badges</span>
                                    </div>
                                    <div className={styles.statGroup}>
                                        <span className={styles.statValueHighlight}>{entry.score}</span>
                                        <span className={styles.statLabel}>Score</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
