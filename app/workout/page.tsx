import CameraView from '@/components/CameraView'
import styles from './page.module.css'

export default function WorkoutPage() {
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Workout Session</h1>
                <p className={styles.sub}>Position yourself so your full body is visible to the camera.</p>
            </div>
            <div className={styles.cameraWrapper}>
                <CameraView />
            </div>
        </div>
    )
}
