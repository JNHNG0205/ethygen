'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import { WagmiProvider } from '@privy-io/wagmi';
import { ReactNode, useEffect, useRef } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PositionsProvider } from "@/providers/positions-provider"
import { MarketProvider } from "@/providers/market-provider"
import { ApolloProvider } from "@apollo/client/react"
import apolloClient from "@/lib/apolloClient"
import { NexusProvider } from "@/providers/nexus-provider"
import SEPOLIA_CHAIN from "@/lib/chains"
import { wagmiConfig } from "@/lib/wagmi-config"
import { sepolia, mainnet, baseSepolia } from 'viem/chains';

const queryClient = new QueryClient();

// Privy configuration - Smart Wallet Only (No EOA support)
const privyConfig = {
  appearance: {
    theme: 'light' as const,
    accentColor: '#676FFF' as const,
    logo: 'https://your-logo-url.com/logo.png',
  },
  // Force all users to get smart wallets - no EOA support
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'all-users' as const, // Force ALL users to get smart wallets
      noPromptOnSignature: true,
      noPromptOnTransaction: true,
      noPromptOnTransactionReceipt: true,
    },
  },
  // Enable smart wallets with embedded signers for auto-signing
  smartWallets: {
    ethereum: {
      createOnLogin: 'all-users' as const, // Force smart wallet creation for ALL users
      // Use embedded signers for seamless auto-signing
      signerType: 'embedded' as const,
    },
  },
  // Social and email login only - no external wallet connections
  loginMethods: [
    'email' as const, 
    'google' as const, 
    'twitter' as const, 
    'discord' as const, 
  ], // Social and email login only - smart wallets auto-created
  defaultChain: sepolia,
  supportedChains: [sepolia, mainnet, baseSepolia],
};

export default function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  
  return (
    <PrivyProvider appId="cmgn8elln0043jv0dahs16sm1" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <SmartWalletsProvider>
            <WagmiProvider config={wagmiConfig}>
              <MarketProvider>
                <NexusProvider>
                  <PositionsProvider>{children}</PositionsProvider>
                </NexusProvider>
              </MarketProvider>
            </WagmiProvider>
          </SmartWalletsProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

/**
 * ChainBootstrap: attempts to switch Privy embedded wallets to Ethereum Sepolia on mount/login.
 * Works with current Privy SDK by calling EIP-1193 methods on the wallet provider when available.
 */
function ChainBootstrap() {
  const { ready } = usePrivy()
  const { wallets } = useWallets()
  const once = useRef(false)

  useEffect(() => {
    if (!ready || once.current) return
    once.current = true

  const hexChainId = SEPOLIA_CHAIN.hexId

    const trySwitch = async () => {
      for (const w of wallets) {
        // Prefer embedded/smart wallet only
        if (w.walletClientType !== "privy") continue
        try {
          // Prefer direct switch method if available
          const maybeSwitch: any = (w as any).switchChain
            if (typeof maybeSwitch === "function") {
            await maybeSwitch(SEPOLIA_CHAIN.id)
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
                      chainName: SEPOLIA_CHAIN.name,
                      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                      rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                      blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
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
