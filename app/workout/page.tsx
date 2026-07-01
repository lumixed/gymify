'use client'

import { useState } from 'react'
import CameraView from '@/components/CameraView'
import styles from './page.module.css'

type Exercise = {
    id: string;
    name: string;
    description: string;
    icon: string;
};

const EXERCISES: Exercise[] = [
    {
        id: 'squats',
        name: 'Squats',
        description: 'Track knee angle and hip depth to perfect your squat form.',
        icon: '🦵'
    },
    {
        id: 'pushups',
        name: 'Push-ups',
        description: 'Monitor arm angle and back straightness for perfect push-ups.',
        icon: '💪'
    },
    {
        id: 'lunges',
        name: 'Lunges',
        description: 'Ensure proper knee alignment and depth during lunges.',
        icon: '🚶'
    }
];

export default function WorkoutPage() {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    return (
        <div className={`${styles.page} animate-in`}>
            {!selectedExercise ? (
                <>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Choose Your Workout</h1>
                        <p className={styles.sub}>Select an exercise to get real-time form tracking and AI feedback.</p>
                    </div>

                    <div className={styles.grid}>
                        {EXERCISES.map(exercise => (
                            <button 
                                key={exercise.id} 
                                className={styles.card}
                                onClick={() => setSelectedExercise(exercise)}
                            >
                                <span className={styles.cardIcon}>{exercise.icon}</span>
                                <h2 className={styles.cardTitle}>{exercise.name}</h2>
                                <p className={styles.cardDesc}>{exercise.description}</p>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div className={styles.headerWithBack}>
                        <div>
                            <h1 className={styles.title}>{selectedExercise.name} Session</h1>
                            <p className={styles.sub}>Position yourself so your full body is visible to the camera.</p>
                        </div>
                        <button 
                            className={styles.backBtn}
                            onClick={() => setSelectedExercise(null)}
                        >
                            ← Change Exercise
                        </button>
                    </div>
                    <CameraView exerciseName={selectedExercise.name} />
                </>
            )}
        </div>
    )
}
