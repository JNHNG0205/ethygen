// Gas configuration for different contract operations
export const GAS_LIMITS = {
  // Basic token operations
  APPROVE: 100000n,
  TRANSFER: 100000n,
  BALANCE_CHECK: 50000n,
  
  // Vault operations (more complex)
  VAULT_DEPOSIT: 200000n,
  VAULT_WITHDRAW: 200000n,
  VAULT_MINT_YUSDE: 200000n,
  VAULT_REDEEM_YUSDE: 200000n,
  VAULT_CLAIM_YIELD: 150000n,
  
  // Yield engine operations
  YIELD_STAKE: 200000n,
  YIELD_UNSTAKE: 200000n,
  YIELD_CLAIM: 150000n,
  
  // YUSDe operations
  YUSDE_MINT: 200000n,
  YUSDE_BURN: 200000n,
  
  // PerpDEX operations (most complex)
  PERPDEX_OPEN_POSITION: 300000n,
  PERPDEX_CLOSE_POSITION: 250000n,
  PERPDEX_LIQUIDATE: 300000n,
  PERPDEX_UPDATE_PRICE: 100000n,
} as const

// Gas price configuration (in wei)
export const GAS_PRICE = {
  SLOW: 2000000000n,    // 2 gwei
  STANDARD: 5000000000n, // 5 gwei
  FAST: 10000000000n,    // 10 gwei
} as const

// Helper function to get gas limit for operation
export const getGasLimit = (operation: keyof typeof GAS_LIMITS) => {
  return GAS_LIMITS[operation]
}

// Helper function to get gas price
export const getGasPrice = (speed: keyof typeof GAS_PRICE = 'STANDARD') => {
  return GAS_PRICE[speed]
}

// Helper function to estimate gas with buffer
export const estimateGasWithBuffer = (baseGas: bigint, bufferPercent: number = 20) => {
  const buffer = (baseGas * BigInt(bufferPercent)) / 100n
  return baseGas + buffer
}
