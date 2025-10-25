import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

if (!SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  throw new Error('Please set SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY in your .env file');
}

// Create clients
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

async function main() {
  console.log('🚀 Starting deployment to Sepolia Testnet...');
  console.log('Deployer address:', account.address);
  
  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log('Deployer balance:', parseEther(balance.toString()), 'ETH');
  
  if (balance < parseEther('0.01')) {
    console.log('⚠️  Warning: Low balance. You may need Sepolia ETH for gas fees.');
    console.log('Get testnet ETH from: https://sepoliafaucet.com/');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
