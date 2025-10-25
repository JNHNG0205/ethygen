'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAccount } from 'wagmi'
import { getContractConfig } from '@/lib/contracts'
import { useChainId } from 'wagmi'
import { getGasLimit } from '@/lib/gas-config'

export const useUSDe = () => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()
  const { data: hash, isPending, error } = useWriteContract()

  const contractConfig = getContractConfig(chainId)
  const isSupported = !!contractConfig

  // Read user's USDe balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contractConfig?.USDe.address,
    abi: contractConfig?.USDe.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isSupported,
    },
  })

  // Read allowance for vault
  const { data: vaultAllowance, refetch: refetchVaultAllowance } = useReadContract({
    address: contractConfig?.USDe.address,
    abi: contractConfig?.USDe.abi,
    functionName: 'allowance',
    args: address && contractConfig?.Vault.address ? [address, contractConfig.Vault.address] : undefined,
    query: {
      enabled: !!address && !!contractConfig?.Vault.address && isSupported,
    },
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Approve USDe for vault
  const approveForVault = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.USDe.address,
      abi: contractConfig.USDe.abi,
      functionName: 'approve',
      args: [contractConfig.Vault.address, amount],
      gas: getGasLimit('APPROVE'),
    })
  }

  // Approve USDe for yield engine
  const approveForYieldEngine = async (amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.USDe.address,
      abi: contractConfig.USDe.abi,
      functionName: 'approve',
      args: [contractConfig.YieldEngine.address, amount],
      gas: getGasLimit('APPROVE'),
    })
  }

  // Transfer USDe
  const transfer = async (to: `0x${string}`, amount: bigint) => {
    if (!address) throw new Error('No wallet connected')
    if (!contractConfig) throw new Error('Unsupported chain')
    
    return writeContract({
      address: contractConfig.USDe.address,
      abi: contractConfig.USDe.abi,
      functionName: 'transfer',
      args: [to, amount],
      gas: getGasLimit('APPROVE'),
    })
  }

  return {
    // Data
    balance,
    vaultAllowance,
    
    // Actions
    approveForVault,
    approveForYieldEngine,
    transfer,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
    
    // Refetch functions
    refetchBalance,
    refetchVaultAllowance,
  }
}
