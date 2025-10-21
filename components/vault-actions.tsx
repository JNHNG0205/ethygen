"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSmartWallet } from "@/hooks/use-smart-wallet"
import { usePrivy } from "@privy-io/react-auth"
import { parseAbi, encodeFunctionData } from "viem"

// TODO: Replace with your actual vault contract address and ABI
const VAULT_ADDRESS = "0xYourVaultAddressHere"
const VAULT_ABI = [
  "function mintUSDe(uint256 amount)"
]
export function VaultActions() {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const { toast } = useToast()

  // Fresh user state - zero balances
  const walletBalance = 0
  const vaultBalance = 0

  const { executeGaslessTx } = useSmartWallet()
  const { authenticated, login } = usePrivy()

  const handleDeposit = () => {
    if (!authenticated) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Privy wallet to deposit.",
        variant: "destructive",
      })
      login()
      return
    }
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Deposit Successful",
      description: `Deposited ${depositAmount} yUSDe to vault`,
    })
    setDepositAmount("")
  }

  const handleDepositGasless = async () => {
    if (!authenticated) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Privy wallet to deposit.",
        variant: "destructive",
      })
      login()
      return
    }
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      })
      return
    }
    try {
      const calldata = encodeFunctionData({
        abi: parseAbi(VAULT_ABI),
        functionName: "mintUSDe",
        args: [BigInt(Math.floor(Number(depositAmount) * 1e18))], // assumes 18 decimals
      })
      await executeGaslessTx({
        to: VAULT_ADDRESS,
        data: calldata,
        value: 0n,
      })
      setDepositAmount("")
    } catch (err) {
      // toast handled in hook
    }
  }

  const handleWithdraw = () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Withdrawal Successful",
      description: `Withdrew ${withdrawAmount} yUSDe from vault`,
    })
    setWithdrawAmount("")
  }

  const handleQuickAmount = (percent: number, type: "deposit" | "withdraw") => {
    const balance = type === "deposit" ? walletBalance : vaultBalance
    const amount = (balance * percent) / 100
    if (type === "deposit") {
      setDepositAmount(amount.toFixed(2))
    } else {
      setWithdrawAmount(amount.toFixed(2))
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <Tabs defaultValue="deposit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-background">
          <TabsTrigger value="deposit" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="data-[state=active]:bg-primary data-[state=active]:text-black">
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Amount (yUSDe)</Label>
              <span className="text-xs text-muted-foreground">Wallet: {walletBalance.toFixed(2)}</span>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-background border-border text-foreground font-mono text-lg h-12"
            />
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(percent, "deposit")}
                  className="flex-1 h-8 text-xs"
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-background rounded-md border border-border flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Deposits are instant and gasless. Your funds will be available for trading immediately.
            </p>
          </div>

          <Button
            onClick={handleDeposit}
            className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-semibold mb-2"
            disabled={!authenticated || !depositAmount || Number.parseFloat(depositAmount) <= 0}
          >
            Deposit to Vault
          </Button>
          <Button
            onClick={handleDepositGasless}
            className="w-full h-11 bg-cyan-400 text-black hover:bg-cyan-300 font-semibold"
            disabled={!authenticated || !depositAmount || Number.parseFloat(depositAmount) <= 0}
          >
            Deposit Gasless
          </Button>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Amount (yUSDe)</Label>
              <span className="text-xs text-muted-foreground">Available: {vaultBalance.toFixed(2)}</span>
            </div>
            <Input
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-background border-border text-foreground font-mono text-lg h-12"
            />
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(percent, "withdraw")}
                  className="flex-1 h-8 text-xs"
                >
                  {percent}%
                </Button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-background rounded-md border border-border flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              You can only withdraw available margin. Close positions to free up more funds.
            </p>
          </div>

          <Button
            onClick={handleWithdraw}
            className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-semibold"
          >
            Withdraw from Vault
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
