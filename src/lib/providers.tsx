'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { http } from 'wagmi';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Privy configuration
const privyConfig = {
  appearance: {
    theme: 'light' as const,
    accentColor: '#676FFF' as const,
    logo: 'https://your-logo-url.com/logo.png',
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets' as const,
    },
  },
  defaultChain: mainnet,
  supportedChains: [mainnet, sepolia],
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId="your-privy-app-id" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <SmartWalletsProvider>
          <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
        </SmartWalletsProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
