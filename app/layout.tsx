import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Carpool Share Calculator – Split Fuel & Trip Costs | TinkerHub",
  description: "Free carpool calculator to split fuel costs, tolls, and parking fairly between passengers. Perfect for daily commutes, road trips, and travel groups.",
  keywords: "carpool calculator, fuel split, road trip expenses, fuel cost calculator, split gas money",
  authors: [{ name: "TinkerHub Team" }],
  openGraph: {
    title: "Carpool Share Calculator – Split Fuel & Trip Costs",
    description: "Calculate and split fuel costs fairly between passengers",
    url: "https://carpool.tinkerhub.site",
    siteName: "TinkerHub",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
