'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { SmartWalletsProvider } from '@privy-io/react-auth/smart-wallets';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { sepolia, mainnet, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

// Create wagmi config
const wagmiConfig = createConfig({
  chains: [sepolia, mainnet, baseSepolia],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Privy configuration - Smart Wallet Only (No EOA support)
const privyConfig = {
  appearance: {
    theme: 'light' as const,
    accentColor: '#676FFF' as const,
    logo: 'https://your-logo-url.com/logo.png',
  },
  // Force all users to get smart wallets - no EOA support
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'all-users' as const, // Force ALL users to get smart wallets
      noPromptOnSignature: true,
      noPromptOnTransaction: true,
      noPromptOnTransactionReceipt: true,
    },
  },
  // Enable smart wallets with embedded signers for auto-signing
  smartWallets: {
    ethereum: {
      createOnLogin: 'all-users' as const, // Force smart wallet creation for ALL users
      // Use embedded signers for seamless auto-signing
      signerType: 'embedded' as const,
    },
  },
  // Social and email login only - no external wallet connections
  loginMethods: [
    'email' as const, 
    'google' as const, 
    'twitter' as const, 
    'discord' as const, 
  ], // Social and email login only - smart wallets auto-created
  defaultChain: sepolia,
  supportedChains: [sepolia, mainnet, baseSepolia],
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
