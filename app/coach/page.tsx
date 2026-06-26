'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { loadProfile, UserProfile } from '@/lib/profile'
import styles from './page.module.css'

interface Message {
    id: string
    role: 'user' | 'coach'
    text: string
    timestamp: number
}

function generateId() {
    return Math.random().toString(36).slice(2, 10)
}

export default function CoachPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init',
            role: 'coach',
            text: "Hi there! I'm your AI fitness coach. How can I help you with your training, form, or nutrition today?",
            timestamp: Date.now()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setProfile(loadProfile())
        setLoaded(true)
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (!loaded) return null

    async function handleSend(e?: React.FormEvent) {
        if (e) e.preventDefault()
        
        const text = input.trim()
        if (!text || isLoading) return

        const userMsg: Message = {
            id: generateId(),
            role: 'user',
            text,
            timestamp: Date.now()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    profile,
                    history: messages.slice(-10) // Send last 10 messages for context
                })
            })

            const data = await res.json()
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send message')
            }

            const coachMsg: Message = {
                id: generateId(),
                role: 'coach',
                text: data.reply,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, coachMsg])
        } catch (err: any) {
            const errorMsg: Message = {
                id: generateId(),
                role: 'coach',
                text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
                timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    if (!profile) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🤖</div>
                    <h1 className={styles.emptyTitle}>AI Coach</h1>
                    <p className={styles.emptyDesc}>
                        Set up your profile to chat with your personalized AI fitness coach.
                    </p>
                    <Link href="/onboarding" className={styles.actionBtn}>
                        Set up Profile →
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>AI Coach</h1>
                <p className={styles.subtitle}>Ask me anything about fitness, nutrition, or your plan</p>
            </div>

            <div className={styles.chatContainer}>
                <div className={styles.messages}>
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.messageUser : styles.messageCoach}`}
                        >
                            {msg.role === 'coach' && (
                                <div className={styles.avatar}>🤖</div>
                            )}
                            <div className={styles.messageBubble}>
                                {msg.text.split('\n').map((line, i) => (
                                    <span key={i}>
                                        {line}
                                        {i !== msg.text.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles.messageWrapper} ${styles.messageCoach}`}>
                            <div className={styles.avatar}>🤖</div>
                            <div className={`${styles.messageBubble} ${styles.typingIndicator}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ask your coach..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        className={styles.sendBtn}
                        disabled={!input.trim() || isLoading}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}
