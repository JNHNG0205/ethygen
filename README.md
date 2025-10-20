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
2. **Avail Nexus** aggregates balances across EVM chains and displays them as a **unified USDC balance**.  
3. The user **bridges USDC → Base** and swaps to **USDe**, stored in the **Vault Contract**.  
4. The **Vault** stakes the USDe in the **Yield Engine**, receiving **sUSDe**.  
5. The user can then **mint yUSDe (margin token)** at a **0.8:1 ratio**, which is **backed by sUSDe**.  
6. **Even if unused in trading**, yUSDe continues to **earn yield** because its underlying sUSDe remains staked in the vault.  

---

### **Trading Flow**

1. The **Perp DEX** uses **yUSDe** as collateral for margin trading.  
2. Trades are executed on **Base Sepolia**, powered by **Pyth price feeds**.  
3. Gains or losses are reflected in the **yUSDe balance**, not affecting the underlying yield stream of untraded funds.

---

### **Withdraw Flow**

1. When users close trades, their **yUSDe balance (profit/loss adjusted)** is updated.  
2. They can **redeem yUSDe → sUSDe** through the vault.  
3. The vault **unstakes sUSDe → USDe**, returning yield-adjusted value.  
4. Finally, the user **swaps USDe → Base USDC** for withdrawal.

---

## 🧠 Example Scenarios

### **Scenario 1: Idle Funds (No Trading)**

* User mints **100 yUSDe** but does not open any trades.  
* yUSDe remains backed by 125 sUSDe (at 0.8:1 mint ratio).  
* Yield continues accruing via the **sUSDe staking position**.  
* Over time, user’s vault balance increases without any active trading.

---

### **Scenario 2: Winning Trade**

* User opens a 10x long position using 80 yUSDe.  
* Market moves favorably → profit reflected in user’s yUSDe balance.  
* Upon closing the trade, user redeems yUSDe → sUSDe → USDe, receiving both profit + accrued yield.

---

### **Scenario 3: Losing Trade**

* User’s trade moves against them → margin loss occurs.  
* The corresponding amount of sUSDe is **burned** to cover losses.  
* Remaining sUSDe continues to earn yield for the user.  

---

## 🔧 How It’s Made

Ethygen is built using:

* **Avail Nexus** → For unified cross-chain collateral aggregation.
* **Pyth** → For real-time, decentralized price feeds in perpetual trading.
* **Envio** → For indexing and querying trading data efficiently.

Smart contracts are deployed on **Base Sepolia** testnet, and mock tokens are used for **USDe**, **sUSDe**, and **yUSDe** for simulation.

---

## 🧱 Deployed Smart Contracts

> *[Placeholder — Add deployed contract addresses once live]*

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
