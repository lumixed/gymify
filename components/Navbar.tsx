'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { hasProfile } from '@/lib/profile'
import styles from './Navbar.module.css'

export default function Navbar() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileExists, setProfileExists] = useState(false)

    useEffect(() => {
        setProfileExists(hasProfile())
    }, [pathname])

    const ctaHref = profileExists ? '/workout' : '/onboarding'

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>gymify</span>
                </Link>

                <button
                    className={styles.hamburger}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
                    <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
                </button>

                <div className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
                    <Link
                        href="/"
                        className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/workout"
                        className={`${styles.link} ${pathname === '/workout' ? styles.active : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Workout
                    </Link>
                    <Link
                        href="/plan"
                        className={`${styles.link} ${pathname === '/plan' ? styles.active : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Plan
                    </Link>
                    <Link
                        href="/nutrition"
                        className={`${styles.link} ${pathname === '/nutrition' ? styles.active : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Nutrition
                    </Link>
                    <Link
                        href="/history"
                        className={`${styles.link} ${pathname === '/history' ? styles.active : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        History
                    </Link>
                    {profileExists && (
                        <Link
                            href="/onboarding"
                            className={`${styles.link} ${pathname === '/onboarding' ? styles.active : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            Profile
                        </Link>
                    )}
                    <Link href={ctaHref} className={styles.cta} onClick={() => setMenuOpen(false)}>
                        {profileExists ? 'Start Training' : 'Get Started'}
                    </Link>
                </div>
            </div>
        </nav>
    )
}

