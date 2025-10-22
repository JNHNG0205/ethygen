"use client"

import type React from "react"

import { PrivyProvider } from "@privy-io/react-auth"
import { privyConfig } from "@/lib/privy-config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PositionsProvider } from "@/providers/positions-provider"
import { MarketProvider } from "@/providers/market-provider"
import { ApolloProvider } from "@apollo/client/react"
import apolloClient from "@/lib/apolloClient"

// Create a single QueryClient instance for the app
const queryClient = new QueryClient()

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""} config={privyConfig}>
          <MarketProvider>
            <PositionsProvider>{children}</PositionsProvider>
          </MarketProvider>
        </PrivyProvider>
      </ApolloProvider>
    </QueryClientProvider>
  )
}
