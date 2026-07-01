import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Allow images from OAuth avatar providers
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: '*.googleusercontent.com' },
        ],
    },

    // Production-safe security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options',           value: 'DENY' },
                    { key: 'X-Content-Type-Options',    value: 'nosniff' },
                    { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy',         value: 'camera=self, microphone=self' },
                ],
            },
        ]
    },

    // Silence the Prisma edge-runtime warning during build
    serverExternalPackages: ['@prisma/client'],
}

export default nextConfig
