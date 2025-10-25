'use client'
import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth' // For auth gate
import { useNexus } from '@/providers/nexus-provider'

export interface UnifiedBalance {
  symbol: string;
  balance: string; // Raw (e.g., '100000000' for 100 USDC)
  balanceInFiat: number; // USD equiv. (e.g., 100)
  breakdown: Array<{
    balance: string;
    balanceInFiat: number;
    chain: { id: number; name: string; logo: string };
    contractAddress: `0x${string}`;
    decimals: number;
    isNative?: boolean;
  }>;
  decimals: number;
  icon?: string;
}

export const useUnifiedBalances = (userAddress?: `0x${string}`, tokenSymbol?: string) => {
  const { authenticated } = usePrivy()
  const { sdk, isInitialized } = useNexus() as any

  return useQuery({
    queryKey: ['unifiedBalances', userAddress, tokenSymbol],
    queryFn: async (): Promise<UnifiedBalance[]> => {
      if (!userAddress || !authenticated || !isInitialized || !sdk) return []

      // Resolve SDK surface: getUnifiedBalances may live in different places
      const resolve = (s: any) => {
        const direct = s?.getUnifiedBalances
        const nested = s?.balances?.getUnifiedBalances
        const client = s?.client?.getUnifiedBalances
        const getOne = s?.getUnifiedBalance || s?.balances?.getUnifiedBalance || s?.client?.getUnifiedBalance
        return {
          many: typeof direct === 'function' ? direct.bind(s)
            : typeof nested === 'function' ? nested.bind(s?.balances)
            : typeof client === 'function' ? client.bind(s?.client)
            : null,
          one: typeof getOne === 'function' ? getOne.bind(direct ? s : s?.balances || s?.client || s) : null,
        }
      }

      const fns = resolve(sdk)
      if (!fns.many && !fns.one) {
        console.error('[useUnifiedBalances] Unsupported SDK surface. Keys:', Object.keys(sdk || {}))
        return []
      }

      try {
        if (tokenSymbol && fns.one) {
          const asset = await fns.one(tokenSymbol)
          return asset ? [asset] : []
        }
        if (fns.many) {
          // Call with params first, fallback to no-arg
          try {
            const list = await fns.many({ address: userAddress, network: 'testnet' })
            return list || []
          } catch {
            const list = await fns.many()
            return list || []
          }
        }
        return []
      } catch (error) {
        console.error('Nexus balance fetch error:', error)
        throw new Error('Failed to fetch unified balances')
      }
    },
    refetchInterval: 10000,
    enabled: !!userAddress && authenticated && isInitialized && !!sdk,
  })
}