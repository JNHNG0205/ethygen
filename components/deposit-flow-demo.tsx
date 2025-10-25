"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, ArrowDown, Wallet, TrendingUp, Zap, CheckCircle2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function DepositFlowDemo() {
  const [amount, setAmount] = useState('1000')
  const [token, setToken] = useState('USDC')
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Hardcoded balances
  const balances = [
    { chain: 'Ethereum', token: 'ETH', amount: '0.5', usd: '1200', address: '0x...abc' },
    { chain: 'Arbitrum', token: 'USDC', amount: '500', usd: '500', address: '0x...def' },
    { chain: 'Optimism', token: 'ETH', amount: '0.2', usd: '480', address: '0x...ghi' },
    { chain: 'Base', token: 'USDC', amount: '800', usd: '800', address: '0x...jkl' },
  ]

  const totalFiat = balances.reduce((sum, b) => sum + parseFloat(b.usd), 0).toFixed(2)

  const handleDeposit = async () => {
    setIsProcessing(true)
    // Simulate processing
    for (let i = 0; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setStep(i)
    }
    setIsProcessing(false)
  }

  const resetFlow = () => {
    setStep(0)
    setIsProcessing(false)
  }

  const yusdeAmount = (parseFloat(amount) * 0.8).toFixed(2)
  const susdeAmount = (parseFloat(amount)).toFixed(2)

  return (
    <Card className="w-full bg-[#0a0a0a] border-[#1e1e1e]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-cyan-400">
          <Wallet className="h-5 w-5" />
          <span>Deposit Flow</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="balances" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balances">Multi-Chain Balances</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4">
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Unified Balance</span>
                <Badge className="bg-cyan-500/20 text-cyan-400">Nexus Aggregated</Badge>
              </div>
              <div className="text-2xl font-bold text-cyan-400">${totalFiat}</div>
              <div className="text-xs text-muted-foreground mt-1">Across all EVM chains</div>
            </div>

            <div className="space-y-2">
              {balances.map((balance, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#101010] rounded border border-[#1e1e1e]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                      {balance.token[0]}
                    </div>
                    <div>
                      <div className="font-medium">{balance.token}</div>
                      <div className="text-xs text-muted-foreground">{balance.chain}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{balance.amount}</div>
                    <div className="text-xs text-muted-foreground">${balance.usd}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center py-2">
              <ArrowDown className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
              <div className="text-sm text-cyan-400 font-medium mb-1">Available to Trade</div>
              <div className="text-xl font-bold">${totalFiat}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Bridged & converted to USDe on Base
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deposit" className="space-y-4">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Deposit Amount</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="font-mono"
                    />
                    <Select value={token} onValueChange={setToken}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 1: Bridge to Base</span>
                    <Badge variant="outline">USDC → Base</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 2: Swap to USDe</span>
                    <Badge variant="outline">USDC → USDe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 3: Stake in Vault</span>
                    <Badge variant="outline">USDe → sUSDe</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Step 4: Mint yUSDe</span>
                    <Badge variant="outline">sUSDe → yUSDe</Badge>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">You will receive</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">{yusdeAmount} yUSDe</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Backed by {susdeAmount} sUSDe (80% collateralization)
                  </div>
                </div>

                <Button 
                  onClick={handleDeposit} 
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Deposit <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {(step > 0 && step < 5) && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
                
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 1 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 1 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />}
                    <div className="flex-1">
                      <div className="font-medium">Bridging to Base</div>
                      <div className="text-xs text-muted-foreground">USDC → Base USDC</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 2 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 2 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 2 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Swapping to USDe</div>
                      <div className="text-xs text-muted-foreground">USDC → USDe</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 3 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 3 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 3 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Staking in Yield Engine</div>
                      <div className="text-xs text-muted-foreground">USDe → sUSDe</div>
                    </div>
                  </div>

                  <div className={`flex items-center space-x-3 p-3 rounded-lg border ${step >= 4 ? 'bg-cyan-500/10 border-cyan-500' : 'bg-[#101010] border-[#1e1e1e]'}`}>
                    {step > 4 ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : step === 4 ? <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> : null}
                    <div className="flex-1">
                      <div className="font-medium">Minting yUSDe</div>
                      <div className="text-xs text-muted-foreground">0.8:1 collateralization</div>
                    </div>
                  </div>
                </div>

                <Progress value={(step / 4) * 100} className="h-2" />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Deposit Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your yUSDe is now earning yield
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">yUSDe Balance</span>
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-400">{yusdeAmount} yUSDe</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Earning ~8% APY in sUSDe staking
                  </div>
                </div>

                <Button onClick={resetFlow} className="w-full" variant="outline">
                  New Deposit
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
