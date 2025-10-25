# Smart Contract System

This document describes the complete smart contract system that implements the user flow for cross-chain perpetual trading with yield generation.

## Contract Architecture

### Core Contracts

1. **YieldEngine.sol** - Manages USDe staking and sUSDe rewards
2. **YUSDe.sol** - Margin token backed by sUSDe at 0.8:1 ratio
3. **Vault.sol** - Main vault managing deposits and yUSDe minting
4. **PerpDEX.sol** - Perpetual DEX for margin trading
5. **USDe.sol** - USDe token implementation

### Contract Relationships

```
User → Vault → YieldEngine → sUSDe
                ↓
              YUSDe (0.8:1 ratio)
                ↓
            PerpDEX (Margin Trading)
```

## User Flow Implementation

### 1. Deposit Flow

```solidity
// User deposits USDe into vault
vault.deposit(usdeAmount);

// Vault stakes USDe in yield engine
yieldEngine.stake(usdeAmount);

// User receives sUSDe tokens
```

### 2. Margin Token Creation

```solidity
// User mints yUSDe using sUSDe as collateral
vault.mintYUSDe(susdeAmount);

// YUSDe minted at 0.8:1 ratio
uint256 yusdeAmount = (susdeAmount * 8000) / 10000;
```

### 3. Trading Flow

```solidity
// User opens position with yUSDe as collateral
perpDex.openPosition(size, collateral, isLong, symbol);

// Position is backed by yUSDe collateral
// Gains/losses affect yUSDe balance
```

### 4. Withdraw Flow

```solidity
// User closes position
perpDex.closePosition(symbol);

// User redeems yUSDe to sUSDe
vault.redeemYUSDe(yusdeAmount);

// User unstakes sUSDe to get USDe + yield
yieldEngine.unstake(susdeAmount);
```

## Key Features

### Yield Generation
- **APY**: 5% annual yield on staked USDe
- **Automatic**: Yield accrues continuously
- **Compound**: Users can claim yield without unstaking

### Margin Trading
- **Leverage**: Up to 10x leverage
- **Collateral**: yUSDe tokens as margin
- **Liquidation**: 80% threshold for safety
- **PnL**: Real-time profit/loss calculation

### Cross-Chain Integration
- **Unified Balances**: Aggregated across EVM chains
- **Bridge Support**: USDC → Base USDe conversion
- **Yield Continuity**: Earns yield even when used as collateral

## Contract Functions

### YieldEngine
- `stake(uint256 amount)` - Stake USDe for sUSDe
- `unstake(uint256 amount)` - Unstake sUSDe for USDe + yield
- `claimYield()` - Claim accumulated yield
- `calculateYield(address user, uint256 amount)` - Calculate user yield

### YUSDe
- `mint(uint256 susdeAmount)` - Mint yUSDe using sUSDe collateral
- `burn(uint256 yusdeAmount)` - Burn yUSDe to receive sUSDe
- `getCollateralAmount(uint256 susdeAmount)` - Get yUSDe amount for sUSDe
- `getBackingAmount(uint256 yusdeAmount)` - Get sUSDe amount for yUSDe

### Vault
- `deposit(uint256 amount)` - Deposit USDe into vault
- `withdraw(uint256 amount)` - Withdraw USDe from vault
- `mintYUSDe(uint256 susdeAmount)` - Mint yUSDe tokens
- `redeemYUSDe(uint256 yusdeAmount)` - Redeem yUSDe for sUSDe

### PerpDEX
- `openPosition(uint256 size, uint256 collateral, bool isLong, string symbol)` - Open position
- `closePosition(string symbol)` - Close position
- `liquidatePosition(address user, string symbol)` - Liquidate position
- `updatePrice(string symbol, uint256 price)` - Update price feed

## Testing

Run the comprehensive test suite:

```bash
npx hardhat test test/UserFlow.test.ts
```

The test suite covers:
- Complete deposit flow
- Margin token creation
- Trading operations
- Withdraw process
- Yield generation
- Position management

## Deployment

Deploy the complete system:

```bash
npx hardhat ignition deploy ignition/modules/DeploySystem.ts --network sepolia
```

## Integration with Frontend

The contracts integrate with:
- **Privy**: Smart wallet authentication
- **Nexus SDK**: Cross-chain balance aggregation
- **Pyth**: Price feed integration
- **Base**: Layer 2 deployment

## Security Features

- **Reentrancy Protection**: All external calls protected
- **Access Control**: Owner-only functions properly secured
- **Liquidation Safety**: 80% threshold prevents total loss
- **Yield Validation**: Mathematical accuracy verified
- **Emergency Functions**: Owner can withdraw in emergencies

## Gas Optimization

- **Batch Operations**: Multiple operations in single transaction
- **Storage Optimization**: Minimal state variables
- **Event Logging**: Efficient event emission
- **Function Optimization**: Gas-efficient calculations

This system provides a complete solution for cross-chain perpetual trading with integrated yield generation, following the specified user flow exactly.
