'use client';

import { useCreateWallet } from '@privy-io/react-auth';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';

export default function WalletCreation() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isCreating, setIsCreating] = useState(false);
  const [createAdditional, setCreateAdditional] = useState(false);

  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      console.log('Successfully created wallet:', wallet);
      setIsCreating(false);
      // You could add a success notification here
    },
    onError: (error) => {
      console.error('Failed to create wallet:', error);
      setIsCreating(false);
      // You could add an error notification here
    }
  });

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);
      await createWallet({ createAdditional });
    } catch (error) {
      console.error('Error creating wallet:', error);
      setIsCreating(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create New Wallet
        </h2>
        <p className="text-gray-600">
          Please connect your account to create a new wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Create New Wallet
      </h2>
      
      {/* Current Wallets Count */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Current Wallets</h3>
          <p className="text-sm text-blue-800">
            You currently have <strong>{wallets.length}</strong> wallet{wallets.length !== 1 ? 's' : ''} connected.
          </p>
        </div>
      </div>

      {/* Wallet Creation Options */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={createAdditional}
              onChange={(e) => setCreateAdditional(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Create Additional Wallet
              </span>
              <p className="text-xs text-gray-600">
                Check this if you already have an embedded wallet and want to create another one
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Create Wallet Button */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleCreateWallet}
          disabled={isCreating}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating Wallet...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>Create New Wallet</span>
            </>
          )}
        </button>

        {wallets.length === 0 && (
          <p className="text-sm text-gray-600 text-center">
            This will create your first embedded wallet
          </p>
        )}
        
        {wallets.length > 0 && !createAdditional && (
          <p className="text-sm text-yellow-600 text-center">
            ⚠️ You already have a wallet. Check "Create Additional Wallet" to create another one.
          </p>
        )}
      </div>

      {/* Information Section */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">About Wallet Creation</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Each wallet is securely generated and owned by your authenticated account</li>
          <li>You can create multiple wallets for different purposes</li>
          <li>All wallets are embedded within this application ✅</li>
          <li>Wallets support gasless transactions and account abstraction</li>
          <li>Created wallets are automatically backed up and recoverable</li>
        </ul>
      </div>

      {/* Recent Wallets */}
      {wallets.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Your Wallets</h3>
          <div className="space-y-2">
            {wallets.map((wallet, index) => (
              <div key={wallet.address} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Wallet {index + 1}
                    </p>
                    <p className="text-xs text-gray-600 font-mono">
                      {wallet.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      Type: {wallet.walletClientType}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
