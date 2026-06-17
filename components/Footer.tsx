import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.brand}>
                    <span className={styles.logo}>gymify</span>
                    <p className={styles.tagline}>Your AI-powered workout partner.</p>
                </div>

                <div className={styles.right}>
                    <p className={styles.copy}>
                        &copy; {new Date().getFullYear()} Gymify. Built for gains.
                    </p>
                </div>
            </div>
        </footer>
    )
}
