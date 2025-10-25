'use client';

import { useState } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { parseEther } from 'viem';

export default function BatchTransactionTest() {
  const { authenticated } = usePrivy();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: hash,
    writeContract,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBatchTransaction = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Example: Batch multiple operations
      // In a real implementation, you would batch multiple contract calls
      // For demo purposes, we'll simulate a batch operation
      
      // This is a placeholder for batch transaction logic
      // In practice, you would use Privy's batch transaction capabilities
      alert('Batch transaction feature would be implemented with Privy\'s batch transaction API');
      
    } catch (err) {
      console.error('Batch transaction failed:', err);
      alert('Batch transaction failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiSendTransaction = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Example of multiple transactions that could be batched
      const transactions = [
        {
          to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' as `0x${string}`,
          value: parseEther('0.001'),
        },
        {
          to: '0x8ba1f109551bD432803012645Hac136c' as `0x${string}`,
          value: parseEther('0.002'),
        },
      ];

      // In a real implementation, you would batch these transactions
      alert(`Would batch ${transactions.length} transactions in a single operation`);
      
    } catch (err) {
      console.error('Multi-send failed:', err);
      alert('Multi-send failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated || !isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Batch Transaction Test
        </h2>
        <p className="text-gray-600">
          Please connect your wallet to test batch transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Batch Transaction Test
      </h2>
      
      <div className="mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-purple-900 mb-2">🔄 Batch Transaction Benefits</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• <strong>Multiple Operations:</strong> Execute several transactions in one batch</li>
            <li>• <strong>Gas Optimization:</strong> Reduce overall gas costs</li>
            <li>• <strong>Atomic Operations:</strong> All transactions succeed or fail together</li>
            <li>• <strong>Better UX:</strong> Single confirmation for multiple operations</li>
          </ul>
        </div>
      </div>

      {/* Current Balance */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Current Balance</h3>
        <p className="text-lg font-semibold text-gray-900">
          {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
        </p>
        <p className="text-sm text-gray-600">
          Smart wallets can batch multiple operations efficiently!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleBatchTransaction}
          disabled={isPending || isLoading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isLoading ? 'Processing...' : 'Test Batch Transaction'}
        </button>

        <button
          onClick={handleMultiSendTransaction}
          disabled={isPending || isLoading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Test Multi-Send (2 Recipients)
        </button>
      </div>

      {/* Transaction Status */}
      {hash && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">Batch Transaction Pending</h3>
            <p className="text-sm text-yellow-800 break-all">
              Hash: {hash}
            </p>
            <p className="text-sm text-yellow-800">
              Status: {isConfirming ? 'Confirming...' : 'Broadcasting...'}
            </p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">✅ Batch Transaction Successful!</h3>
          <p className="text-sm text-green-800 break-all">
            Hash: {hash}
          </p>
          <p className="text-sm text-green-800">
            Your batch transaction has been confirmed on the blockchain!
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">❌ Batch Transaction Failed</h3>
          <p className="text-sm text-red-800">
            {error.message || 'Unknown error occurred'}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How Batch Transactions Work</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Smart wallets can group multiple operations into a single transaction</li>
          <li>All operations are executed atomically (all succeed or all fail)</li>
          <li>Gas costs are optimized by batching operations</li>
          <li>Users only need to sign once for multiple operations</li>
          <li>Perfect for complex DeFi interactions and multi-step workflows</li>
        </ol>
      </div>
    </div>
  );
}
