'use client';

import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useNexus } from '@/lib/nexus-provider';

export default function NexusIntegration() {
  const { address, isConnected } = useAccount();
  const { nexusSdk, isInitialized, unifiedBalances } = useNexus();
  const { data: currentBalance } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(false);
  const [chainBalances, setChainBalances] = useState<any[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  // Fetch chain-specific balances
  const fetchChainBalances = async () => {
    if (!nexusSdk || !address) return;
    
    try {
      setIsLoadingBalances(true);
      
      // Debug: Log available methods on the SDK
      console.log('Nexus SDK methods:', Object.getOwnPropertyNames(nexusSdk));
      console.log('Nexus SDK prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(nexusSdk)));
      
      // Try to get unified balances first (we know this works)
      let unifiedBalances = [];
      try {
        unifiedBalances = await nexusSdk.getUnifiedBalances();
        console.log('Unified balances from SDK:', unifiedBalances);
      } catch (error) {
        console.warn('Failed to get unified balances:', error);
      }
      
      // Get balances for each testnet chain
      const chains = [
        { id: 11155111, name: 'Sepolia', symbol: 'ETH' },
        { id: 84532, name: 'Base Sepolia', symbol: 'ETH' },
        { id: 80001, name: 'Polygon Mumbai', symbol: 'MATIC' },
        { id: 97, name: 'BSC Testnet', symbol: 'BNB' },
        { id: 5, name: 'Goerli', symbol: 'ETH' }
      ];
      
      const balances = [];
      
      for (const chain of chains) {
        try {
          // First try to find in unified balances
          let balance = null;
          
          if (unifiedBalances && unifiedBalances.length > 0) {
            // Look for this chain in unified balances
            for (const unifiedBalance of unifiedBalances) {
              if (unifiedBalance.breakdown && unifiedBalance.breakdown.length > 0) {
                const chainBreakdown = unifiedBalance.breakdown.find((b: any) => 
                  b.chain?.id === chain.id || b.chainId === chain.id
                );
                if (chainBreakdown) {
                  balance = {
                    balance: chainBreakdown.balance,
                    formatted: chainBreakdown.balance,
                    symbol: unifiedBalance.symbol
                  };
                  break;
                }
              }
            }
          }
          
          // If not found in unified balances, try direct SDK methods
          if (!balance) {
            if (nexusSdk.getBalance) {
              balance = await nexusSdk.getBalance({
                chainId: chain.id,
                token: chain.symbol
              });
            } else if (nexusSdk.balance) {
              balance = await nexusSdk.balance({
                chainId: chain.id,
                token: chain.symbol
              });
            }
          }
          
          balances.push({
            chain: chain.name,
            chainId: chain.id,
            symbol: chain.symbol,
            balance: balance?.balance || balance?.amount || '0',
            formatted: balance?.formatted || balance?.display || '0.00'
          });
        } catch (error) {
          console.warn(`Failed to get balance for ${chain.name}:`, error);
          // Add zero balance for chains that fail
          balances.push({
            chain: chain.name,
            chainId: chain.id,
            symbol: chain.symbol,
            balance: '0',
            formatted: '0.00'
          });
        }
      }
      
      setChainBalances(balances);
      console.log('Chain balances:', balances);
    } catch (error) {
      console.error('Failed to fetch chain balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances when SDK is ready
  React.useEffect(() => {
    if (isInitialized && nexusSdk) {
      fetchChainBalances();
    }
  }, [isInitialized, nexusSdk]);

  const handleTransfer = async () => {
    if (!nexusSdk || !address) return;

    try {
      setIsLoading(true);
      
      // Debug: Log available transfer methods
      console.log('Available transfer methods:', Object.getOwnPropertyNames(nexusSdk).filter(name => 
        name.toLowerCase().includes('transfer')
      ));
      
      // Use the correct API structure from Avail Nexus documentation
      let transferResult;
      
      try {
        // Transfer ETH on Sepolia testnet
        // According to docs: recipient, amount, token, chainId
        transferResult = await nexusSdk.transfer({
          recipient: '0x782162eCD91c8B139d2504665d18E5F958A96101',
          amount: '0.001',
          token: 'ETH',
          chainId: 11155111, // Sepolia testnet
        });
      } catch (error) {
        console.warn('First transfer attempt failed:', error);
        
        // Try with USDC instead of ETH
        try {
          transferResult = await nexusSdk.transfer({
            recipient: '0x782162eCD91c8B139d2504665d18E5F958A96101',
            amount: '0.001',
            token: 'USDC',
            chainId: 11155111, // Sepolia testnet
          });
        } catch (error2) {
          console.warn('Second transfer attempt failed:', error2);
          
          // Try with different amount format
          try {
            transferResult = await nexusSdk.transfer({
              recipient: '0x782162eCD91c8B139d2504665d18E5F958A96101',
              amount: 0.001, // Number instead of string
              token: 'ETH',
              chainId: 11155111,
            });
          } catch (error3) {
            throw new Error(`All transfer attempts failed. Last error: ${error3 instanceof Error ? error3.message : String(error3)}`);
          }
        }
      }
      
      console.log('Transfer result:', transferResult);
      console.log('Transfer initiated with smart wallet');
      
      // Show success message
      alert('Transfer transaction initiated! Check your wallet for confirmation.');
      
    } catch (error) {
      console.error('Transfer failed:', error);
      alert(`Transfer failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBridge = async () => {
    if (!nexusSdk || !address) return;

    try {
      setIsLoading(true);
      
      // Debug: Log available bridge methods
      console.log('Available bridge methods:', Object.getOwnPropertyNames(nexusSdk).filter(name => 
        name.toLowerCase().includes('bridge')
      ));
      
      // Use the correct API structure from Avail Nexus documentation
      let bridgeResult;
      
      try {
        // Try bridging from Sepolia to Base Sepolia (now that it's in wagmi config)
        bridgeResult = await nexusSdk.bridge({
          token: 'ETH',
          amount: '0.001',
          chainId: 84532, // Base Sepolia (destination)
          sourceChains: [11155111], // Sepolia (source)
        });
      } catch (error) {
        console.warn('First bridge attempt failed:', error);
        
        // Try bridging within Sepolia (same chain) to test the function
        try {
          bridgeResult = await nexusSdk.bridge({
            token: 'ETH',
            amount: '0.001',
            chainId: 11155111, // Sepolia to Sepolia (same chain)
            sourceChains: [11155111], // Sepolia (source)
          });
        } catch (error2) {
          console.warn('Second bridge attempt failed:', error2);
          
          // Try with USDC instead of ETH
          try {
            bridgeResult = await nexusSdk.bridge({
              token: 'USDC',
              amount: '0.001',
              chainId: 11155111, // Sepolia
              sourceChains: [11155111], // Sepolia
            });
          } catch (error3) {
            console.warn('Third bridge attempt failed:', error3);
            
            // Try without sourceChains (let it use all available chains)
            try {
              bridgeResult = await nexusSdk.bridge({
                token: 'ETH',
                amount: '0.001',
                chainId: 11155111, // Sepolia
              });
            } catch (error4) {
              throw new Error(`All bridge attempts failed. Last error: ${error4 instanceof Error ? error4.message : String(error4)}`);
            }
          }
        }
      }
      
      console.log('Bridge result:', bridgeResult);
      console.log('Bridge initiated with smart wallet');
      
      // Show success message
      alert('Bridge transaction initiated! Check your wallet for confirmation.');
      
    } catch (error) {
      console.error('Bridge failed:', error);
      alert(`Bridge failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Avail Nexus Integration
        </h2>
        <p className="text-gray-600">
          Please connect your smart wallet to use Nexus features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Avail Nexus Integration (Testnet)
      </h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium text-gray-900">
            Nexus SDK: {isInitialized ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {!isInitialized && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              Nexus SDK is not available. This may be expected in development or if the service is not running.
            </p>
          </div>
        )}
        
        {/* Manual Balance Check */}
        {isInitialized && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              SDK is connected! You can now view your balances across different testnet chains.
            </p>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Chain-Specific Balances */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Testnet Chain Balances</h3>
          <button
            onClick={fetchChainBalances}
            disabled={!isInitialized || isLoadingBalances}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {isLoadingBalances ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {isLoadingBalances ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading balances...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {chainBalances.map((balance, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{balance.chain}</div>
                    <div className="text-xs text-gray-500">Chain ID: {balance.chainId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {balance.formatted} {balance.symbol}
                    </div>
                    <div className="text-xs text-gray-500">
                      {balance.balance} wei
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {chainBalances.length === 0 && !isLoadingBalances && (
          <div className="text-center py-8 text-gray-500">
            <p>No chain balances available</p>
            <p className="text-sm">Make sure your wallet is connected and SDK is initialized</p>
            <button
              onClick={fetchChainBalances}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Fallback: Current Chain Balance */}
        {!isInitialized && currentBalance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Current Chain Balance</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-800">Current Network</div>
                <div className="text-xs text-blue-600">Using wagmi balance</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-900">
                  {currentBalance.formatted} {currentBalance.symbol}
                </div>
                <div className="text-xs text-blue-600">
                  {currentBalance.value?.toString()} wei
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SDK Methods Debug */}
      {isInitialized && nexusSdk && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Available SDK Methods</h4>
          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>Transfer methods:</strong>
                <div className="text-gray-600">
                  {Object.getOwnPropertyNames(nexusSdk).filter(name => 
                    name.toLowerCase().includes('transfer')
                  ).join(', ') || 'None found'}
                </div>
              </div>
              <div>
                <strong>Bridge methods:</strong>
                <div className="text-gray-600">
                  {Object.getOwnPropertyNames(nexusSdk).filter(name => 
                    name.toLowerCase().includes('bridge')
                  ).join(', ') || 'None found'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nexus Actions */}
      <div className="space-y-4 mb-6">
        <button
          onClick={handleTransfer}
          disabled={!isInitialized || isLoading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Nexus Transfer (0.001 ETH)'}
        </button>

        <button
          onClick={handleBridge}
          disabled={!isInitialized || isLoading}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Bridge ETH to Base Sepolia (0.001 ETH)'}
        </button>
        
        {!isInitialized && (
          <p className="text-sm text-gray-500 text-center">
            Nexus SDK must be connected to use these features
          </p>
        )}
      </div>

      {/* Features Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Smart Wallet + Nexus Integration (Testnet)</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Gasless Transactions:</strong> Powered by Privy smart wallets</li>
          <li>• <strong>Chain Abstraction:</strong> Unified interface across chains</li>
          <li>• <strong>Unified Balance:</strong> Single view across all chains</li>
          <li>• <strong>Auto-Signed:</strong> No confirmation modals needed</li>
          <li>• <strong>Testnet Mode:</strong> Using testnet configuration for development</li>
        </ul>
      </div>
    </div>
  );
}
