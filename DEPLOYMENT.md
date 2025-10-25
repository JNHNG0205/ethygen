# DEPLOYMENT INSTRUCTIONS FOR BASE SEPOLIA

## Prerequisites
1. You need ETH on Base Sepolia testnet for gas fees
2. Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia

## Setup

### 1. Create .env file
Copy `.env.example` to `.env` and fill in your details:

```bash
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key (optional, for verification)
```

### 2. Get BaseScan API Key (Optional)
- Visit: https://basescan.org/apis
- Sign up and create an API key
- This is used for contract verification

### 3. Deploy Contracts

Run the deployment script:
```bash
npm run deploy:base-sepolia
```

## Contracts Being Deployed

1. **MockUSDe** - Mock Ethena USDe token
2. **MockSUSDe** - Mock Staked USDe token
3. **USDCVault** - Main vault contract (uses Base Sepolia USDC at 0x036CbD53842c5426634e7929541eC2318f3dCF7e)

## After Deployment

The script will:
- Deploy all contracts
- Automatically verify them on BaseScan
- Print all deployed contract addresses

Save the contract addresses for your frontend integration!

## Network Details
- Network: Base Sepolia
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
