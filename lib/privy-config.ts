import type { PrivyClientConfig } from "@privy-io/react-auth"
import SEPOLIA_CHAIN from "@/lib/chains"
import { polygonAmoy, arbitrumSepolia, optimismSepolia } from "viem/chains"

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    accentColor: "#00d4ff",
    logo: "/placeholder-logo.svg",
    showWalletLoginFirst: false,
  },
  loginMethods: ["email", "wallet", "google"],

  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
      // 👇 Force the embedded wallet to use Sepolia (chainId 11155111)
      defaultChain: {
        id: SEPOLIA_CHAIN.id,
        rpcUrl: SEPOLIA_CHAIN.rpcUrl,
        name: SEPOLIA_CHAIN.name,
        explorerUrl: SEPOLIA_CHAIN.explorerUrl,
      },
    },
  },

  // 👇 Default and supported chains for your dApp
  defaultChain: SEPOLIA_CHAIN.chain,
  supportedChains: [SEPOLIA_CHAIN.chain, polygonAmoy, arbitrumSepolia, optimismSepolia],
}
