// Make sure to import `createConfig` from `@privy-io/wagmi`, not `wagmi`
import { createConfig } from '@privy-io/wagmi';
import { mainnet, sepolia, baseSepolia } from 'viem/chains';
import { http } from 'wagmi';

// Replace this with your app's required chains
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, baseSepolia], // Pass your required chains as an array
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
  },
});
