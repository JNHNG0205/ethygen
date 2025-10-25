'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useUSDe } from '@/hooks/use-usde'
import { useYieldEngine } from '@/hooks/use-yield-engine'
import { useYUSDe } from '@/hooks/use-yusde'
import { useVault } from '@/hooks/use-vault'
import { usePerpDEX } from '@/hooks/use-perpdex'

interface ContractsContextValue {
  // USDe operations
  usde: ReturnType<typeof useUSDe>
  
  // Yield Engine operations
  yieldEngine: ReturnType<typeof useYieldEngine>
  
  // YUSDe operations
  yusde: ReturnType<typeof useYUSDe>
  
  // Vault operations
  vault: ReturnType<typeof useVault>
  
  // PerpDEX operations
  perpdex: ReturnType<typeof usePerpDEX>
  
  // Combined state
  isLoading: boolean
  hasError: boolean
  error: Error | null
}

const ContractsContext = createContext<ContractsContextValue | undefined>(undefined)

export function ContractsProvider({ children }: { children: React.ReactNode }) {
  const usde = useUSDe()
  const yieldEngine = useYieldEngine()
  const yusde = useYUSDe()
  const vault = useVault()
  const perpdex = usePerpDEX()

  const isLoading = useMemo(() => {
    return usde.isPending || yieldEngine.isPending || yusde.isPending || vault.isPending || perpdex.isPending
  }, [usde.isPending, yieldEngine.isPending, yusde.isPending, vault.isPending, perpdex.isPending])

  const hasError = useMemo(() => {
    return !!(usde.error || yieldEngine.error || yusde.error || vault.error || perpdex.error)
  }, [usde.error, yieldEngine.error, yusde.error, vault.error, perpdex.error])

  const error = useMemo(() => {
    return usde.error || yieldEngine.error || yusde.error || vault.error || perpdex.error || null
  }, [usde.error, yieldEngine.error, yusde.error, vault.error, perpdex.error])

  const value = useMemo(() => ({
    usde,
    yieldEngine,
    yusde,
    vault,
    perpdex,
    isLoading,
    hasError,
    error,
  }), [
    usde,
    yieldEngine,
    yusde,
    vault,
    perpdex,
    isLoading,
    hasError,
    error,
  ])

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractsContext)
  if (!context) {
    throw new Error('useContracts must be used within a ContractsProvider')
  }
  return context
}

// Individual contract hooks for convenience
export const useContractsUSDe = () => {
  const { usde } = useContracts()
  return usde
}

export const useContractsYieldEngine = () => {
  const { yieldEngine } = useContracts()
  return yieldEngine
}

export const useContractsYUSDe = () => {
  const { yusde } = useContracts()
  return yusde
}

export const useContractsVault = () => {
  const { vault } = useContracts()
  return vault
}

export const useContractsPerpDEX = () => {
  const { perpdex } = useContracts()
  return perpdex
}
