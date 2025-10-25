# Alchemy Setup for Sepolia Deployment

## Getting Started with Alchemy

### 1. Create Alchemy Account
1. Visit [Alchemy.com](https://www.alchemy.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create New App
1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Click "Create new app"
3. Fill in the details:
   - **Name**: Ethygen Sepolia
   - **Chain**: Ethereum
   - **Network**: Sepolia Testnet
4. Click "Create app"

### 3. Get Your API Key
1. Click on your newly created app
2. Click "View key" button
3. Copy the **HTTP** URL (it looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`)

### 4. Environment Setup

Create a `.env` file in the `hardhat/` directory:

```bash
# Sepolia Testnet Configuration (Alchemy)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
SEPOLIA_PRIVATE_KEY=your_private_key_here

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Alchemy Benefits

✅ **Reliable RPC**: 99.9% uptime guarantee  
✅ **Enhanced APIs**: Better debugging and monitoring  
✅ **Free Tier**: 300M compute units per month  
✅ **WebSocket Support**: Real-time updates  
✅ **Analytics**: Detailed usage metrics  

## Deployment Commands

Once your `.env` is set up:

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia using Alchemy
npx hardhat ignition deploy ./ignition/modules/DeployEthygen.ts --network sepolia

# Verify contracts
npx hardhat run scripts/verify-contracts.ts --network sepolia
```

## Monitoring Your Deployment

1. **Alchemy Dashboard**: Monitor API usage and performance
2. **Etherscan**: Verify contracts and view transactions
3. **Alchemy Explorer**: Enhanced transaction debugging

## Troubleshooting

### Common Issues:
- **Rate Limiting**: Alchemy free tier has limits, upgrade if needed
- **Network Issues**: Check your API key and URL format
- **Gas Issues**: Ensure you have enough Sepolia ETH

### Getting Help:
- [Alchemy Documentation](https://docs.alchemy.com/)
- [Alchemy Discord](https://discord.gg/alchemy)
- [Alchemy Support](https://help.alchemy.com/)

## Next Steps

1. Set up your `.env` file with Alchemy URL
2. Get Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Deploy your contracts
4. Monitor on Alchemy Dashboard
