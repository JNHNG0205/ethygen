'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useState } from 'react';
import GaslessTransactionTest from './GaslessTransactionTest';
import BatchTransactionTest from './BatchTransactionTest';
import ChainSelector from './ChainSelector';
import WalletFunding from './WalletFunding';
import WalletCreation from './WalletCreation';
import Navbar from './Navbar';
import NexusIntegration from '@/components/NexusIntegration';
import { NexusProvider } from '@/lib/nexus-provider';

export default function Dashboard() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const chainId = useChainId();
  const [selectedWallet, setSelectedWallet] = useState<string>('');


  const handleSetActiveWallet = async (walletAddress: string) => {
    const wallet = wallets.find((w) => w.address === walletAddress);
    if (wallet) {
      await setActiveWallet(wallet);
      setSelectedWallet(walletAddress);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wallet Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your smart wallets and test gasless transactions
          </p>
        </div>

        {/* Active Wallet Info */}
        {isConnected && address && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Wallet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {address}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balance
                </label>
                <p className="text-sm text-gray-900">
                  {balance
                    ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                    : 'Loading...'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chain ID
                </label>
                <p className="text-sm text-gray-900">{chainId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Management */}
        {authenticated && wallets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Manage Wallets ({wallets.length})
            </h2>
            <div className="space-y-4">
              {wallets.map((wallet, index) => (
                <div
                  key={wallet.address}
                  className={`border rounded-lg p-4 ${
                    wallet.address === address
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            wallet.address === address
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                        ></div>
                        <span className="font-medium text-gray-900">
                          Wallet {index + 1}
                          {wallet.address === address && ' (Active)'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {wallet.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {wallet.walletClientType}
                      </p>
                    </div>
                    {wallet.address !== address && (
                      <button
                        onClick={() => handleSetActiveWallet(wallet.address)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Configuration */}
        {authenticated && (
          <div className="mt-8">
            <ChainSelector />
          </div>
        )}

        {/* Wallet Creation */}
        {authenticated && (
          <div className="mt-8">
            <WalletCreation />
          </div>
        )}

        {/* Wallet Funding */}
        {authenticated && (
          <div className="mt-8">
            <WalletFunding />
          </div>
        )}

        {/* Gasless Transaction Test */}
        {authenticated && (
          <div className="mt-8">
            <GaslessTransactionTest />
          </div>
        )}

        {/* Batch Transaction Test */}
        {authenticated && (
          <div className="mt-8">
            <BatchTransactionTest />
          </div>
        )}

        {/* Nexus Integration */}
        {authenticated && (
          <div className="mt-8">
            <NexusProvider isConnected={isConnected}>
              <NexusIntegration />
            </NexusProvider>
          </div>
        )}

        {/* Smart Wallet Features */}
        {authenticated && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Smart Wallet Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div key="account-abstraction" className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Account Abstraction
                </h3>
                <p className="text-sm text-gray-600">
                  Enjoy gasless transactions and batch operations
                </p>
              </div>
              <div key="social-recovery" className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Social Recovery
                </h3>
                <p className="text-sm text-gray-600">
                  Recover your wallet using social connections
                </p>
              </div>
              <div key="multi-chain" className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Multi-Chain Support
                </h3>
                <p className="text-sm text-gray-600">
                  Use the same wallet across different networks
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
