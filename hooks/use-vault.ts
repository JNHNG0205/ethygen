'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useChainId } from 'wagmi'

export const useVault = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()

  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig

  // Read user's USDe deposit balance
  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    address: contractConfig?.Vault.address,
    abi: contractConfig?.Vault.abi,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read user's sUSDe balance
  const { data: userSUSDeBalance, refetch: refetchUserSUSDeBalance } = useReadContract({
    address: contractConfig?.Vault.address,
    abi: contractConfig?.Vault.abi,
    functionName: 'getUserSUSDeBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read user's yUSDe balance
  const { data: userYUSDeBalance, refetch: refetchUserYUSDeBalance } = useReadContract({
    address: contractConfig?.Vault.address,
    abi: contractConfig?.Vault.abi,
    functionName: 'getUserYUSDeBalance',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read user's yield
  const { data: userYield, refetch: refetchUserYield } = useReadContract({
    address: contractConfig?.Vault.address,
    abi: contractConfig?.Vault.abi,
    functionName: 'getUserYield',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read vault info
  const { data: vaultInfo, refetch: refetchVaultInfo } = useReadContract({
    address: contractConfig?.Vault.address,
    abi: contractConfig?.Vault.abi,
    functionName: 'getVaultInfo',
    query: {
      enabled: isSupported,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Deposit USDe into vault
  const deposit = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.Vault.address,
      abi: contractConfig.Vault.abi,
      functionName: 'deposit',
      args: [amount],
      gas: 200000n, // Set explicit gas limit for vault operations
    })
  }

  // Withdraw from vault
  const withdraw = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.Vault.address,
      abi: contractConfig.Vault.abi,
      functionName: 'withdraw',
      args: [amount],
      gas: 200000n, // Set explicit gas limit for vault operations
    })
  }

  // Mint yUSDe using sUSDe as collateral
  const mintYUSDe = async (susdeAmount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.Vault.address,
      abi: contractConfig.Vault.abi,
      functionName: 'mintYUSDe',
      args: [susdeAmount],
      gas: 200000n, // Set explicit gas limit for vault operations
    })
  }

  // Redeem yUSDe to get sUSDe back
  const redeemYUSDe = async (yusdeAmount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.Vault.address,
      abi: contractConfig.Vault.abi,
      functionName: 'redeemYUSDe',
      args: [yusdeAmount],
      gas: 200000n, // Set explicit gas limit for vault operations
    })
  }

  // Claim yield
  const claimYield = async () => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.Vault.address,
      abi: contractConfig.Vault.abi,
      functionName: 'claimYield',
      args: [],
      gas: 150000n, // Set explicit gas limit for yield operations
    })
  }

  return {
    // Data
    userBalance,
    userSUSDeBalance,
    userYUSDeBalance,
    userYield,
    vaultInfo,
    
    // Actions
    deposit,
    withdraw,
    mintYUSDe,
    redeemYUSDe,
    claimYield,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Refetch functions
    refetchUserBalance,
    refetchUserSUSDeBalance,
    refetchUserYUSDeBalance,
    refetchUserYield,
    refetchVaultInfo,
  }
}
