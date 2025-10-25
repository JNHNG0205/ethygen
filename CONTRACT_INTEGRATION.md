# Smart Contract Integration Guide

This document outlines the complete integration of the Ethygen smart contracts with the frontend application.

## Overview

The integration provides a complete DeFi experience combining:
- **USDe**: Base stablecoin token
- **YieldEngine**: Staking mechanism that generates sUSDe tokens with 5% APY
- **YUSDe**: Margin token for leveraged trading (80% collateralization)
- **Vault**: Main user interface for deposits and yUSDe operations
- **PerpDEX**: Perpetual trading exchange with up to 10x leverage

## Contract Addresses (Sepolia Testnet)

```
USDe: 0x505b618871422B0781306bE8D645d2A66b8b4726
YieldEngine: 0x96E4A641933fA09644e8E6d9BeeFC0Ee448FB3c9
YUSDe: 0xBa1f5da6B122Fa2123a3d03c3143c094bAF52248
Vault: 0x2e7088111b34A44C9158fb685e4D865F5bFD5Da3
PerpDEX: 0x4eCE92e9414d3B1D76c689c9f6Bd2a6b73BF9076
```

## Integration Components

### 1. Contract Configuration (`lib/contracts.ts`)
- Contract addresses for different networks
- Simplified ABIs for frontend interaction
- Contract configuration helper functions

### 2. Contract Hooks
- `useUSDe`: USDe token operations (approve, transfer)
- `useYieldEngine`: Staking operations (stake, unstake, claim yield)
- `useYUSDe`: Margin token operations (mint, burn)
- `useVault`: Vault operations (deposit, withdraw, mint/redeem yUSDe)
- `usePerpDEX`: Trading operations (open/close positions)

### 3. Contract Provider (`providers/contracts-provider.tsx`)
- Centralized contract state management
- Combined loading and error states
- Individual contract access hooks

### 4. UI Components
- `ContractBalances`: Display all token balances
- `VaultOperations`: Deposit/withdraw and yUSDe operations
- `PerpDEXTrading`: Open/close leveraged positions

## User Flow

### 1. Deposit & Stake
1. User deposits USDe into Vault
2. Vault automatically stakes USDe in YieldEngine
3. User receives sUSDe tokens (1:1 ratio + yield)

### 2. Create Margin Token
1. User mints yUSDe using sUSDe as collateral
2. 80% collateralization ratio (0.8 yUSDe per 1 sUSDe)
3. User can now use yUSDe for leveraged trading

### 3. Trade with Leverage
1. User opens position with yUSDe as collateral
2. Up to 10x leverage supported
3. 80% liquidation threshold
4. Positions can be closed or liquidated

### 4. Yield Generation
- Users earn 5% APY on staked USDe
- Yield can be claimed without unstaking
- Yield compounds automatically on additional stakes

## Key Features

### Token Economics
- **USDe**: Base stablecoin (1:1 with USD)
- **sUSDe**: Yield-bearing token (1:1 with USDe + yield)
- **yUSDe**: Leveraged margin token (0.8:1 with sUSDe)

### Risk Management
- 80% collateralization ratio for yUSDe
- 80% liquidation threshold for positions
- Maximum 10x leverage
- Automatic liquidation when health drops below threshold

### Yield Generation
- 5% APY on staked USDe
- Time-based yield calculation
- Claimable without unstaking
- Automatic compounding

## Usage Examples

### Basic Deposit
```typescript
const { vault, usde } = useContracts()

// Approve USDe for vault
await usde.approveForVault(parseEther("100"))

// Deposit USDe
await vault.deposit(parseEther("100"))
```

### Mint yUSDe
```typescript
const { vault } = useContracts()

// Mint yUSDe using sUSDe as collateral
await vault.mintYUSDe(parseEther("100"))
```

### Open Trading Position
```typescript
const { perpdex } = useContracts()

// Open long position
await perpdex.openPosition(
  parseEther("1000"), // position size
  parseEther("100"),  // collateral
  true,               // isLong
  "ETH/USD"          // symbol
)
```

## Error Handling

All contract interactions include comprehensive error handling:
- Transaction failures
- Insufficient balances
- Network errors
- User rejections

## Testing

The integration has been tested with:
- Contract deployment on Sepolia testnet
- All contract interactions
- Error scenarios
- UI responsiveness

## Next Steps

1. **Price Feed Integration**: Connect with Pyth price feeds
2. **Advanced Trading**: Add more trading pairs
3. **Analytics**: Add position tracking and analytics
4. **Mobile Optimization**: Enhance mobile experience
5. **Gas Optimization**: Implement gasless transactions

## Security Considerations

- All contract interactions use proper error handling
- User funds are protected by smart contract logic
- Liquidation mechanisms prevent bad debt
- Yield calculations are time-based and secure

## Support

For issues or questions regarding the contract integration:
1. Check the contract addresses are correct
2. Ensure you're on the correct network (Sepolia)
3. Verify wallet connection
4. Check transaction logs for detailed error messages
