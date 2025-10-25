"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, ArrowDown, Wallet, Download, CheckCircle2, Loader2, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function WithdrawFlowDemo() {
  const [amount, setAmount] = useState('800')
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleWithdraw = async () => {
    setIsProcessing(true)
    // Simulate processing
    for (let i = 0; i <= 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setStep(i)
    }
    setIsProcessing(false)
  }

  const resetFlow = () => {
    setStep(0)
    setIsProcessing(false)
  }

  // Hardcoded balances
  const yusdeBalance = 1000
  const tradingProfit = 50
  const totalYusde = yusdeBalance + tradingProfit
  const usdcReceived = (parseFloat(amount) * 1.25).toFixed(2) // 0.8:1 ratio

  return (
    <Card className="w-full bg-[#0a0a0a] border-[#1e1e1e]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-cyan-400">
          <Download className="h-5 w-5" />
          <span>Withdraw Flow</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
              <div className="text-sm text-muted-foreground mb-1">Total yUSDe</div>
              <div className="text-2xl font-bold text-cyan-400">{totalYusde} yUSDe</div>
              <div className="text-xs text-muted-foreground mt-1">
                Includes trading profits
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
                <div className="text-xs text-muted-foreground mb-1">Original Deposit</div>
                <div className="font-mono text-lg">{yusdeBalance}</div>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="text-xs text-muted-foreground mb-1">Trading Profit</div>
                <div className="font-mono text-lg text-green-400">+{tradingProfit}</div>
              </div>
            </div>

            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Yield Earned (24h)</span>
                <Badge className="bg-purple-500/20 text-purple-400">8% APY</Badge>
              </div>
              <div className="text-xl font-bold text-purple-400">0.22 yUSDe</div>
              <div className="text-xs text-muted-foreground mt-1">
                Continuously earning from sUSDe staking
              </div>
            </div>

            <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-400">
                  Even while trading, your yUSDe continues earning yield!
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Withdraw Amount</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-mono"
                      max={totalYusde}
                    />
                    <span className="text-sm text-muted-foreground">yUSDe</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Max: {totalYusde} yUSDe
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 1: Redeem yUSDe</span>
                    <Badge variant="outline">yUSDe → sUSDe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 2: Unstake sUSDe</span>
                    <Badge variant="outline">sUSDe → USDe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 3: Swap to USDC</span>
                    <Badge variant="outline">USDe → USDC</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 4: Bridge if needed</span>
                    <Badge variant="outline">Base → Ethereum</Badge>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">You will receive</span>
                    <Download className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">${usdcReceived} USDC</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Includes yield + trading profits
                  </div>
                </div>

                <Button 
                  onClick={handleWithdraw} 
                  className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Withdrawal <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {(step > 0 && step < 4) && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
                
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 1 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 1 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />}
                    <div className="flex-1">
                      <div className="font-medium">Redeeming yUSDe</div>
                      <div className="text-xs text-muted-foreground">yUSDe → sUSDe</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 2 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 2 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 2 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Unstaking from Vault</div>
                      <div className="text-xs text-muted-foreground">sUSDe → USDe</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 3 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 3 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 3 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Swapping to USDC</div>
                      <div className="text-xs text-muted-foreground">USDe → USDC</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 4 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 4 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 4 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Bridging to wallet</div>
                      <div className="text-xs text-muted-foreground">Base → Ethereum</div>
                    </div>
                  </div>
                </div>

                <Progress value={(step / 4) * 100} className="h-2" />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Withdrawal Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your yield-adjusted funds are now in your wallet
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Received</span>
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">${usdcReceived} USDC</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Yield earned: +{tradingProfit} USDC | Original: {amount} yUSDe
                  </div>
                </div>

                <Button onClick={resetFlow} className="w-full" variant="outline">
                  New Withdrawal
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
