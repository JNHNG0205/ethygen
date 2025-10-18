# 🧬 Ethygen

**Ethygen** is a gasless, permissionless DeFi platform that unifies cross-chain collateral, enables yield-bearing staking, and supports perpetual trading — all powered by **Avail Nexus**, **Pyth**, and **Envio**.

---

## 🚩 Problem Statement

> *[Placeholder]*
>
> Add description of the problem Ethygen aims to solve — such as fragmentation of liquidity, idle collateral inefficiency, and complex cross-chain user experience.

---

## 🧩 System Architecture

> *[Placeholder for system architecture diagram]*

**Main Components**

| Component                                     | Role                                                              |
| --------------------------------------------- | ----------------------------------------------------------------- |
| **User**                                      | Interacts through Privy smart wallet (gasless & signatureless UX) |
| **Frontend (UI + Explorer)**                  | Displays unified balance, staking yield, and trading interface    |
| **Avail Nexus**                               | Aggregates multi-chain assets and unifies balances as USDC        |
| **Vault Contract (USDe)**                     | Holds USDe and manages staking/unstaking                          |
| **Yield Engine**                              | Stakes USDe to earn yield and mints sUSDe                         |
| **yUSDe Minting Module**                      | Issues yUSDe margin tokens at 0.8:1 ratio for trading             |
| **Perp DEX Smart Contract (on Base Sepolia)** | Executes perpetual trades using yUSDe                             |
| **Pyth Oracle**                               | Provides real-time asset prices for accurate trading data         |
| **Envio**                                     | Indexes on-chain events and provides analytics data for frontend  |

---

## 🔄 User Flow

### **Deposit Flow**

1. **User deposits assets** (ETH, USDC, etc.) into their **Privy Smart Wallet**.
2. **Avail Nexus** aggregates all balances from multiple EVM chains and displays them as a **unified USDC balance**.
3. The user **bridges USDC → Base chain** and swaps USDC → **USDe**, stored inside the **Vault Contract**.
4. The **Vault** stakes USDe through the **Yield Engine**, minting **sUSDe** to represent staked positions.
5. The user can then **swap sUSDe → yUSDe** (margin token) at a **0.8:1 ratio**, which is used for **perpetual trading**.

---

### **Withdraw Flow**

1. When the **user closes a trade**, they receive **yUSDe** (with profits or losses reflected in its value).
2. The user can **redeem yUSDe → sUSDe** through the vault.
3. The vault **unstakes sUSDe → USDe**, returning the user’s yield-adjusted balance.
4. The user **swaps USDe → Base USDC**, completing the withdrawal process.

---

## 🧠 Example Scenarios

### **Winning Trade**

* User opens a long position with 80 yUSDe margin.
* The market moves favorably → profit added to vault’s balance.
* User closes trade and receives more yUSDe (reflecting gains).
* They redeem yUSDe → sUSDe → USDe → Base USDC.

### **Losing Trade**

* User’s position moves against them → margin loss occurs.
* The corresponding portion of **sUSDe** in the vault is burned to cover the loss.
* User receives reduced yUSDe upon trade closure → redeems to smaller USDe amount.

---

## 🔧 How It’s Made

Ethygen is built using:

* **Avail Nexus** → For unified cross-chain collateral aggregation.
* **Pyth** → For real-time, decentralized price feeds in perpetual trading.
* **Envio** → For indexing and querying trading data efficiently.

Smart contracts are deployed on **Base Sepolia** testnet, and mock tokens are used for **USDe**, **sUSDe**, and **yUSDe** for simulation.

---

## 🧱 Deployed Smart Contracts

### Local Development (Hardhat Network)
- **USDe Token**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **sUSDe Token**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **yUSDe Token**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **Vault Contract**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **YieldEngine**: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`
- **PerpDEX**: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`

### Production (Base Sepolia)
> *[To be deployed]*

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

## Getting Started
### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Testnet wallets funded with test ETH/USDC/USDT/etc.
- RPC endpoints for all target testnets

### Clone & Install 
```bash
git clone https://github.com/yourusername/ethygen.git
cd ethygen
npm install
npm run dev
