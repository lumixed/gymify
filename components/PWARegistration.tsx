'use client'

import { useEffect } from 'react'

export default function PWARegistration() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            if (process.env.NODE_ENV !== 'production') {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) {
                        registration.unregister()
                    }
                })
            } else if ((window as any).workbox === undefined) {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((reg) => {
                        console.log('Service Worker registered successfully:', reg.scope)
                    })
                    .catch((err) => {
                        console.error('Service Worker registration failed:', err)
                    })
            }
        }
    }, [])

    return null
}
