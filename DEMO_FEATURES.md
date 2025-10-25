# Demo Features - Hardcoded Frontend

This document describes the interactive demo pages with hardcoded data that showcase the complete user flows.

## Overview

The demo is accessible at `/demo` and includes three fully functional flows with simulated data and animations:

1. **Deposit Flow** - Multi-chain aggregation → USDe conversion → yUSDe minting
2. **Trading Flow** - Position management with yUSDe collateral
3. **Withdraw Flow** - yUSDe redemption → sUSDe unstaking → withdrawal

## Features

### 🎯 Key Highlights

- **Zero Integration Required** - All data is hardcoded, no contract calls needed
- **Full Animations** - Step-by-step progress indicators with loading states
- **Interactive UI** - Adjustable inputs with real-time calculations
- **Educational** - Each step clearly explains what's happening
- **Mobile Responsive** - Works on all screen sizes

## Components Created

### 1. `DepositFlowDemo` (`components/deposit-flow-demo.tsx`)

**Features:**
- Multi-chain balance aggregation display
- Interactive deposit amount input
- 4-step process with animated progress:
  1. Bridge to Base
  2. Swap to USDe
  3. Stake in Vault (USDe → sUSDe)
  4. Mint yUSDe (0.8:1 ratio)
- Success state with balance summary

**Key Data Points:**
- Total unified balance: $2,980 across Ethereum, Arbitrum, Optimism, Base
- 80% collateralization ratio for yUSDe
- Animated step-by-step confirmation

### 2. `TradingFlowDemo` (`components/trading-flow-demo.tsx`)

**Features:**
- Market tab: Position opening interface
- Position tab: Active position management
- Dynamic PnL calculation
- Leverage selection (2x, 5x, 10x, 20x)
- Risk metrics display
- Highlights that yUSDe continues earning yield while in position

**Key Data Points:**
- ETH/USD market price: $2,450.50
- Position entry: $2,420.00 (10 ETH size)
- Unrealized PnL: +$305 (5x leverage)
- Collateral: 2 yUSDe (continues earning ~8% APY)

### 3. `WithdrawFlowDemo` (`components/withdraw-flow-demo.tsx`)

**Features:**
- Balance tab: Shows total yUSDe including trading profits
- Withdraw tab: 4-step withdrawal process
- Display of original deposit vs trading profits
- Yield earnings indicator
- Success state with final amount received

**Key Data Points:**
- Original yUSDe: 1000
- Trading profit: +50 yUSDe
- Total withdrawable: 1050 yUSDe
- Final USDC received: $1,250 (includes yield + profits)

### 4. `DemoPage` (`app/demo/page.tsx`)

**Layout:**
- Tabbed interface for easy navigation between flows
- Feature highlights section at the bottom
- Consistent design with main app

## User Flows Demonstrated

### Deposit Flow

```
Multi-Chain Assets (ETH, USDC across chains)
    ↓
Unified Balance Aggregation (Nexus)
    ↓
Bridge to Base
    ↓
Swap to USDe
    ↓
Stake USDe in Yield Engine → sUSDe
    ↓
Mint yUSDe at 0.8:1 ratio
    ↓
Ready to Trade (earning 8% APY)
```

### Trading Flow

```
Deposit yUSDe as Margin
    ↓
Open Perpetual Position (Base Sepolia)
    ↓
Pyth Oracle Prices
    ↓
Gains/Losses Tracked in yUSDe Balance
    ↓
Unused yUSDe Still Earning Yield
```

### Withdraw Flow

```
Total yUSDe Balance (includes profits)
    ↓
Redeem yUSDe → sUSDe
    ↓
Unstake sUSDe → USDe
    ↓
Swap USDe → USDC
    ↓
Bridge to Wallet Chain
    ↓
Yield + Profits Delivered
```

## Design Principles

1. **Visual Clarity** - Each step clearly labeled with visual indicators
2. **Progress Feedback** - Loading states and completion checkmarks
3. **Educational** - Explanations for each conversion step
4. **Color Coding** - 
   - Cyan: USDe/yUSDe operations
   - Purple: Yield/APY indicators
   - Green: Profits/receipts
   - Red: Losses/warnings

## Technical Notes

- All calculations are done client-side with hardcoded values
- No external API calls or contract interactions
- Uses existing UI components from `@/components/ui`
- Fully responsive with Tailwind CSS
- Uses Framer Motion for animations (imported where needed)

## Future Enhancements

When ready to integrate real data:
1. Replace hardcoded values with hooks from `@/hooks`
2. Add real-time balance fetching
3. Implement actual contract interactions
4. Add error handling for failed transactions
5. Connect to live price feeds

## Running the Demo

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/demo`
3. Click through each tab to explore the flows
4. Interact with inputs and buttons to see the animations

## Files Created

```
components/
├── deposit-flow-demo.tsx    # Deposit flow component
├── trading-flow-demo.tsx    # Trading flow component
└── withdraw-flow-demo.tsx   # Withdraw flow component

app/
└── demo/
    └── page.tsx             # Demo page wrapper

Updated:
├── components/top-nav.tsx   # Added demo link to navigation
```
