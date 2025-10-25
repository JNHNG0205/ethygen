"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TradingFlowDemo() {
  const [positionSize, setPositionSize] = useState('10')
  const [leverage, setLeverage] = useState('5')
  const [isLong, setIsLong] = useState(true)

  // Hardcoded market data
  const marketPrice = 2450.50
  const positionPrice = 2420.00
  const unrealizedPnL = ((marketPrice - positionPrice) * parseFloat(positionSize)).toFixed(2)
  const pnlPercent = (((marketPrice - positionPrice) / positionPrice) * 100).toFixed(2)
  const isProfit = parseFloat(unrealizedPnL) > 0

  const collateralAmount = parseFloat(positionSize) / parseFloat(leverage)
  const liquidationPrice = isLong ? positionPrice * 0.85 : positionPrice * 1.15

  return (
    <Card className="w-full bg-[#0a0a0a] border-[#1e1e1e]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <span>Trading Flow</span>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400">Perp DEX</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-4">
            {/* Market Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
                <div className="text-sm text-muted-foreground mb-1">Market</div>
                <div className="text-xl font-bold">ETH/USD</div>
              </div>
              <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
                <div className="text-sm text-muted-foreground mb-1">Price</div>
                <div className="text-xl font-bold text-cyan-400">${marketPrice.toFixed(2)}</div>
              </div>
            </div>

            {/* Trading Form */}
            <div className="space-y-4 p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsLong(true)}
                  className={`flex-1 ${isLong ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' : 'bg-[#0a0a0a]'}`}
                  variant="outline"
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Long
                </Button>
                <Button
                  onClick={() => setIsLong(false)}
                  className={`flex-1 ${!isLong ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-[#0a0a0a]'}`}
                  variant="outline"
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Short
                </Button>
              </div>

              <div>
                <Label className="text-muted-foreground">Position Size</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="font-mono"
                  />
                  <span className="text-sm text-muted-foreground">USDC</span>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Leverage</Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="20">20x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collateral Information */}
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Collateral Required</span>
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-purple-400">{collateralAmount.toFixed(2)} yUSDe</div>
                <div className="text-xs text-muted-foreground mt-1">
                  yUSDe continues earning yield while in position
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                Open Position
              </Button>
            </div>

            {/* How it Works */}
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <h4 className="font-medium mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-cyan-400" />
                How yUSDe Works
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <ArrowDown className="w-4 h-4 mt-0.5 text-cyan-400" />
                  <span>Deposit yUSDe as margin collateral</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ArrowDown className="w-4 h-4 mt-0.5 text-cyan-400" />
                  <span>Trades executed on Base Sepolia via Pyth oracle</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ArrowDown className="w-4 h-4 mt-0.5 text-cyan-400" />
                  <span>Unused yUSDe continues earning 8% APY</span>
                </div>
                <div className="flex items-start space-x-2">
                  <ArrowDown className="w-4 h-4 mt-0.5 text-cyan-400" />
                  <span>PnL reflected in yUSDe balance</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="space-y-4">
            {/* Active Position */}
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {isLong ? (
                    <ArrowUp className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ArrowDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-bold text-lg">ETH/USD Position</span>
                </div>
                <Badge className={isLong ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}>
                  {isLong ? 'LONG' : 'SHORT'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Size</div>
                  <div className="font-mono text-lg">{positionSize} ETH</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Leverage</div>
                  <div className="font-mono text-lg">{leverage}x</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Entry Price</div>
                  <div className="font-mono">${positionPrice.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Mark Price</div>
                  <div className="font-mono">${marketPrice.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* PnL */}
            <div className={`p-4 rounded-lg border ${isProfit ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Unrealized PnL</span>
                {isProfit ? (
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className={`text-2xl font-bold font-mono ${isProfit ? 'text-cyan-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}${unrealizedPnL}
              </div>
              <div className={`text-sm mt-1 ${isProfit ? 'text-cyan-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{pnlPercent}%
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <h4 className="font-medium mb-3">Risk Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Collateral</span>
                  <span className="font-mono">{collateralAmount.toFixed(2)} yUSDe</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Liquidation Price</span>
                  <span className="font-mono text-red-400">${liquidationPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Margin Health</span>
                  <span className="font-mono text-cyan-400">85%</span>
                </div>
              </div>
            </div>

            {/* Continue Earning */}
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">Still Earning Yield</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Your {collateralAmount.toFixed(2)} yUSDe collateral continues earning ~8% APY from sUSDe staking.
                Gains/losses are added to your balance without affecting yield earnings.
              </div>
            </div>

            <Button variant="destructive" className="w-full">
              Close Position
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
