'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { sepolia, mainnet } from 'viem/chains';
import { http } from 'wagmi';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
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
      noPromptOnSignature: true,
      noPromptOnTransaction: true,
      noPromptOnTransactionReceipt: true,
    },
  },
  // Enable smart wallets with embedded signers for auto-signing
  smartWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets' as const,
      // Use embedded signers for seamless auto-signing
      signerType: 'embedded' as const,
    },
  },
  defaultChain: sepolia,
  supportedChains: [sepolia, mainnet],
};

export default function Providers({ children }: { children: ReactNode }) {
  
  return (
    <PrivyProvider appId="cmgn8elln0043jv0dahs16sm1" config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <SmartWalletsProvider>
          <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
        </SmartWalletsProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
