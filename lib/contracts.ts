import { sepolia } from 'viem/chains'

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  [sepolia.id]: {
    USDe: '0x5e034a923D3947A2fE04172EA9cB3D35EA1f2abA',
    YieldEngine: '0x5E63123AB3970e4A25a17103A8552C4555f3C4B8',
    YUSDe: '0x21c4cE8cAEE307a47E1EC35De871b02580e6E6cE',
    Vault: '0xC8298b7abC7a9298936d3Fe0CE71c2e10919C203',
    PerpDEX: '0x2a0fADd0e2e918A5238991AD759c5a09F9A10942',
  }
} as const

// Contract ABIs - simplified versions for frontend integration
export const USDE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "uint8", "name": "decimals", "type": "uint8"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export const YIELD_ENGINE_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_usde", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserYield",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalStaked",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const YUSDE_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_susde", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "susdeAmount", "type": "uint256"}],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "yusdeAmount", "type": "uint256"}],
    "name": "burn",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "susdeAmount", "type": "uint256"}],
    "name": "getCollateralAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "yusdeAmount", "type": "uint256"}],
    "name": "getBackingAmount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalBacking",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const VAULT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_usde", "type": "address"},
      {"internalType": "address", "name": "_yieldEngine", "type": "address"},
      {"internalType": "address", "name": "_yusde", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "susdeAmount", "type": "uint256"}],
    "name": "mintYUSDe",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "yusdeAmount", "type": "uint256"}],
    "name": "redeemYUSDe",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimYield",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserSUSDeBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserYUSDeBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserYield",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVaultInfo",
    "outputs": [
      {"internalType": "uint256", "name": "totalDeposits_", "type": "uint256"},
      {"internalType": "uint256", "name": "totalStaked", "type": "uint256"},
      {"internalType": "uint256", "name": "totalYUSDe", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const PERPDEX_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_yusde", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "size", "type": "uint256"},
      {"internalType": "uint256", "name": "collateral", "type": "uint256"},
      {"internalType": "bool", "name": "isLong", "type": "bool"},
      {"internalType": "string", "name": "symbol", "type": "string"}
    ],
    "name": "openPosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "symbol", "type": "string"}],
    "name": "closePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "symbol", "type": "string"}
    ],
    "name": "liquidatePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "symbol", "type": "string"}, {"internalType": "uint256", "name": "price", "type": "uint256"}],
    "name": "updatePrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getPosition",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "size", "type": "uint256"},
          {"internalType": "uint256", "name": "entryPrice", "type": "uint256"},
          {"internalType": "uint256", "name": "collateral", "type": "uint256"},
          {"internalType": "bool", "name": "isLong", "type": "bool"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct PerpDEX.Position",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "string", "name": "symbol", "type": "string"}],
    "name": "getPositionHealth",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "hasPosition",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract configuration for wagmi
export const getContractConfig = (chainId: number) => {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!addresses) {
    // Return null instead of throwing error to handle gracefully
    return null
  }

  return {
    USDe: {
      address: addresses.USDe as `0x${string}`,
      abi: USDE_ABI,
    },
    YieldEngine: {
      address: addresses.YieldEngine as `0x${string}`,
      abi: YIELD_ENGINE_ABI,
    },
    YUSDe: {
      address: addresses.YUSDe as `0x${string}`,
      abi: YUSDE_ABI,
    },
    Vault: {
      address: addresses.Vault as `0x${string}`,
      abi: VAULT_ABI,
    },
    PerpDEX: {
      address: addresses.PerpDEX as `0x${string}`,
      abi: PERPDEX_ABI,
    },
  }
}

// Check if chain is supported
export const isChainSupported = (chainId: number) => {
  return chainId in CONTRACT_ADDRESSES
}

// Get supported chain IDs
export const getSupportedChainIds = () => {
  return Object.keys(CONTRACT_ADDRESSES).map(Number)
}
