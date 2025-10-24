import { sepolia } from 'viem/chains'

export const SEPOLIA_CHAIN = {
  chain: sepolia,
  id: sepolia.id,
  hexId: `0x${sepolia.id.toString(16)}`,
  name: process.env.NEXT_PUBLIC_CHAIN_NAME_SEPOLIA || 'Ethereum Sepolia',
  rpcUrl:
    process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC ||
    sepolia.rpcUrls?.default?.http?.[0] ||
    'https://rpc.sepolia.org',
  explorerUrl:
    process.env.NEXT_PUBLIC_SEPOLIA_EXPLORER ||
    sepolia.blockExplorers?.default?.url ||
    'https://sepolia.etherscan.io',
}

export default SEPOLIA_CHAIN
