"use client"

import type React from "react"

import { PrivyProvider } from "@privy-io/react-auth"
import { privyConfig } from "@/lib/privy-config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a single QueryClient instance for the app
const queryClient = new QueryClient()

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""} config={privyConfig}>
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  )
}
