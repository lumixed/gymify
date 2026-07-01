'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
    loadMeasurements, 
    saveMeasurement, 
    deleteMeasurement, 
    MeasurementEntry 
} from '@/lib/measurements'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './page.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
)

const ACCENT = '#c8f542'
const ACCENT_MUTED = 'rgba(200, 245, 66, 0.15)'
const GRID_COLOR = 'rgba(255,255,255,0.06)'
const TICK_COLOR = '#666'

function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MeasurementsPage() {
    const [entries, setEntries] = useState<MeasurementEntry[]>([])
    const [loaded, setLoaded] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [weight, setWeight] = useState('')
    const [bodyFat, setBodyFat] = useState('')
    const [chest, setChest] = useState('')
    const [waist, setWaist] = useState('')
    const [arms, setArms] = useState('')
    const [thighs, setThighs] = useState('')

    useEffect(() => {
        setEntries(loadMeasurements())
        setLoaded(true)
    }, [])

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        if (!weight) return

        const entry = saveMeasurement({
            date: new Date(date).toISOString(),
            weight: parseFloat(weight),
            bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
            chest: chest ? parseFloat(chest) : undefined,
            waist: waist ? parseFloat(waist) : undefined,
            arms: arms ? parseFloat(arms) : undefined,
            thighs: thighs ? parseFloat(thighs) : undefined,
        })

        setEntries(prev => {
            const next = [entry, ...prev]
            next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            return next
        })
        
        setShowForm(false)
        setWeight('')
        setBodyFat('')
        setChest('')
        setWaist('')
        setArms('')
        setThighs('')
    }

    const handleDelete = (id: string) => {
        if (!confirm('Delete this entry?')) return
        deleteMeasurement(id)
        setEntries(prev => prev.filter(m => m.id !== id))
    }

    const chartData = useMemo(() => {
        // Sort chronologically for chart
        const chrono = [...entries].reverse()
        return {
            labels: chrono.map(e => formatDate(e.date)),
            datasets: [
                {
                    label: 'Weight (kg)',
                    data: chrono.map(e => e.weight),
                    borderColor: ACCENT,
                    backgroundColor: ACCENT_MUTED,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: ACCENT,
                },
            ],
        }
    }, [entries])

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { color: GRID_COLOR },
                ticks: { color: TICK_COLOR, font: { size: 10 } },
            },
            y: {
                grid: { color: GRID_COLOR },
                ticks: { color: TICK_COLOR, font: { size: 10 } },
            },
        },
    }

    if (!loaded) return null

    return (
        <div className={`${styles.page} animate-in`}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Body Measurements</h1>
                    <p className={styles.subtitle}>Track your weight and body composition over time</p>
                </div>
                <button 
                    className={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ New Log'}
                </button>
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h2 className={styles.formTitle}>Log Measurements</h2>
                    <form onSubmit={handleSave} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Date</label>
                                <input 
                                    type="date" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Weight (kg) *</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="e.g. 75.5"
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Body Fat (%)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={bodyFat} 
                                    onChange={e => setBodyFat(e.target.value)}
                                    placeholder="e.g. 15.2"
                                />
                            </div>
                        </div>

                        <div className={styles.divider}>Optional Circumferences (cm)</div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Chest</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={chest} 
                                    onChange={e => setChest(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Waist</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={waist} 
                                    onChange={e => setWaist(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Arms</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={arms} 
                                    onChange={e => setArms(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Thighs</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={thighs} 
                                    onChange={e => setThighs(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            Save Entry
                        </button>
                    </form>
                </div>
            )}

            {entries.length > 0 ? (
                <>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Weight Trend</h2>
                        <div className={styles.chartContainer}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>History</h2>
                        <div className={styles.tableCard}>
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Weight</th>
                                            <th>Body Fat</th>
                                            <th>Chest</th>
                                            <th>Waist</th>
                                            <th>Arms</th>
                                            <th>Thighs</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map(e => (
                                            <tr key={e.id}>
                                                <td>{formatDate(e.date)}</td>
                                                <td className={styles.highlight}>{e.weight} kg</td>
                                                <td>{e.bodyFat ? `${e.bodyFat}%` : '-'}</td>
                                                <td>{e.chest ? `${e.chest} cm` : '-'}</td>
                                                <td>{e.waist ? `${e.waist} cm` : '-'}</td>
                                                <td>{e.arms ? `${e.arms} cm` : '-'}</td>
                                                <td>{e.thighs ? `${e.thighs} cm` : '-'}</td>
                                                <td>
                                                    <button 
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDelete(e.id)}
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                !showForm && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📏</div>
                        <h1 className={styles.emptyTitle}>No measurements yet</h1>
                        <p className={styles.emptyDesc}>
                            Start logging your body weight and measurements to see your progress over time.
                        </p>
                        <button className={styles.actionBtn} onClick={() => setShowForm(true)}>
                            Log First Entry
                        </button>
                    </div>
                )
            )}
        </div>
    )
}
