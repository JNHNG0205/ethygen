# Ethygen

**Ethygen** is a **gasless, permissionless DeFi platform** that combines **unified cross-chain collateral, yield-bearing staking, and perpetual trading**. Users can deposit assets across multiple EVM chains, stake them to earn yield, and trade perpetual positions using margin tokens — all while their collateral continues to accrue yield.  

---

## Table of Contents
1. [Description](#description)  
2. [Features](#features)  
3. [System Architecture](#system-architecture)  
4. [User Flow](#user-flow)  
5. [Tech Stack](#tech-stack)  
6. [Smart Contract Addresses](#smart-contract-addresses)  
7. [Getting Started](#getting-started)  
8. [Contributing](#contributing)  

---

## Description
Ethygen is designed to maximize capital efficiency in DeFi by allowing **all deposited USDe to be staked for yield (sUSDe)** while simultaneously **backing margin tokens (yUSDe)** for perpetual trading. The platform leverages:  

- **Avail Nexus**: Aggregates and bridges assets across multiple EVM chains.  
- **Pyth Network**: Provides real-time price feeds for trading.  
- **Envío**: Indexes deposits, trades, and redemptions for analytics and dashboards.  
- **Privy Smart Wallets**: Gasless, signatureless interactions for users.  

---

## Features
- 100% of USDe earns yield while backing yUSDe trading.  
- Margin token (yUSDe) minted at **0.8:1 ratio**.  
- Real-time pricing and event indexing.  
- Gasless and permissionless UX.  
- Simulated yield using **mock sUSDe** for hackathon/demo.  

---

## System Architecture
> ⚠️ Placeholder – Diagram and detailed component interactions to be added later.  

---

## User Flow
1. **Deposit Collateral** → Aggregated via Avail Nexus → converted to USDC.  
2. **Mint USDe** → All USDe staked internally as sUSDe.  
3. **Mint Margin Token (yUSDe)** → 0.8:1 ratio backed by sUSDe.  
4. **Perpetual Trading** → Trades executed with yUSDe, prices from Pyth, events indexed by Envío.  
5. **Yield & Trading Interaction** → sUSDe continues accruing yield; gains/losses affect vault balances.  
6. **Withdrawals** → Users redeem sUSDe (including yield) via UI; partial withdrawal allowed.  
7. **Gasless & Permissionless UX** → All actions via Privy smart wallets.  

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


