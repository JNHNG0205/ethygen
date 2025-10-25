'use client';

import { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { usePrivy, useSendTransaction, useWallets } from '@privy-io/react-auth';
import { parseEther, formatEther } from 'viem';

export default function GaslessTransactionTest() {
  const { authenticated } = usePrivy();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { wallets } = useWallets();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [gasSponsored, setGasSponsored] = useState<boolean | null>(null);

  const { sendTransaction } = useSendTransaction();

  const handleSendTransaction = async () => {
    if (!recipientAddress || !amount) {
      alert('Please enter recipient address and amount');
      return;
    }

    if (!address) {
      alert('Please connect your smart wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setTransactionHash('');
      setGasSponsored(null);
      
      // Send transaction with auto-signing and gas sponsorship (smart wallet only)
      const result = await sendTransaction(
        {
          to: recipientAddress as `0x${string}`,
          value: parseEther(amount),
        },
        {
          address: address, // Use the current connected smart wallet 
          sponsor: true, // Always enable gas sponsorship (smart wallets only)
          uiOptions: {
            showWalletUIs: false, // Always auto-sign (no confirmation modals)
          },
        }
      );
      
      setGasSponsored(true);
      setTransactionHash(result.hash);
      console.log('Auto-signed and sent transaction with gas sponsorship:', result);
    } catch (err) {
      console.error('Transaction failed:', err);
      
      const error = err as Error;
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      let errorMessage = 'Transaction failed. ';
      if (error.name === 'AbortError') {
        errorMessage += 'Transaction was aborted. Make sure gas sponsorship is enabled in your Privy dashboard.';
      } else if (error.message.includes('gas')) {
        errorMessage += 'Gas sponsorship error. Check your Privy dashboard configuration.';
      } else if (error.message.includes('balance')) {
        errorMessage += 'Insufficient balance. Smart wallets should use gas sponsorship.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestGaslessTransaction = async () => {
    // Test with a small amount to a test address (Sepolia testnet)
    const testRecipient = '0x782162eCD91c8B139d2504665d18E5F958A96101'; // Test address
    const testAmount = '0.001'; // Small test amount (Sepolia ETH)
    
    setRecipientAddress(testRecipient);
    setAmount(testAmount);
    
    await handleSendTransaction();
  };

  const clearTransaction = () => {
    setTransactionHash('');
    setRecipientAddress('');
    setAmount('');
    setGasSponsored(null);
  };

  if (!authenticated || !isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Smart Wallet Transaction
        </h2>
        <p className="text-gray-600">
          Please connect your smart wallet to test gasless and auto-signed transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Smart Wallet Transaction
      </h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ Smart Wallet Only - Gasless & Auto-Signed (Sepolia Testnet)</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Smart Wallet Only:</strong> All users get ERC-4337 smart wallets with embedded signers</li>
            <li>• <strong>Always Gasless:</strong> Paymaster covers all transaction fees automatically</li>
            <li>• <strong>Always Auto-Signed:</strong> No confirmation modals, seamless transactions</li>
            <li>• <strong>Account Abstraction:</strong> Enhanced security and user experience</li>
            <li>• <strong>No EOA Support:</strong> External wallets (MetaMask) not supported for gasless transactions</li>
            <li>• <strong>Testnet Only:</strong> Using Sepolia ETH (no real money involved)</li>
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
          Smart wallets provide automatic gas sponsorship and auto-signing. No ETH balance required for gas fees! (Sepolia testnet)
        </p>
      </div>

      {/* Transaction Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleSendTransaction}
          disabled={isLoading || !recipientAddress || !amount}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Sending...' : 'Send Gasless Transaction'}
        </button>

        <button
          onClick={handleTestGaslessTransaction}
          disabled={isLoading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Test Gasless (0.001 ETH)
        </button>

        <button
          onClick={clearTransaction}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Transaction Status */}
      {transactionHash && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">✅ Transaction Sent Successfully!</h3>
          <p className="text-sm text-green-800 break-all">
            Transaction Hash: {transactionHash}
          </p>
          <p className="text-sm text-green-800">
            Transaction was auto-signed and sent to Sepolia testnet!
          </p>
          <div className="mt-2">
            <div className="bg-green-100 border border-green-300 rounded p-2">
              <p className="text-sm text-green-800">
                ✅ <strong>Gas Sponsored:</strong> Transaction fees were covered by Privy
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-green-700">
            <p>• No confirmation modals shown</p>
            <p>• Automatic signing with embedded signer</p>
            <p>• Gas sponsorship enabled</p>
            <p>• Successfully submitted to blockchain</p>
          </div>
          <a 
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
          >
            View on Etherscan →
          </a>
        </div>
      )}


      {/* Instructions */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">How Smart Wallet Transactions Work</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Connect your smart wallet (automatically created by Privy)</li>
          <li>Click "Test Gasless" to send a transaction automatically</li>
          <li>Transaction is signed and sent instantly without any confirmation modals</li>
          <li>Embedded signer handles all signing automatically</li>
          <li>Gas fees are sponsored by Privy paymaster</li>
          <li>Transaction is submitted to Sepolia blockchain</li>
        </ol>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800">
            <strong>Smart Wallet Only:</strong> This app only supports Privy smart wallets with embedded signers and gas sponsorship. 
            External wallets (MetaMask, etc.) are not supported for gasless transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
