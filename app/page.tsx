'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { hasProfile } from '@/lib/profile'
import styles from './page.module.css'

export default function Home() {
    const [profileExists, setProfileExists] = useState(false)

    useEffect(() => {
        setProfileExists(hasProfile())
    }, [])

    const ctaHref = profileExists ? '/workout' : '/onboarding'
    const ctaLabel = profileExists ? 'Start Workout' : 'Get Started'

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        Train smarter.
                        <br />
                        <span className={styles.accent}>Not just harder.</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Gymify uses your webcam to track your form in real-time.
                        Get instant feedback on every rep — like having a personal
                        trainer watching you, minus the hourly rate.
                    </p>
                    <div className={styles.actions}>
                        <Link href={ctaHref} className={styles.primaryBtn}>
                            {ctaLabel}
                            <span className={styles.arrow}>→</span>
                        </Link>
                        <a href="#how-it-works" className={styles.secondaryBtn}>
                            See How It Works
                        </a>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.mockup}>
                        <div className={styles.mockupHeader}>
                            <div className={styles.dot} />
                            <div className={styles.dot} />
                            <div className={styles.dot} />
                        </div>
                        <div className={styles.mockupBody}>
                            <div className={styles.skeleton} />
                            <div className={styles.statsOverlay}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>12</span>
                                    <span className={styles.statLabel}>Reps</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>92°</span>
                                    <span className={styles.statLabel}>Angle</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statGood}>Good</span>
                                    <span className={styles.statLabel}>Form</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.features} id="how-it-works">
                <div className={styles.featuresHeader}>
                    <h2 className={styles.sectionTitle}>How it works</h2>
                    <p className={styles.sectionSub}>
                        Three steps. No equipment needed. Just you and your camera.
                    </p>
                </div>

                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>01</div>
                        <h3 className={styles.featureName}>Set up your profile</h3>
                        <p className={styles.featureDesc}>
                            Tell us your goals, fitness level, and schedule.
                            We'll build a personalized plan around you.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>02</div>
                        <h3 className={styles.featureName}>Start exercising</h3>
                        <p className={styles.featureDesc}>
                            Our AI tracks 33 body landmarks in real-time using MediaPipe.
                            It calculates joint angles and detects your movements.
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureNumber}>03</div>
                        <h3 className={styles.featureName}>Get feedback</h3>
                        <p className={styles.featureDesc}>
                            See your rep count, joint angles, and form quality overlaid
                            right on the video. Fix your form as you go.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <div className={styles.ctaCard}>
                    <h2 className={styles.ctaTitle}>Ready to level up your form?</h2>
                    <p className={styles.ctaDesc}>
                        No sign-up required. No downloads. Just open your browser and start.
                    </p>
                    <Link href={ctaHref} className={styles.primaryBtn}>
                        {ctaLabel}
                        <span className={styles.arrow}>→</span>
                    </Link>
                </div>
            </section>
        </div>
    )
}