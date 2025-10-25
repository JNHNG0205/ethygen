# Nexus SDK Integration

This document describes the integration of the Nexus SDK with the existing provider structure.

## Provider Hierarchy

The application now uses the following provider hierarchy:

```
PrivyProvider (Authentication & Smart Wallets)
├── QueryClientProvider (React Query)
├── ApolloProvider (GraphQL)
├── SmartWalletsProvider (Privy Smart Wallets)
├── WagmiProvider (Web3 interactions)
├── MarketProvider (Market data)
├── NexusProvider (Nexus SDK integration)
└── PositionsProvider (Position management)
```

## Key Features

### 1. Smart Wallet Integration
- Forces all users to use smart wallets (no EOA support)
- Auto-approves allowances and intents for gasless transactions
- Uses embedded signers for seamless UX

### 2. Nexus SDK Integration
- Dynamic loading with Buffer polyfill support
- Automatic initialization when user connects
- Unified balance fetching across chains
- Error handling for development/production environments

### 3. Wagmi Configuration
- Supports Ethereum Sepolia, Mainnet, and Base Sepolia
- Uses `@privy-io/wagmi` for Privy compatibility
- HTTP transports for all supported chains

## Usage

### Using Nexus SDK in Components

```tsx
import { useNexus } from '@/providers/nexus-provider';

function MyComponent() {
  const { 
    nexusSdk, 
    isInitialized, 
    balances, 
    refreshBalances,
    isLoading,
    error 
  } = useNexus();

  if (!isInitialized) {
    return <div>Initializing Nexus SDK...</div>;
  }

  return (
    <div>
      <h3>Unified Balances</h3>
      {balances.map((balance, index) => (
        <div key={index}>
          {balance.symbol}: {balance.balance}
        </div>
      ))}
      <button onClick={refreshBalances}>Refresh Balances</button>
    </div>
  );
}
```

### Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_ENABLE_TESTNET=true  # Set to false for mainnet
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## Configuration

### Privy Configuration
- **Theme**: Light theme with custom accent color
- **Login Methods**: Email, Google, Twitter, Discord only
- **Smart Wallets**: Auto-created for all users
- **Chains**: Sepolia, Mainnet, Base Sepolia

### Nexus SDK Configuration
- **Network**: Testnet (configurable via environment)
- **Debug**: Disabled in production
- **Auto-approval**: Enabled for smart wallets

## Error Handling

The integration includes comprehensive error handling for:
- Buffer polyfill issues
- SDK initialization failures
- Network connectivity problems
- Balance fetching errors

## Development Notes

- The SDK is loaded dynamically to avoid SSR issues
- Buffer polyfill is automatically injected when needed
- Smart wallet hooks are set up automatically for gasless transactions
- Unified balances are fetched automatically after initialization
