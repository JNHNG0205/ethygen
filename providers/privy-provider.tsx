"use client"

import type React from "react"

import { PrivyProvider } from "@privy-io/react-auth"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { privyConfig } from "@/lib/privy-config"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PositionsProvider } from "@/providers/positions-provider"
import { MarketProvider } from "@/providers/market-provider"
import { ApolloProvider } from "@apollo/client/react"
import apolloClient from "@/lib/apolloClient"
import { useEffect, useRef } from "react"
import { baseSepolia } from "viem/chains"
import { NexusProvider } from "@/providers/nexus-provider"

// Create a single QueryClient instance for the app
const queryClient = new QueryClient()

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""} config={privyConfig}>
          <MarketProvider>
            {/* Ensure embedded wallets default to Base Sepolia */}
            <ChainBootstrap />
            {/* Guard against duplicate window.ethereum injection errors from extensions/SDKs */}
            <GlobalGuards />
            <NexusProvider>
              <PositionsProvider>{children}</PositionsProvider>
            </NexusProvider>
          </MarketProvider>
        </PrivyProvider>
      </ApolloProvider>
    </QueryClientProvider>
  )
}

/**
 * ChainBootstrap: attempts to switch Privy embedded wallets to Base Sepolia on mount/login.
 * Works with current Privy SDK by calling EIP-1193 methods on the wallet provider when available.
 */
function ChainBootstrap() {
  const { ready } = usePrivy()
  const { wallets } = useWallets()
  const once = useRef(false)

  useEffect(() => {
    if (!ready || once.current) return
    once.current = true

    const hexChainId = `0x${baseSepolia.id.toString(16)}`

    const trySwitch = async () => {
      for (const w of wallets) {
        // Prefer embedded/smart wallet only
        if (w.walletClientType !== "privy") continue
        try {
          // Prefer direct switch method if available
          const maybeSwitch: any = (w as any).switchChain
          if (typeof maybeSwitch === "function") {
            await maybeSwitch(baseSepolia.id)
            continue
          }
          // Fallback to provider.request
          const provider: any =
            typeof (w as any).getEthereumProvider === "function"
              ? await (w as any).getEthereumProvider()
              : // Some SDK versions expose Ethers provider
                typeof (w as any).getEthersProvider === "function"
                ? await (w as any).getEthersProvider()
                : null

          if (provider && typeof provider.request === "function") {
            try {
              await provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: hexChainId }],
              })
            } catch (err: any) {
              // If the chain isn't added, request to add it
              if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
                await provider.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: hexChainId,
                      chainName: "Base Sepolia",
                      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                      rpcUrls: ["https://sepolia.base.org"],
                      blockExplorerUrls: ["https://sepolia.basescan.org"],
                    },
                  ],
                })
              }
            }
          }
        } catch {
          // silent; non-fatal
        }
      }
    }

    void trySwitch()
  }, [ready, wallets])

  return null
}

/**
 * GlobalGuards: Mitigate window.ethereum redefine crashes from multiple wallet injectors.
 * We carefully wrap Object.defineProperty to swallow only the specific error when
 * someone tries to redefine `window.ethereum` or `window.web3`.
 */
function GlobalGuards() {
  useEffect(() => {
    const originalDefine = Object.defineProperty
    try {
      // @ts-ignore override for guard
      Object.defineProperty = function (target: any, property: string | symbol, attributes: any) {
        if (typeof window !== 'undefined' && (target === window) && (property === 'ethereum' || property === 'web3')) {
          try {
            return originalDefine.call(Object, target, property, attributes)
          } catch (e) {
            // Swallow redefine errors to avoid breaking the app when multiple injectors race
            return target[property]
          }
        }
        return originalDefine.call(Object, target, property, attributes)
      }
    } catch {
      // ignore
    }
    return () => {
      // restore
      Object.defineProperty = originalDefine
    }
  }, [])
  return null
}
