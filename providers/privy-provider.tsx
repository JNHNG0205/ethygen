'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client/react'
import { toast } from 'sonner'
import { useSyncExternalStore } from 'react'

import apolloClient from '@/lib/apolloClient'
import { privyConfig } from '@/lib/privy-config'
import SEPOLIA_CHAIN from '@/lib/chains'
import { MarketProvider } from '@/providers/market-provider'
import { PositionsProvider } from '@/providers/positions-provider'
import { NexusProvider } from '@/providers/nexus-provider'

// Single query client for the whole app
const queryClient = new QueryClient()

// EIP-6963 Types (add to a types/ethereum.d.ts or inline here)
interface EIP6963ProviderInfo {
  walletId: string; // e.g., 'io.metamask'
  uuid: string; // Unique session ID
  name: string; // Human-readable name
  icon: string; // Icon URL
}

interface EIP1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  // Other EIP-1193 methods as needed
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

// The CustomEvent.detail will directly carry the provider detail
type EIP6963AnnounceProviderEvent = EIP6963ProviderDetail;

// Extend WindowEventMap for EIP-6963
declare global {
  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent<EIP6963AnnounceProviderEvent>;
  }
}

// EIP-6963 Store (external store for discovered providers)
let eip6963Providers: EIP6963ProviderDetail[] = [];

const eip6963Store = {
  value: () => eip6963Providers,
  subscribe: (callback: () => void) => {
    const onAnnouncement = (event: CustomEvent<EIP6963AnnounceProviderEvent>) => {
      // Avoid duplicates by UUID
      if (eip6963Providers.some(p => p.info.uuid === event.detail.info.uuid)) return;
      eip6963Providers = [...eip6963Providers, event.detail];
      callback();
    };

    window.addEventListener('eip6963:announceProvider', onAnnouncement as EventListener);

    // Trigger discovery
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnouncement as EventListener);
    };
  },
};

// Hook for syncing EIP-6963 providers in React
export const useEIP6963Providers = () => useSyncExternalStore(eip6963Store.subscribe, eip6963Store.value, eip6963Store.value);

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
 * Now supports EIP-6963 for multi-injected provider discovery (e.g., MetaMask, Rabby, etc.).
 */
function ChainBootstrap() {
  const { ready } = usePrivy()
  const { wallets } = useWallets()
  const switchedPrivyWallets = useRef<Set<string>>(new Set())
  const switchedEIP6963Providers = useRef<Set<string>>(new Set())
  const eip6963Providers = useEIP6963Providers()  // Hook for discovered providers

  const hexChainId = SEPOLIA_CHAIN.hexId // e.g. '0xaa36a7'

  // Helper: Switch a single EIP-1193 provider to Sepolia
  const switchProviderToSepolia = async (provider: EIP1193Provider, providerId: string, isPrivy = false) => {
    if (switchedPrivyWallets.current.has(providerId) || switchedEIP6963Providers.current.has(providerId)) return

    try {
      // First, try switch
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChainId }] })
      if (isPrivy) {
        switchedPrivyWallets.current.add(providerId)
      } else {
        switchedEIP6963Providers.current.add(providerId)
      }
      toast.success(`${isPrivy ? 'Privy' : 'Wallet'} switched to Ethereum Sepolia!`)
      return
    } catch (err: any) {
      // Chain not added (code 4902)
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
        // Retry switch after add
        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChainId }] })
        if (isPrivy) {
          switchedPrivyWallets.current.add(providerId)
        } else {
          switchedEIP6963Providers.current.add(providerId)
        }
        toast.success(`Added & switched to Ethereum Sepolia!`)
        return
      }
      // Other errors: ignore or log
      console.warn('Chain switch failed for provider:', providerId, err)
    }
  }

  useEffect(() => {
    if (!ready) return

    // Handle Privy wallets (existing logic, refactored into helper)
    const handlePrivyWallets = async () => {
      for (const w of wallets) {
        const id = (w as any)?.address || (w as any)?.id || JSON.stringify(w)
        if (switchedPrivyWallets.current.has(id)) continue

        const provider = typeof (w as any).getEthereumProvider === 'function'
          ? await (w as any).getEthereumProvider()
          : typeof (w as any).getEthersProvider === 'function'
            ? await (w as any).getEthersProvider()
            : null

        if (provider && typeof provider.request === 'function') {
          await switchProviderToSepolia(provider, id, true)
        }
      }
    }
    void handlePrivyWallets()

    // Handle EIP-6963 discovered providers
    const handleEIP6963Providers = async () => {
      for (const { provider, info } of eip6963Providers) {
        if (!provider || typeof provider.request !== 'function') continue
        const providerId = info.uuid
        if (switchedEIP6963Providers.current.has(providerId)) continue
        await switchProviderToSepolia(provider, providerId, false)
      }
    }
    void handleEIP6963Providers()

    // Chain change listener for EIP-6963 providers (aggregate)
    const handleChainChanged = (chainId: string) => {
      if (chainId !== hexChainId) {
        toast.error('Wrong network detected. Switching back to Ethereum Sepolia…')
        // Re-trigger switches for all
        void handlePrivyWallets()
        void handleEIP6963Providers()
      }
    }

    // Listen on window.ethereum as fallback for legacy (non-EIP6963) injected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const injected = (window as any).ethereum
      injected.on?.('chainChanged', handleChainChanged)

      // Initial switch for legacy injected (if not already handled by EIP-6963)
      ;(async () => {
        try {
          const currentChain = await injected.request({ method: 'eth_chainId' }).catch(() => null)
          if (currentChain !== hexChainId) {
            await switchProviderToSepolia(injected, 'legacy-injected', false)
          }
        } catch (e) {
          console.warn('ChainBootstrap: legacy injected chain check failed', e)
        }
      })()
    }

    // Global chain change listener (for any provider) — wrap to safely extract chainId
    const windowChainHandler = (e: Event) => {
      try {
        // Some emitters send the chainId directly, others include it in detail
        // Attempt to extract the chainId in a few common shapes
        const anyE: any = e as any
        const chainIdCandidate = anyE?.detail ?? anyE?.chainId ?? anyE?.target?.chainId ?? null
        if (chainIdCandidate) {
          handleChainChanged(String(chainIdCandidate))
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('chainChanged', windowChainHandler as EventListener)

    return () => {
      window.removeEventListener('chainChanged', windowChainHandler as EventListener)
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener?.('chainChanged', handleChainChanged)
      }
    }
  }, [ready, wallets, eip6963Providers])  // Re-run on new providers discovery

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