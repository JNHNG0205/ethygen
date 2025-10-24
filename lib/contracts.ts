// Minimal contract ABIs and deployed addresses for frontend integration
import type { Abi } from "viem"

export const USDC_VAULT_ADDRESS = "0x76f3580cb3914734Edc56441Df5a175125d5Ecf6"
export const MOCK_USDE_ADDRESS = "0xdca94060C89d143a25b8da14DD1DECF35d78ddaA"
export const MOCK_SUSDE_ADDRESS = "0xA902ecec737Ee480c176e27cB4f01C6B8bb4F4d9"

// Minimal ABI for USDCVault (only the functions the UI needs)
export const USDC_VAULT_ABI: Abi = [
  {
    "inputs": [],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "susdeAmount", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "susdeAmount", "type": "uint256" }
    ],
    "name": "calculateWithdrawAmount",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ethToUsdcRate",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  }
  ,
  {
    "inputs": [ { "internalType": "uint256", "name": "usdcAmount", "type": "uint256" } ],
    "name": "depositUSDC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// Minimal ABI for mock tokens (mint/burn/balanceOf/decimals)
export const MOCK_TOKEN_ABI: Abi = [
  { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "pure", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }
]

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || ""

export default {};
