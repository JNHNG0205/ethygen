# Ethygen

![Ethygen Logo](path-to-your-logo.png)

**Ethygen** is a **gasless, permissionless DeFi platform** combining **unified cross-chain collateral, yield-bearing staking, and perpetual trading**. Users can deposit assets across multiple EVM chains, stake them to earn yield, and trade perpetual positions using margin tokens — all while their collateral continues to accrue yield.

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Description](#description)
- [Features](#features)
- [System Architecture](#system-architecture)
- [User Flow](#user-flow)
- [Example Scenarios](#example-scenarios)
- [Tech Stack](#tech-stack)
- [Smart Contract Addresses](#smart-contract-addresses)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement
> ⚠️ Placeholder 

---

## Description
Ethygen maximizes DeFi capital efficiency by allowing **all deposited USDe to be staked for yield (sUSDe)** while simultaneously **backing margin tokens (yUSDe)** for perpetual trading.  

Partner technologies used:  
- **Avail Nexus**: Aggregates and bridges assets across EVM chains.  
- **Pyth Network**: Provides real-time price feeds.  
- **Envío: HyperSync & HyperIndex**: Indexes deposits, trades, and redemptions.  

---

## Features
- 100% of USDe earns yield while backing yUSDe for trading.  
- Margin token (yUSDe) minted at **0.8:1 ratio**.  
- Real-time pricing via Pyth; event indexing via Envío.  
- Gasless and permissionless UX.  
- Mock sUSDe token to simulate yield (for hackathon/demo).  

---

## System Architecture
> ⚠️ Placeholder – Diagram and detailed component interactions to be added later.

---

## User Flow
1. **Deposit Collateral:** Aggregated via Avail Nexus → converted to USDC.  
2. **Mint USDe:** All USDe staked internally as sUSDe.  
3. **Mint Margin Token (yUSDe):** 0.8:1 ratio backed by sUSDe.  
4. **Perpetual Trading:** Trades executed with yUSDe; prices from Pyth; events indexed by Envío.  
5. **Yield & Trading Interaction:** sUSDe continues accruing yield; gains/losses affect vault balances.  
6. **Withdrawals:** Users redeem sUSDe (including yield) via UI; partial withdrawal allowed.  
7. **Gasless & Permissionless UX:** All actions via Privy smart wallets.  

---

## Example Scenarios

### **Scenario 1: Winning Trade**
- User deposits **100 USDe** → staked as **100 sUSDe**.  
- Vault mints **80 yUSDe** (0.8:1 ratio) for trading.  
- User opens a trade with 80 yUSDe and closes it at a **25% profit**.  
- Profit = 20 yUSDe → upon redemption, vault updates **sUSDe to 120** (principal + trading gains).  
- **Outcome:** User’s staked yield increases; capital efficiency is maximized.

### **Scenario 2: Losing Trade**
- User deposits **100 USDe** → staked as **100 sUSDe**.  
- Vault mints **80 yUSDe** for trading.  
- User opens a trade with 80 yUSDe and closes it at a **25% loss**.  
- Loss = 20 yUSDe → vault deducts equivalent value from sUSDe → **sUSDe reduces to 80**.  
- **Outcome:** Yield on lost portion stops; remaining sUSDe continues earning yield.  

---

## Tech Stack
- **Frontend:** React / Next.js  
- **Backend / Vault Logic:** Solidity (Ethereum / EVM chains)  
- **Oracles:** Pyth Network  
- **Indexing:** Envío  
- **Cross-chain Collateral:** Avail Nexus  
- **Wallets:** Privy Smart Wallets  
- **Mock Tokens:** ERC-20 (sUSDe, USDe, yUSDe)  

---

## Smart Contract Addresses
> ⚠️ Placeholder – deployed contract addresses to be added here.  

---

## Getting Started
1. Clone the repo:  
```bash
git clone https://github.com/yourusername/ethygen.git
cd ethygen
npm install
npm run dev


