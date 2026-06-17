'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)

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
                    <Link href="/workout" className={styles.cta} onClick={() => setMenuOpen(false)}>
                        Start Training
                    </Link>
                </div>
            </div>
        </nav>
    )
}
