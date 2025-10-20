import type { PrivyClientConfig } from "@privy-io/react-auth"

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    accentColor: "#00d4ff",
    logo: "https://placeholder.svg?height=40&width=40&query=ethygen+logo",
    showWalletLoginFirst: false,
  },
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: false,
  },
  loginMethods: ["email", "wallet", "google"],
  supportedChains: [
    {
      id: 42161, // Arbitrum
      name: "Arbitrum One",
      network: "arbitrum",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://arb1.arbitrum.io/rpc"],
        },
        public: {
          http: ["https://arb1.arbitrum.io/rpc"],
        },
      },
      blockExplorers: {
        default: {
          name: "Arbiscan",
          url: "https://arbiscan.io",
        },
      },
    },
  ],
}
