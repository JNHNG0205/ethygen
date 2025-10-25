'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useChainId } from 'wagmi'

export const useYUSDe = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()

  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig

  // Read user's yUSDe balance
  const { data: yUSDeBalance, refetch: refetchYUSDeBalance } = useReadContract({
    address: contractConfig?.YUSDe.address,
    abi: contractConfig?.YUSDe.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read total backing (sUSDe held as collateral)
  const { data: totalBacking, refetch: refetchTotalBacking } = useReadContract({
    address: contractConfig?.YUSDe.address,
    abi: contractConfig?.YUSDe.abi,
    functionName: 'getTotalBacking',
    query: {
      enabled: isSupported,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Mint yUSDe using sUSDe as collateral
  const mint = async (susdeAmount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.YUSDe.address,
      abi: contractConfig.YUSDe.abi,
      functionName: 'mint',
      args: [susdeAmount],
    })
  }

  // Burn yUSDe to get sUSDe back
  const burn = async (yusdeAmount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.YUSDe.address,
      abi: contractConfig.YUSDe.abi,
      functionName: 'burn',
      args: [yusdeAmount],
    })
  }

  // Calculate collateral amount for given sUSDe
  const getCollateralAmount = (susdeAmount: bigint) => {
    // 0.8:1 ratio (80% collateralization)
    return (susdeAmount * 8000n) / 10000n
  }

  // Calculate backing amount for given yUSDe
  const getBackingAmount = (yusdeAmount: bigint) => {
    // 1:0.8 ratio (125% backing)
    return (yusdeAmount * 10000n) / 8000n
  }

  return {
    // Data
    yUSDeBalance,
    totalBacking,
    
    // Actions
    mint,
    burn,
    
    // Utility functions
    getCollateralAmount,
    getBackingAmount,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Refetch functions
    refetchYUSDeBalance,
    refetchTotalBacking,
  }
}
