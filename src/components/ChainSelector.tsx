'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { sepolia, mainnet } from 'viem/chains';

export default function ChainSelector() {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id });
  };

  const handleSwitchToMainnet = () => {
    switchChain({ chainId: mainnet.id });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Network Configuration
      </h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Network:</p>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            chain?.id === sepolia.id ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium text-gray-900">
            {chain?.name || 'Unknown Network'}
          </span>
          <span className="text-sm text-gray-500">
            (Chain ID: {chain?.id})
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Switch Network:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSwitchToSepolia}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chain?.id === sepolia.id
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Sepolia Testnet
          </button>
          <button
            onClick={handleSwitchToMainnet}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chain?.id === mainnet.id
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            Ethereum Mainnet
          </button>
        </div>
      </div>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Important:</strong> For testing gasless transactions, use Sepolia testnet to avoid spending real ETH.
        </p>
      </div>
    </div>
  );
}
