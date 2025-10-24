"use client"
import type { Abi } from "viem"
import SEPOLIA_CHAIN from "@/lib/chains"

// Minimal Pyth EVM ABI for pull method
export const PYTH_ABI = [
  {
    type: "function",
    name: "getUpdateFee",
    stateMutability: "view",
    inputs: [{ name: "updateData", type: "bytes[]" }],
    outputs: [{ name: "fee", type: "uint256" }],
  },
  {
    type: "function",
    name: "updatePriceFeeds",
    stateMutability: "payable",
    inputs: [{ name: "updateData", type: "bytes[]" }],
    outputs: [],
  },
  // Read helpers (on-chain consumption)
  {
    type: "function",
    name: "getPriceNoOlderThan",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "age", type: "uint256" },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getEmaPriceNoOlderThan",
    stateMutability: "view",
    inputs: [
      { name: "id", type: "bytes32" },
      { name: "age", type: "uint256" },
    ],
    outputs: [
      {
        name: "price",
        type: "tuple",
        components: [
          { name: "price", type: "int64" },
          { name: "conf", type: "uint64" },
          { name: "expo", type: "int32" },
          { name: "publishTime", type: "uint64" },
        ],
      },
    ],
  },
] as const satisfies Abi

export const PYTH_CONTRACTS: Record<number, `0x${string}` | undefined> = {
  // TODO: Fill with the official Pyth contract for your target chains
  // Ethereum Sepolia (11155111): set via env for safety to avoid hardcoding a wrong address
  [SEPOLIA_CHAIN.id]: (process.env.NEXT_PUBLIC_PYTH_SEPOLIA as `0x${string}`) || undefined,
}

export function getPythAddress(chainId: number): `0x${string}` {
  const addr = PYTH_CONTRACTS[chainId]
  if (!addr) throw new Error(`Pyth contract address not configured for chain ${chainId}. Set NEXT_PUBLIC_PYTH_SEPOLIA`)
  return addr
}
