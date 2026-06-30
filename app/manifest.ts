import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gymify AI Coach',
    short_name: 'Gymify',
    description: 'AI-powered gym coach with real-time pose tracking & progression checks.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0e0e0e',
    theme_color: '#c8f542',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
