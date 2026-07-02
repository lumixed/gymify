'use client'

import { useState } from 'react'
import CameraView from '@/components/CameraView'
import { EXERCISES, CATEGORIES, ExerciseConfig, ExerciseCategory } from '@/lib/exercises'
import styles from './page.module.css'

export default function WorkoutPage() {
    const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
    const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');

    const filtered = activeCategory === 'all'
        ? EXERCISES
        : EXERCISES.filter(e => e.category === activeCategory);

    return (
        <div className={`${styles.page} animate-in`}>
            {!selectedExercise ? (
                <>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Choose Your Workout</h1>
                        <p className={styles.sub}>Select an exercise to get real-time form tracking and AI feedback.</p>
                    </div>

                    <div className={styles.filterBar}>
                        <button
                            className={`${styles.filterBtn} ${activeCategory === 'all' ? styles.filterActive : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            All
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.key}
                                className={`${styles.filterBtn} ${activeCategory === cat.key ? styles.filterActive : ''}`}
                                onClick={() => setActiveCategory(cat.key)}
                            >
                                <span className={styles.filterIcon}>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.grid}>
                        {filtered.map(exercise => (
                            <button
                                key={exercise.id}
                                className={styles.card}
                                onClick={() => setSelectedExercise(exercise)}
                            >
                                <div className={styles.cardTop}>
                                    <span className={styles.cardIcon}>{exercise.icon}</span>
                                    <span className={styles.cardBadge}>{exercise.category}</span>
                                </div>
                                <h2 className={styles.cardTitle}>{exercise.name}</h2>
                                <p className={styles.cardDesc}>{exercise.description}</p>
                                <div className={styles.cardTips}>
                                    {exercise.tips.map((tip, i) => (
                                        <span key={i} className={styles.tip}>✓ {tip}</span>
                                    ))}
                                </div>
                                <span className={styles.cardAngle}>Tracks: {exercise.angleLabel}</span>
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
                    <CameraView exerciseConfig={selectedExercise} />
                </>
            )}
        </div>
    )
}
