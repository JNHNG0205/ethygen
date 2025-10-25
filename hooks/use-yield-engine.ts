'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useChainId } from 'wagmi'

export const useYieldEngine = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()

  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig

  // Read user's sUSDe balance
  const { data: sUSDeBalance, refetch: refetchSUSDeBalance } = useReadContract({
    address: contractConfig?.YieldEngine.address,
    abi: contractConfig?.YieldEngine.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read user's yield
  const { data: userYield, refetch: refetchUserYield } = useReadContract({
    address: contractConfig?.YieldEngine.address,
    abi: contractConfig?.YieldEngine.abi,
    functionName: 'getUserYield',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read total staked amount
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: contractConfig?.YieldEngine.address,
    abi: contractConfig?.YieldEngine.abi,
    functionName: 'getTotalStaked',
    query: {
      enabled: isSupported,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Stake USDe to get sUSDe
  const stake = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.YieldEngine.address,
      abi: contractConfig.YieldEngine.abi,
      functionName: 'stake',
      args: [amount],
      gas: 200000n, // Set explicit gas limit for staking operations
    })
  }

  // Unstake sUSDe to get USDe + yield
  const unstake = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.YieldEngine.address,
      abi: contractConfig.YieldEngine.abi,
      functionName: 'unstake',
      args: [amount],
      gas: 200000n, // Set explicit gas limit for staking operations
    })
  }

  // Claim yield without unstaking
  const claimYield = async () => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.YieldEngine.address,
      abi: contractConfig.YieldEngine.abi,
      functionName: 'claimYield',
      args: [],
      gas: 150000n, // Set explicit gas limit for yield operations
    })
  }

  return {
    // Data
    sUSDeBalance,
    userYield,
    totalStaked,
    
    // Actions
    stake,
    unstake,
    claimYield,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Refetch functions
    refetchSUSDeBalance,
    refetchUserYield,
    refetchTotalStaked,
  }
}
