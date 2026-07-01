'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile, saveProfile } from '@/lib/profile'
import styles from './page.module.css'

const STEPS = [
    'welcome',
    'basics',
    'body',
    'experience',
    'goals',
    'schedule',
    'done',
] as const

type Step = typeof STEPS[number]

const defaultProfile: UserProfile = {
    name: '',
    age: 25,
    gender: 'male',
    height: 170,
    weight: 70,
    fitnessLevel: 'beginner',
    goal: 'stay-healthy',
    daysPerWeek: 3,
    equipment: 'bodyweight',
    injuries: '',
}

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('welcome')
    const [profile, setProfile] = useState<UserProfile>(defaultProfile)
    const [direction, setDirection] = useState<'forward' | 'back'>('forward')

    const currentIndex = STEPS.indexOf(step)
    const progress = ((currentIndex) / (STEPS.length - 1)) * 100

    function next() {
        setDirection('forward')
        const nextIdx = Math.min(currentIndex + 1, STEPS.length - 1)
        setStep(STEPS[nextIdx])
    }

    function back() {
        setDirection('back')
        const prevIdx = Math.max(currentIndex - 1, 0)
        setStep(STEPS[prevIdx])
    }

    function update(fields: Partial<UserProfile>) {
        setProfile(prev => ({ ...prev, ...fields }))
    }

    function finish() {
        saveProfile(profile)
        router.push('/workout')
    }

    function canProceed(): boolean {
        switch (step) {
            case 'welcome': return profile.name.trim().length > 0
            case 'basics': return profile.age > 0
            case 'body': return profile.height > 0 && profile.weight > 0
            default: return true
        }
    }

    return (
        <div className={`${styles.page} animate-in`}>
            <div className={styles.card}>
                {step !== 'welcome' && step !== 'done' && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                )}

                <div className={`${styles.stepContent} ${direction === 'forward' ? styles.slideIn : styles.slideBack}`} key={step}>
                    {step === 'welcome' && (
                        <div className={styles.stepInner}>
                            <div className={styles.emoji}>👋</div>
                            <h1 className={styles.title}>Welcome to Gymify</h1>
                            <p className={styles.subtitle}>
                                Let's set up your profile so we can build you a personalized 
                                training plan. This takes about 30 seconds.
                            </p>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>What should we call you?</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Your name"
                                    value={profile.name}
                                    onChange={e => update({ name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {step === 'basics' && (
                        <div className={styles.stepInner}>
                            <h2 className={styles.stepTitle}>The basics</h2>
                            <p className={styles.stepDesc}>This helps us calculate your nutrition targets.</p>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Age</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={profile.age}
                                        min={14}
                                        max={80}
                                        onChange={e => update({ age: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Gender</label>
                                <div className={styles.optionGrid}>
                                    {(['male', 'female', 'other'] as const).map(g => (
                                        <button
                                            key={g}
                                            className={`${styles.optionBtn} ${profile.gender === g ? styles.optionActive : ''}`}
                                            onClick={() => update({ gender: g })}
                                        >
                                            {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '⚥ Other'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'body' && (
                        <div className={styles.stepInner}>
                            <h2 className={styles.stepTitle}>Your body</h2>
                            <p className={styles.stepDesc}>Used for calorie and macro calculations.</p>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Height (cm)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={profile.height}
                                        min={100}
                                        max={250}
                                        onChange={e => update({ height: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Weight (kg)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={profile.weight}
                                        min={30}
                                        max={250}
                                        onChange={e => update({ weight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'experience' && (
                        <div className={styles.stepInner}>
                            <h2 className={styles.stepTitle}>Experience level</h2>
                            <p className={styles.stepDesc}>This determines workout complexity and volume.</p>

                            <div className={styles.fieldGroup}>
                                <div className={styles.cardGrid}>
                                    <button
                                        className={`${styles.levelCard} ${profile.fitnessLevel === 'beginner' ? styles.levelActive : ''}`}
                                        onClick={() => update({ fitnessLevel: 'beginner' })}
                                    >
                                        <span className={styles.levelEmoji}>🌱</span>
                                        <span className={styles.levelName}>Beginner</span>
                                        <span className={styles.levelDesc}>New to training or less than 6 months</span>
                                    </button>
                                    <button
                                        className={`${styles.levelCard} ${profile.fitnessLevel === 'intermediate' ? styles.levelActive : ''}`}
                                        onClick={() => update({ fitnessLevel: 'intermediate' })}
                                    >
                                        <span className={styles.levelEmoji}>💪</span>
                                        <span className={styles.levelName}>Intermediate</span>
                                        <span className={styles.levelDesc}>6 months to 2 years of consistent training</span>
                                    </button>
                                    <button
                                        className={`${styles.levelCard} ${profile.fitnessLevel === 'advanced' ? styles.levelActive : ''}`}
                                        onClick={() => update({ fitnessLevel: 'advanced' })}
                                    >
                                        <span className={styles.levelEmoji}>🔥</span>
                                        <span className={styles.levelName}>Advanced</span>
                                        <span className={styles.levelDesc}>2+ years, comfortable with complex movements</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'goals' && (
                        <div className={styles.stepInner}>
                            <h2 className={styles.stepTitle}>What's your goal?</h2>
                            <p className={styles.stepDesc}>We'll tailor your training split and nutrition around this.</p>

                            <div className={styles.fieldGroup}>
                                <div className={styles.cardGrid}>
                                    {([
                                        { val: 'lose-fat', emoji: '🏃', name: 'Lose Fat', desc: 'Calorie deficit, higher volume' },
                                        { val: 'build-muscle', emoji: '🏋️', name: 'Build Muscle', desc: 'Calorie surplus, progressive overload' },
                                        { val: 'stay-healthy', emoji: '❤️', name: 'Stay Healthy', desc: 'Balanced approach, maintenance' },
                                        { val: 'get-stronger', emoji: '⚡', name: 'Get Stronger', desc: 'Strength-focused, lower rep ranges' },
                                    ] as const).map(g => (
                                        <button
                                            key={g.val}
                                            className={`${styles.levelCard} ${profile.goal === g.val ? styles.levelActive : ''}`}
                                            onClick={() => update({ goal: g.val })}
                                        >
                                            <span className={styles.levelEmoji}>{g.emoji}</span>
                                            <span className={styles.levelName}>{g.name}</span>
                                            <span className={styles.levelDesc}>{g.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'schedule' && (
                        <div className={styles.stepInner}>
                            <h2 className={styles.stepTitle}>Training schedule</h2>
                            <p className={styles.stepDesc}>How many days a week can you train?</p>

                            <div className={styles.fieldGroup}>
                                <div className={styles.optionGrid}>
                                    {[3, 4, 5, 6].map(d => (
                                        <button
                                            key={d}
                                            className={`${styles.optionBtn} ${profile.daysPerWeek === d ? styles.optionActive : ''}`}
                                            onClick={() => update({ daysPerWeek: d })}
                                        >
                                            {d} days
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Equipment access</label>
                                <div className={styles.optionGrid}>
                                    {([
                                        { val: 'bodyweight', label: '🤸 Bodyweight' },
                                        { val: 'dumbbells', label: '🏋️ Dumbbells' },
                                        { val: 'full-gym', label: '🏢 Full Gym' },
                                    ] as const).map(e => (
                                        <button
                                            key={e.val}
                                            className={`${styles.optionBtn} ${profile.equipment === e.val ? styles.optionActive : ''}`}
                                            onClick={() => update({ equipment: e.val })}
                                        >
                                            {e.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Any injuries or limitations? (optional)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. bad knees, shoulder issues..."
                                    value={profile.injuries}
                                    onChange={e => update({ injuries: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className={styles.stepInner}>
                            <div className={styles.emoji}>✅</div>
                            <h2 className={styles.title}>You're all set, {profile.name}!</h2>
                            <p className={styles.subtitle}>
                                We've got everything we need to build your personalized 
                                training and nutrition plan.
                            </p>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Goal</span>
                                    <span className={styles.summaryValue}>
                                        {profile.goal.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Level</span>
                                    <span className={styles.summaryValue}>
                                        {profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)}
                                    </span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Schedule</span>
                                    <span className={styles.summaryValue}>{profile.daysPerWeek} days/week</span>
                                </div>
                                <div className={styles.summaryItem}>
                                    <span className={styles.summaryLabel}>Equipment</span>
                                    <span className={styles.summaryValue}>
                                        {profile.equipment.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    {currentIndex > 0 && step !== 'done' && (
                        <button className={styles.backBtn} onClick={back}>
                            ← Back
                        </button>
                    )}
                    <div className={styles.spacer} />
                    {step !== 'done' ? (
                        <button
                            className={styles.nextBtn}
                            onClick={next}
                            disabled={!canProceed()}
                        >
                            {step === 'welcome' ? "Let's go" : 'Continue'} →
                        </button>
                    ) : (
                        <button className={styles.finishBtn} onClick={finish}>
                            Start Training →
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
