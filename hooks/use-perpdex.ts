'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useChainId } from 'wagmi'

export interface Position {
  size: bigint
  entryPrice: bigint
  collateral: bigint
  isLong: boolean
  timestamp: bigint
}

export const usePerpDEX = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()

  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig

  // Read user's position
  const { data: position, refetch: refetchPosition } = useReadContract({
    address: contractConfig?.PerpDEX.address,
    abi: contractConfig?.PerpDEX.abi,
    functionName: 'getPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Check if user has position
  const { data: hasPosition, refetch: refetchHasPosition } = useReadContract({
    address: contractConfig?.PerpDEX.address,
    abi: contractConfig?.PerpDEX.abi,
    functionName: 'hasPosition',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read position health
  const { data: positionHealth, refetch: refetchPositionHealth } = useReadContract({
    address: contractConfig?.PerpDEX.address,
    abi: contractConfig?.PerpDEX.abi,
    functionName: 'getPositionHealth',
    args: address && hasPosition ? [address, 'ETH/USD'] : undefined,
    query: {
      enabled: !!address && !!hasPosition && isSupported,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Open a new position
  const openPosition = async (
    size: bigint,
    collateral: bigint,
    isLong: boolean,
    symbol: string = 'ETH/USD'
  ) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.PerpDEX.address,
      abi: contractConfig.PerpDEX.abi,
      functionName: 'openPosition',
      args: [size, collateral, isLong, symbol],
    })
  }

  // Close existing position
  const closePosition = async (symbol: string = 'ETH/USD') => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.PerpDEX.address,
      abi: contractConfig.PerpDEX.abi,
      functionName: 'closePosition',
      args: [symbol],
    })
  }

  // Liquidate a position
  const liquidatePosition = async (user: `0x${string}`, symbol: string = 'ETH/USD') => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.PerpDEX.address,
      abi: contractConfig.PerpDEX.abi,
      functionName: 'liquidatePosition',
      args: [user, symbol],
    })
  }

  // Update price (owner only - for testing)
  const updatePrice = async (symbol: string, price: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.PerpDEX.address,
      abi: contractConfig.PerpDEX.abi,
      functionName: 'updatePrice',
      args: [symbol, price],
    })
  }

  return {
    // Data
    position: position as Position | undefined,
    hasPosition,
    positionHealth,
    
    // Actions
    openPosition,
    closePosition,
    liquidatePosition,
    updatePrice,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Refetch functions
    refetchPosition,
    refetchHasPosition,
    refetchPositionHealth,
  }
}
