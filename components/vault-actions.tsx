"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DepositModal } from "@/components/deposit-modal"

export function VaultActions() {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [showDepositModal, setShowDepositModal] = useState(false)
  const { toast } = useToast()

  // Fresh user state - zero balances
  const vaultBalance = 0

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

  const handleQuickAmount = (percent: number) => {
    const amount = (vaultBalance * percent) / 100
    setWithdrawAmount(amount.toFixed(2))
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
          <div className="p-4 bg-background rounded-md border border-border text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Cross-Chain Deposit</h3>
              <p className="text-sm text-muted-foreground">
                Bridge assets from any chain and deposit to vault in one transaction
              </p>
            </div>
            
            <div className="p-3 bg-[#0a0a0a] rounded-md border border-border flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground text-left">
                • Bridge from Ethereum, Polygon, or other chains
                <br />• Gasless transactions via Privy
                <br />• Instant availability for trading
              </p>
            </div>

            <Button
              onClick={() => setShowDepositModal(true)}
              className="w-full h-11 bg-cyan-400 text-black hover:bg-cyan-300 font-semibold"
            >
              Bridge & Deposit
            </Button>
          </div>
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
                  onClick={() => handleQuickAmount(percent)}
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

      {/* Bridge & Deposit Modal */}
      <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
    </Card>
  )
}
