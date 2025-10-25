# Sepolia Testnet Deployment Guide

This guide will help you deploy and verify your Ethygen smart contracts on Sepolia Testnet.

## Prerequisites

1. **Node.js and npm/pnpm** installed
2. **Sepolia ETH** for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))
3. **Infura/Alchemy account** for RPC access
4. **Etherscan account** for contract verification

## Setup

### 1. Environment Variables

Create a `.env` file in the `hardhat/` directory:

```bash
# Sepolia Testnet Configuration (Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. Get Testnet ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get testnet ETH for gas fees.

### 3. Install Dependencies

```bash
cd hardhat
npm install
```

## Deployment

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Deploy to Sepolia

```bash
npx hardhat ignition deploy ./ignition/modules/DeployEthygen.ts --network sepolia
```

This will deploy all contracts in the correct order:
1. USDe
2. YieldEngine
3. YUSDe
4. Vault
5. PerpDEX

### 3. Save Deployment Addresses

After deployment, save the contract addresses for verification and testing.

## Verification

### 1. Verify All Contracts

```bash
npx hardhat run scripts/verify-contracts.ts --network sepolia
```

### 2. Manual Verification (if needed)

You can also verify contracts individually:

```bash
# Verify USDe
npx hardhat verify --network sepolia CONTRACT_ADDRESS "Mock USDe" "mUSDe" 18

# Verify YieldEngine
npx hardhat verify --network sepolia CONTRACT_ADDRESS MOCKUSDE_ADDRESS

# Verify YUSDe
npx hardhat verify --network sepolia CONTRACT_ADDRESS YIELDENGINE_ADDRESS

# Verify Vault
npx hardhat verify --network sepolia CONTRACT_ADDRESS MOCKUSDE_ADDRESS YIELDENGINE_ADDRESS YUSDE_ADDRESS

# Verify PerpDEX
npx hardhat verify --network sepolia CONTRACT_ADDRESS YUSDE_ADDRESS
```

## Testing Deployment

### 1. Test Contract Interactions

```bash
npx hardhat run scripts/deploy-sepolia.ts --network sepolia
```

### 2. Check on Etherscan

Visit [Sepolia Etherscan](https://sepolia.etherscan.io/) and search for your contract addresses to verify they're deployed and verified.

## Contract Addresses

After deployment, you'll get addresses like:
- USDe: `0x...`
- YieldEngine: `0x...`
- YUSDe: `0x...`
- Vault: `0x...`
- PerpDEX: `0x...`

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Make sure you have enough Sepolia ETH
2. **RPC Issues**: Check your RPC URL and API key
3. **Verification Fails**: Ensure constructor arguments are correct
4. **Network Issues**: Try different RPC providers

### Gas Optimization

The contracts are configured with:
- Solidity version: 0.8.28
- Optimizer enabled: 200 runs
- Gas price: auto
- Gas limit: auto

## Next Steps

After successful deployment:
1. Test all contract functions
2. Update frontend with new contract addresses
3. Test the full user flow
4. Monitor contract interactions on Etherscan

## Support

If you encounter issues:
1. Check the Hardhat documentation
2. Verify your environment variables
3. Ensure you have sufficient testnet ETH
4. Check network connectivity
