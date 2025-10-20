"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Info, Loader2, CheckCircle2 } from "lucide-react"
import { useGaslessTrading } from "@/hooks/use-gasless-trading"
import { useToast } from "@/hooks/use-toast"
import { usePriceFeed } from "@/hooks/use-price-feed"

export function EnhancedTradeExecutor() {
  const [side, setSide] = useState<"long" | "short">("long")
  const [leverage, setLeverage] = useState([10])
  const [margin, setMargin] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [limitPrice, setLimitPrice] = useState("")
  const [tpslEnabled, setTpslEnabled] = useState(false)
  const [takeProfit, setTakeProfit] = useState("")
  const [stopLoss, setStopLoss] = useState("")

  const { executeTrade, isExecuting, authenticated } = useGaslessTrading()
  const { toast } = useToast()

  const { price: currentPrice } = usePriceFeed("ETH/USDC")

  const availableBalance = 8234.5

  const calculatePosition = () => {
    const marginNum = Number.parseFloat(margin) || 0
    return (marginNum * leverage[0]).toFixed(2)
  }

  const calculateLiquidationPrice = () => {
    const marginNum = Number.parseFloat(margin) || 0
    if (marginNum === 0 || !currentPrice) return 0

    const positionSize = marginNum * leverage[0]
    const maintenanceMargin = 0.05
    const liquidationDistance = (marginNum * (1 - maintenanceMargin)) / (positionSize / currentPrice)

    if (side === "long") {
      return currentPrice - liquidationDistance
    }
    return currentPrice + liquidationDistance
  }

  const calculateFees = () => {
    const positionSize = Number.parseFloat(calculatePosition()) || 0
    const takerFee = 0.0006
    return (positionSize * takerFee).toFixed(2)
  }

  const handleQuickMargin = (percent: number) => {
    const amount = (availableBalance * percent) / 100
    setMargin(amount.toFixed(2))
  }

  const handleExecuteTrade = async () => {
    if (!authenticated) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to trade",
        variant: "destructive",
      })
      return
    }

    const result = await executeTrade({
      side,
      leverage: leverage[0],
      margin: Number.parseFloat(margin),
      orderType,
      limitPrice: orderType === "limit" ? Number.parseFloat(limitPrice) : undefined,
      takeProfit: tpslEnabled && takeProfit ? Number.parseFloat(takeProfit) : undefined,
      stopLoss: tpslEnabled && stopLoss ? Number.parseFloat(stopLoss) : undefined,
    })

    if (result.success) {
      toast({
        title: "Trade Executed",
        description: (
          <div className="space-y-1">
            <p>{result.message}</p>
            <p className="text-xs font-mono text-muted-foreground">Tx: {result.txHash?.slice(0, 20)}...</p>
          </div>
        ),
      })
      setMargin("")
      setLimitPrice("")
      setTakeProfit("")
      setStopLoss("")
    } else {
      toast({
        title: "Trade Failed",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="p-3 border-b border-[#1e1e1e]">
        <h3 className="text-sm font-semibold text-foreground">Trade</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Long/Short Tabs */}
        <Tabs value={side} onValueChange={(v) => setSide(v as "long" | "short")}>
          <TabsList className="grid w-full grid-cols-2 bg-card h-10">
            <TabsTrigger
              value="long"
              className="data-[state=active]:bg-primary data-[state=active]:text-black font-semibold"
            >
              Long
            </TabsTrigger>
            <TabsTrigger
              value="short"
              className="data-[state=active]:bg-destructive data-[state=active]:text-white font-semibold"
            >
              Short
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Order Type */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Order Type</Label>
          <div className="flex gap-2">
            <Button
              variant={orderType === "market" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType("market")}
              className={`flex-1 ${orderType === "market" ? "bg-primary text-black" : ""}`}
            >
              Market
            </Button>
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType("limit")}
              className={`flex-1 ${orderType === "limit" ? "bg-primary text-black" : ""}`}
            >
              Limit
            </Button>
          </div>
        </div>

        {/* Limit Price */}
        {orderType === "limit" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Limit Price (USDC)</Label>
            <Input
              type="number"
              placeholder={currentPrice?.toFixed(2) || "0.00"}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="bg-card border-border text-foreground font-mono"
            />
          </div>
        )}

        {/* Leverage Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Leverage</Label>
            <span className="text-sm font-mono font-bold text-primary">{leverage[0]}x</span>
          </div>
          <Slider
            value={leverage}
            onValueChange={setLeverage}
            min={1}
            max={20}
            step={1}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>5x</span>
            <span>10x</span>
            <span>20x</span>
          </div>
        </div>

        {/* Margin Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Margin (yUSDe)</Label>
            <span className="text-xs text-muted-foreground">Available: {availableBalance.toFixed(2)}</span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="bg-card border-border text-foreground font-mono text-lg h-12"
          />
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="outline"
                size="sm"
                onClick={() => handleQuickMargin(percent)}
                className="flex-1 h-7 text-xs"
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        {/* TP/SL Toggle */}
        <div className="flex items-center justify-between p-3 bg-card rounded-md border border-border">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-foreground cursor-pointer">Take Profit / Stop Loss</Label>
            <Info className="w-3 h-3 text-muted-foreground" />
          </div>
          <Switch checked={tpslEnabled} onCheckedChange={setTpslEnabled} />
        </div>

        {/* TP/SL Inputs */}
        {tpslEnabled && (
          <div className="space-y-3 p-3 bg-card rounded-md border border-border">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Take Profit Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="bg-background border-border text-foreground font-mono h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Stop Loss Price</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="bg-background border-border text-foreground font-mono h-9"
              />
            </div>
          </div>
        )}

        {/* Position Preview */}
        <div className="p-3 bg-card rounded-md border border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Position Size</span>
            <span className="font-mono text-foreground font-semibold">${calculatePosition()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-mono text-foreground">${currentPrice?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Liquidation Price</span>
            <span className="font-mono text-destructive">${calculateLiquidationPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Est. Fees</span>
            <span className="font-mono text-muted-foreground">${calculateFees()}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary">Gasless Transaction</span>
          </div>
        </div>

        {/* Risk Warning */}
        {leverage[0] >= 15 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              High leverage increases liquidation risk. Use caution with {leverage[0]}x leverage.
            </p>
          </div>
        )}

        {/* Execute Button */}
        <Button
          onClick={handleExecuteTrade}
          disabled={!margin || Number.parseFloat(margin) <= 0 || isExecuting || !authenticated}
          className={`w-full h-12 font-bold text-base neon-glow-strong ${
            side === "long"
              ? "bg-primary text-black hover:bg-primary/90"
              : "bg-destructive text-white hover:bg-destructive/90"
          }`}
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : !authenticated ? (
            "Connect Wallet to Trade"
          ) : (
            `${side === "long" ? "Buy / Long" : "Sell / Short"}`
          )}
        </Button>

        <Button
          variant="outline"
          disabled={isExecuting}
          className="w-full border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground bg-transparent"
        >
          Close All Positions
        </Button>
      </div>
    </div>
  )
}
