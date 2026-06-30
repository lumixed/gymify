import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import PWARegistration from "@/components/PWARegistration"
import Providers from "@/components/Providers"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

export const metadata: Metadata = {
    title: "Gymify — Your AI Workout Partner",
    description: "Real-time pose detection and form correction. Get instant feedback on your exercise form using your webcam.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Gymify",
    },
}

export const viewport = {
    themeColor: "#0e0e0e",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <PWARegistration />
                <Providers>
                    <Navbar />
                    <main>{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
