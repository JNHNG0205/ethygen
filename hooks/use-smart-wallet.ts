'use client'

import { useSmartWallets } from '@privy-io/react-auth/smart-wallets'
import SEPOLIA_CHAIN from '@/lib/chains'
import { toast } from 'sonner'

export type GaslessTxParams = Record<string, any>

export const useSmartWallet = () => {
  const { client, getClientForChain } = useSmartWallets()

  /**
   * Retrieve the Privy smart wallet client for Ethereum Sepolia only.
   */
  const getSepoliaClient = async () => {
    if (!client) {
      const msg = 'Privy Smart Wallet not initialized. Please log in first.'
      toast.error(msg)
      throw new Error(msg)
    }

    const chainClient = await getClientForChain({ id: SEPOLIA_CHAIN.id })
    if (!chainClient) {
      const msg = `Smart wallet client unavailable for ${SEPOLIA_CHAIN.name}`
      toast.error(msg)
      throw new Error(msg)
    }

    return chainClient
  }

  /**
   * Execute a gasless transaction strictly on Ethereum Sepolia.
   */
  const executeGaslessTx = async (txParams: GaslessTxParams, uiTitle = 'Confirm Tx') => {
    try {
      const baseClient = await getSepoliaClient()

      // Force Sepolia network only
      if (txParams?.chainId && txParams.chainId !== SEPOLIA_CHAIN.id) {
        throw new Error(`Invalid chain ID: must be Ethereum Sepolia (${SEPOLIA_CHAIN.id})`)
      }

      const hash = await baseClient.sendTransaction({
        ...(txParams as any),
        chainId: SEPOLIA_CHAIN.id,
      } as any)

      toast.success(`Tx sent on Sepolia: ${hash.slice(0, 10)}... (Gasless!)`)
      return hash
    } catch (error) {
      const message = (error as Error)?.message ?? 'Unknown error'
      toast.error('Tx failed: ' + message)
      throw error
    }
  }

  return { client, getSepoliaClient, executeGaslessTx }
}
