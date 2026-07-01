'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadProfile, calculateMacros, calculateTargetCalories, calculateTDEE } from '@/lib/profile'
import { loadNutrition, saveNutrition, clearNutrition, NutritionPlan, Meal } from '@/lib/nutrition'
import styles from './page.module.css'

export default function NutritionPage() {
    const [plan, setPlan] = useState<NutritionPlan | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expandedMeal, setExpandedMeal] = useState<number | null>(null)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const cached = loadNutrition()
        if (cached) setPlan(cached)
        setLoaded(true)
    }, [])

    async function generateNutrition() {
        const profile = loadProfile()
        if (!profile) return

        const macros = calculateMacros(profile)
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/generate-nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, macros }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Something went wrong')
                return
            }

            const fullPlan: NutritionPlan = {
                ...data.nutrition,
                generatedAt: new Date().toISOString(),
            }

            saveNutrition(fullPlan)
            setPlan(fullPlan)
            setExpandedMeal(0)
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleRegenerate() {
        clearNutrition()
        setPlan(null)
        setExpandedMeal(null)
        generateNutrition()
    }

    function toggleMeal(idx: number) {
        setExpandedMeal(expandedMeal === idx ? null : idx)
    }

    if (!loaded) return null

    const profile = loadProfile()
    const hasProfile = profile !== null
    const macros = hasProfile ? calculateMacros(profile) : null
    const tdee = hasProfile ? calculateTDEE(profile) : 0
    const targetCals = hasProfile ? calculateTargetCalories(profile) : 0

    const mealIcons: Record<string, string> = {
        'Breakfast': '🌅',
        'Lunch': '☀️',
        'Snack': '🍎',
        'Dinner': '🌙',
    }

    return (
        <div className={`${styles.page} animate-in`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nutrition Plan</h1>
                {plan && (
                    <p className={styles.subtitle}>{plan.overview}</p>
                )}
            </div>

            {!hasProfile && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🥗</div>
                    <h2 className={styles.emptyTitle}>Set up your profile first</h2>
                    <p className={styles.emptyDesc}>
                        We need your body metrics and goals to calculate your
                        ideal calorie and macro targets.
                    </p>
                    <Link href="/onboarding" className={styles.actionBtn}>
                        Set Up Profile →
                    </Link>
                </div>
            )}

            {hasProfile && macros && (
                <div className={styles.macroOverview}>
                    <div className={styles.macroCard}>
                        <span className={styles.macroValue}>{tdee}</span>
                        <span className={styles.macroLabel}>TDEE</span>
                    </div>
                    <div className={`${styles.macroCard} ${styles.macroHighlight}`}>
                        <span className={styles.macroValue}>{targetCals}</span>
                        <span className={styles.macroLabel}>Target kcal</span>
                    </div>
                    <div className={styles.macroCard}>
                        <span className={styles.macroValue}>{macros.protein}g</span>
                        <span className={styles.macroLabel}>Protein</span>
                    </div>
                    <div className={styles.macroCard}>
                        <span className={styles.macroValue}>{macros.carbs}g</span>
                        <span className={styles.macroLabel}>Carbs</span>
                    </div>
                    <div className={styles.macroCard}>
                        <span className={styles.macroValue}>{macros.fat}g</span>
                        <span className={styles.macroLabel}>Fat</span>
                    </div>
                </div>
            )}

            {hasProfile && !plan && !loading && (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🤖</div>
                    <h2 className={styles.emptyTitle}>Ready to build your meal plan</h2>
                    <p className={styles.emptyDesc}>
                        Our AI will create a daily meal plan hitting {macros?.calories} kcal
                        with {macros?.protein}g protein, tailored to your{' '}
                        {profile.goal.replace('-', ' ')} goal.
                    </p>
                    <button className={styles.actionBtn} onClick={generateNutrition}>
                        Generate Meal Plan →
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                </div>
            )}

            {loading && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Preparing your meals...</p>
                    <p className={styles.loadingSub}>This takes a few seconds</p>
                </div>
            )}

            {plan && !loading && (
                <>
                    <div className={styles.mealList}>
                        {plan.meals.map((meal: Meal, idx: number) => (
                            <div key={idx} className={styles.mealCard}>
                                <button
                                    className={styles.mealHeader}
                                    onClick={() => toggleMeal(idx)}
                                >
                                    <div className={styles.mealInfo}>
                                        <span className={styles.mealIcon}>
                                            {mealIcons[meal.name] || '🍽️'}
                                        </span>
                                        <div className={styles.mealTitleGroup}>
                                            <span className={styles.mealName}>{meal.name}</span>
                                            <span className={styles.mealTime}>{meal.time}</span>
                                        </div>
                                    </div>
                                    <div className={styles.mealMeta}>
                                        <span className={styles.mealCals}>
                                            {meal.totalCalories} kcal
                                        </span>
                                        <div className={styles.mealMacroRow}>
                                            <span className={styles.macroTag} data-type="protein">
                                                P {meal.totalProtein}g
                                            </span>
                                            <span className={styles.macroTag} data-type="carbs">
                                                C {meal.totalCarbs}g
                                            </span>
                                            <span className={styles.macroTag} data-type="fat">
                                                F {meal.totalFat}g
                                            </span>
                                        </div>
                                        <span className={styles.chevron}>
                                            {expandedMeal === idx ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </button>

                                {expandedMeal === idx && (
                                    <div className={styles.foodList}>
                                        {meal.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className={styles.foodRow}>
                                                <div className={styles.foodMain}>
                                                    <span className={styles.foodName}>
                                                        {item.food}
                                                    </span>
                                                    <span className={styles.foodPortion}>
                                                        {item.portion}
                                                    </span>
                                                </div>
                                                <div className={styles.foodMacros}>
                                                    <span>{item.calories} kcal</span>
                                                    <span className={styles.foodMacroDivider}>·</span>
                                                    <span>P {item.protein}g</span>
                                                    <span className={styles.foodMacroDivider}>·</span>
                                                    <span>C {item.carbs}g</span>
                                                    <span className={styles.foodMacroDivider}>·</span>
                                                    <span>F {item.fat}g</span>
                                                </div>
                                            </div>
                                        ))}
                                        {meal.tip && (
                                            <div className={styles.mealTip}>
                                                💡 {meal.tip}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {plan.dailyTip && (
                        <div className={styles.dailyTip}>
                            <span className={styles.dailyTipIcon}>🎯</span>
                            <p className={styles.dailyTipText}>{plan.dailyTip}</p>
                        </div>
                    )}

                    <div className={styles.planActions}>
                        <button className={styles.regenBtn} onClick={handleRegenerate}>
                            Regenerate Meal Plan
                        </button>
                        {error && <p className={styles.error}>{error}</p>}
                    </div>
                </>
            )}
        </div>
    )
}
