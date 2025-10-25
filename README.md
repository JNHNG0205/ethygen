# 🧬 Ethygen

**Ethygen** is a gasless, permissionless DeFi platform that unifies cross-chain collateral, enables yield-bearing staking, and supports perpetual trading — all powered by **Avail Nexus**, **Pyth**, and **Envio**.

---

## 🚩 Problem Statement

**1.⁠ ⁠Capital Inefficiency**
- ⁠Many protocols force a trade-off: stake for yield or use for trading, but rarely both.
- ⁠Assets locked in staking cannot easily be used for trading.

**2.⁠ ⁠Fragmented Liquidity & Execution Inefficiency**
- ⁠Liquidity is scattered across many chains and pools, resulting in high slippage and poor execution for traders.
- DEXs often struggle to aggregate deep, usable liquidity compared to centralized venues.

---

## 🧩 System Architecture

<img width="926" height="659" alt="image" src="https://github.com/user-attachments/assets/0c19cefe-a276-4b76-8035-dce080149af4" />

**Main Components**

| Component                                     | Role                                                              |
| --------------------------------------------- | ----------------------------------------------------------------- |
| **User**                                      | Interacts through Privy smart wallet (gasless & signatureless UX) |
| **Frontend (UI + Explorer)**                  | Displays unified balance, staking yield, and trading interface    |
| **Avail Nexus**                               | Aggregates multi-chain assets and unifies balances as USDC        |
| **Vault Contract (USDe)**                     | Holds USDe and manages staking/unstaking                          |
| **Yield Engine**                              | Stakes USDe to earn yield and mints sUSDe                         |
| **yUSDe Minting Module**                      | Issues yUSDe margin tokens at 0.8:1 ratio for trading             |
| **Perp DEX Smart Contract                     | Executes perpetual trades using yUSDe                             |
| **Pyth Oracle**                               | Provides real-time asset prices for accurate trading data         |

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

Smart contracts are deployed on **Ethereum Sepolia** testnet, and mock tokens are used for **USDe**, **sUSDe**, and **yUSDe** for simulation.

---

## 🧱 Deployed Smart Contracts
- **USDe.sol**: 0x5e034a923D3947A2fE04172EA9cB3D35EA1f2abA
- **YieldEngine.sol**: 0x5E63123AB3970e4A25a17103A8552C4555f3C4B8
- **YUSDe.sol**: 0x21c4cE8cAEE307a47E1EC35De871b02580e6E6cE
- **PerpDEX.sol**: 0x2a0fADd0e2e918A5238991AD759c5a09F9A10942
- **Vault.sol**: 0xC8298b7abC7a9298936d3Fe0CE71c2e10919C203

---

## Tech Stack
- **Frontend:** React / Next.js  
- **Backend / Vault Logic:** Solidity (Ethereum / EVM chains)  
- **Oracles:** Pyth Network  
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
