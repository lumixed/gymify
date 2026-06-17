import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

export const metadata: Metadata = {
    title: "Gymify — Your AI Workout Partner",
    description: "Real-time pose detection and form correction. Get instant feedback on your exercise form using your webcam.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <Navbar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    )
}
