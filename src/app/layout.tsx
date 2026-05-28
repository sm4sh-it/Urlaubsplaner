import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/ThemeProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "sm4shReisen - Urlaubsplaner",
  description: "Jahresübersicht und Urlaubsplanung für die ganze Familie",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning is needed for next-themes
    <html lang="de" suppressHydrationWarning className="h-screen overflow-hidden">
      <body suppressHydrationWarning className={`${inter.variable} font-sans flex flex-col h-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 overflow-hidden flex flex-col p-4 bg-slate-100/50 dark:bg-slate-950/50">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
