'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client/react'
import { toast } from 'sonner'

import apolloClient from '@/lib/apolloClient'
import { privyConfig } from '@/lib/privy-config'
import SEPOLIA_CHAIN from '@/lib/chains'
import { MarketProvider } from '@/providers/market-provider'
import { PositionsProvider } from '@/providers/positions-provider'
import { NexusProvider } from '@/providers/nexus-provider'

// Single query client for the whole app
const queryClient = new QueryClient()

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  // Narrowly suppress the specific React 'key' warning emitted by the Privy SDK
  // during development so Next's dev overlay doesn't block the flow. We do not
  // silence other console errors.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const orig = console.error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      try {
        const first = args[0]
        // Ignore specific third-party dev warnings from Privy SDK that we cannot
        // fix inside node_modules: missing key warnings and unknown DOM prop `isActive`.
        if (typeof first === 'string') {
          if (
            first.includes('Each child in a list should have a unique "key" prop.') ||
            first.includes('React does not recognize the `isActive` prop on a DOM element') ||
            first.includes('React does not recognize the `isActive` prop')
          ) {
            return
          }
        }
      } catch {
        // fallthrough to original
      }
      orig.apply(console, args)
    }
    return () => {
      console.error = orig
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={apolloClient}>
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''} config={privyConfig}>
          <MarketProvider>
            {/* Ensure all wallets & providers use Ethereum Sepolia */}
            <ChainBootstrap />
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
 * ChainBootstrap — force all wallet providers to Ethereum Sepolia network.
 */
function ChainBootstrap() {
  const { ready } = usePrivy()
  const { wallets } = useWallets()
  const switchedPrivyWallets = useRef<Set<string>>(new Set())
  const injectedRequested = useRef(false)

  useEffect(() => {
    if (!ready) return
    const hexChainId = SEPOLIA_CHAIN.hexId // e.g. '0xaa36a7'

    const trySwitchPrivy = async (w: any) => {
      try {
        const id = (w as any)?.address || (w as any)?.id || JSON.stringify(w)
        if (switchedPrivyWallets.current.has(id)) return

        const maybeSwitch = (w as any)?.switchChain
        if (typeof maybeSwitch === 'function') {
          await maybeSwitch(SEPOLIA_CHAIN.id)
          switchedPrivyWallets.current.add(id)
          return
        }

        const provider: any =
          typeof (w as any).getEthereumProvider === 'function'
            ? await (w as any).getEthereumProvider()
            : typeof (w as any).getEthersProvider === 'function'
            ? await (w as any).getEthersProvider()
            : null

        if (!provider || typeof provider.request !== 'function') return

        try {
          await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChainId }] })
          switchedPrivyWallets.current.add(id)
        } catch (err: any) {
          // Chain not added yet
          if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: hexChainId,
                  chainName: SEPOLIA_CHAIN.name,
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                  blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
                },
              ],
            })
            switchedPrivyWallets.current.add(id)
          }
        }
      } catch {
        // ignore non-fatal errors
      }
    }

    const trySwitchInjected = async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) return
      const injected: any = (window as any).ethereum

      const current = await injected.request({ method: 'eth_chainId' }).catch(() => null)
      if (current === hexChainId) return

      try {
        await injected.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChainId }] })
        injectedRequested.current = true
        toast.success('Switched to Ethereum Sepolia testnet!')
      } catch (err: any) {
        if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
          await injected.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: SEPOLIA_CHAIN.name,
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
              },
            ],
          })
          injectedRequested.current = true
          toast.success('Added & switched to Ethereum Sepolia testnet!')
        }
      }
    }

    // Switch all Privy wallets to Sepolia
    for (const w of wallets) {
      if ((w as any)?.walletClientType === 'privy') void trySwitchPrivy(w)
    }

    // Handle injected wallet (MetaMask, etc.)
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const injected: any = (window as any).ethereum
        if (!injectedRequested.current) void trySwitchInjected()

        const onChainChanged = (chainId: string) => {
          if (chainId !== hexChainId) {
            injectedRequested.current = false
            toast.error('Wrong network detected. Switching back to Ethereum Sepolia…')
            void trySwitchInjected()
          }
        }

        injected.on?.('chainChanged', onChainChanged)
        return () => {
          injected.removeListener?.('chainChanged', onChainChanged)
        }
      }
    } catch {
      // ignore
    }
  }, [ready, wallets])

  return null
}

/**
 * GlobalGuards — prevents crashes if multiple SDKs redefine window.ethereum/web3
 */
function GlobalGuards() {
  useEffect(() => {
    const originalDefine = Object.defineProperty
    try {
      // @ts-ignore override
      Object.defineProperty = function (target: any, property: string | symbol, attributes: any) {
        if (typeof window !== 'undefined' && target === window && (property === 'ethereum' || property === 'web3')) {
          try {
            return originalDefine.call(Object, target, property, attributes)
          } catch {
            return target[property]
          }
        }
        return originalDefine.call(Object, target, property, attributes)
      }
    } catch {
      // ignore
    }
    return () => {
      Object.defineProperty = originalDefine
    }
  }, [])
  return null
}
