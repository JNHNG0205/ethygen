import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyProviderWrapper } from "@/providers/privy-provider"
import InjectedChainBootstrap from "@/providers/injected-bootstrap"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Ethygen - Cross-Chain Perpetual DEX",
  description: "Unified cross-chain perpetual trading with gasless transactions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {/* Early injected wallet switch: attempt to prompt MetaMask to Sepolia before any sign-in */}
        <InjectedChainBootstrap />
        <PrivyProviderWrapper>
          {children}

          {/* UI + Analytics */}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </PrivyProviderWrapper>

        <Analytics />
      </body>
    </html>
  )
}
