import type { PrivyClientConfig } from "@privy-io/react-auth"
import SEPOLIA_CHAIN from "@/lib/chains"
import { polygonAmoy, arbitrumSepolia, optimismSepolia } from "viem/chains"

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    accentColor: "#00d4ff",
    logo: "/placeholder-logo.svg", // Optional: replace with your logo in /public
    showWalletLoginFirst: false,
  },
  loginMethods: ["email", "wallet", "google"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: "users-without-wallets",
      // noPromptOnSignature: true, // Uncomment to minimize signature prompts
    },
  },
  // Support tutorial testnets: Ethereum Sepolia, Polygon Amoy, Arbitrum Sepolia, Optimism Sepolia
  supportedChains: [SEPOLIA_CHAIN.chain, polygonAmoy, arbitrumSepolia, optimismSepolia],
}
