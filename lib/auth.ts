import { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './db'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || 'mock-github-id',
            clientSecret: process.env.GITHUB_SECRET || 'mock-github-secret',
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || 'mock-google-id',
            clientSecret: process.env.GOOGLE_SECRET || 'mock-google-secret',
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                // Attach the DB user id to the session for API usage
                session.user.id = token.sub
            }
            return session
        },
    },
    pages: {
        signIn: '/onboarding', // Or a dedicated sign-in page, for now reuse onboarding
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
}
