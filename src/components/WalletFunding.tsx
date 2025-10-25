'use client';

import { useAccount, useBalance } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export default function WalletFunding() {
  const { authenticated } = usePrivy();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const faucetLinks = [
    {
      name: 'Alchemy Sepolia Faucet',
      url: 'https://sepoliafaucet.com/',
      amount: '0.5 SepoliaETH',
      description: 'Most reliable, gives 0.5 ETH'
    },
    {
      name: 'Chainlink Sepolia Faucet',
      url: 'https://faucets.chain.link/sepolia',
      amount: '0.1 SepoliaETH',
      description: 'Quick and easy'
    },
    {
      name: 'QuickNode Sepolia Faucet',
      url: 'https://faucet.quicknode.com/ethereum/sepolia',
      amount: '0.1 SepoliaETH',
      description: 'Alternative option'
    }
  ];

  if (!authenticated || !isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Fund Your Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to see funding options.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Fund Your Wallet
      </h2>
      
      {/* Current Balance */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Current Balance</h3>
        <p className="text-lg font-semibold text-gray-900">
          {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
        </p>
        <p className="text-sm text-gray-600">
          {balance && parseFloat(balance.formatted) === 0 
            ? 'Your wallet needs Sepolia ETH for testing transactions'
            : 'You have Sepolia ETH for testing!'
          }
        </p>
      </div>

      {/* Wallet Address */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Your Wallet Address</h3>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600 font-mono break-all flex-1">
            {address}
          </p>
          <button
            onClick={copyToClipboard}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Funding Instructions */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Get Free Sepolia ETH</h3>
        <p className="text-sm text-gray-600 mb-4">
          Use these faucets to get free Sepolia testnet ETH (no real money involved):
        </p>
        
        <div className="space-y-3">
          {faucetLinks.map((faucet, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{faucet.name}</h4>
                  <p className="text-sm text-gray-600">{faucet.description}</p>
                  <p className="text-sm text-green-600 font-medium">{faucet.amount}</p>
                </div>
                <a
                  href={faucet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Get ETH
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How to Fund Your Wallet</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Copy your wallet address using the "Copy" button above</li>
          <li>Click "Get ETH" on any faucet link</li>
          <li>Paste your wallet address in the faucet</li>
          <li>Complete any required verification (usually just clicking a button)</li>
          <li>Wait 1-2 minutes for the ETH to arrive</li>
          <li>Refresh this page to see your updated balance</li>
        </ol>
      </div>

      {/* Safety Notice */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Remember:</strong> This is Sepolia testnet ETH - it has no real value and can only be used for testing on the Sepolia network.
        </p>
      </div>
    </div>
  );
}
