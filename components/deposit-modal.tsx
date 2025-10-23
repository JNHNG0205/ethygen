"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBridgeAndExecute } from "@/hooks/use-bridge-and-execute";
import { useUnifiedBalances } from "@/hooks/use-unified-balances";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Mock vault config (replace with actual contract details)
const VAULT_ADDRESS = "0xYourVaultAddressHere" as `0x${string}`;
const VAULT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "mintUSDe",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const address = wallets[0]?.address as `0x${string}` | undefined;
  const { data: balances } = useUnifiedBalances(address);
  const { bridgeAndExecute } = useBridgeAndExecute();

  const [amount, setAmount] = useState("100");
  const [token, setToken] = useState("USDC");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"input" | "processing" | "success" | "error">("input");
  const [result, setResult] = useState<{ hash?: string; error?: string }>({});

  const totalFiat = balances?.reduce((sum, b) => sum + (Number(b.balanceInFiat) || 0), 0) || 0;

  const handleDeposit = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      login();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setStep("processing");

    try {
      const bridgeResult = await bridgeAndExecute(
        token,
        amount,
        [1], // Source: Ethereum mainnet (change as needed)
        {
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "mintUSDe",
        },
        address
      );

      if (bridgeResult.success) {
        setStep("success");
        setResult({ hash: bridgeResult.executeTxHash || bridgeResult.bridgeTxHash });
        toast.success(
          `Deposited ${amount} ${token}! ${bridgeResult.bridgeSkipped ? "(Bridge skipped)" : "(Bridged)"}`
        );
        // Auto-close after 3s
        setTimeout(() => {
          onClose();
          resetModal();
        }, 3000);
      } else {
        setStep("error");
        setResult({ error: bridgeResult.error || "Unknown error" });
        toast.error(bridgeResult.error || "Deposit failed");
      }
    } catch (err) {
      setStep("error");
      const msg = (err as Error)?.message || "Unknown error";
      setResult({ error: msg });
      toast.error("Deposit failed: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep("input");
    setAmount("100");
    setResult({});
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300); // Reset after animation
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) handleClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!isLoading && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Input Step */}
            {step === "input" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-1">Deposit Collateral</h3>
                  <p className="text-xs text-muted-foreground">Bridge & mint yUSDe gaslessly</p>
                </div>

                {/* Current balance */}
                <div className="p-3 bg-[#101c1a] rounded border border-[#1e1e1e]">
                  <div className="text-xs text-muted-foreground mb-1">Current Unified Balance</div>
                  <div className="text-lg font-mono text-foreground">${totalFiat.toFixed(2)}</div>
                </div>

                {/* Token select */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Asset</Label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full p-3 bg-[#101c1a] text-foreground rounded border border-[#1e1e1e] font-mono"
                  >
                    <option value="USDC">USDC</option>
                    <option value="ETH">ETH</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-[#101c1a] border-[#1e1e1e] text-foreground font-mono text-lg h-12"
                  />
                </div>

                {/* Info banner */}
                <div className="p-3 bg-[#101c1a] rounded border border-[#1e1e1e] text-xs text-muted-foreground">
                  <p>
                    • Source: Ethereum → Base Sepolia
                    <br />• Gasless via Privy smart wallet
                    <br />• Instant execution on target chain
                  </p>
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleDeposit}
                  disabled={!authenticated || !amount || Number(amount) <= 0}
                  className="w-full h-11 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold"
                >
                  Bridge & Mint Gasless
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground mb-1">Processing Deposit</h3>
                  <p className="text-xs text-muted-foreground">
                    Simulating bridge & execute...
                    <br />
                    This may take a few moments
                  </p>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground mb-1">Deposit Successful!</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {amount} {token} deposited to vault
                  </p>
                  {result.hash && (
                    <code className="text-xs text-cyan-400 bg-[#101c1a] px-2 py-1 rounded">
                      {result.hash.slice(0, 10)}...{result.hash.slice(-8)}
                    </code>
                  )}
                </div>
                <Button onClick={handleClose} variant="outline" className="mt-4">
                  Close
                </Button>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground mb-1">Deposit Failed</h3>
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded">{result.error}</p>
                </div>
                <Button
                  onClick={() => setStep("input")}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
