"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export function TradeExecutor() {
  const [side, setSide] = useState<"long" | "short">("long")
  const [leverage, setLeverage] = useState([10])
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")

  const calculatePosition = () => {
    const amountNum = Number.parseFloat(amount) || 0
    return (amountNum * leverage[0]).toFixed(2)
  }

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="p-3 border-b border-[#1e1e1e]">
        <h3 className="text-sm font-semibold text-foreground">Trade</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Long/Short Tabs */}
        <Tabs value={side} onValueChange={(v) => setSide(v as "long" | "short")}>
          <TabsList className="grid w-full grid-cols-2 bg-card">
            <TabsTrigger value="long" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              Long
            </TabsTrigger>
            <TabsTrigger value="short" className="data-[state=active]:bg-destructive data-[state=active]:text-white">
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
              className={orderType === "market" ? "bg-primary text-black" : ""}
            >
              Market
            </Button>
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType("limit")}
              className={orderType === "limit" ? "bg-primary text-black" : ""}
            >
              Limit
            </Button>
          </div>
        </div>

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
            <span>20x</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Margin (yUSDe)</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-card border-border text-foreground font-mono text-lg"
          />
          <div className="text-xs text-muted-foreground">Available: 8,234.50 yUSDe</div>
        </div>

        {/* Position Preview */}
        <div className="p-3 bg-card rounded-md border border-border space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Position Size</span>
            <span className="font-mono text-foreground">${calculatePosition()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-mono text-foreground">$2,450.32</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Liquidation Price</span>
            <span className="font-mono text-destructive">$2,205.29</span>
          </div>
        </div>

        {/* Execute Button */}
        <Button
          className={`w-full h-12 font-bold text-base neon-glow-strong ${
            side === "long"
              ? "bg-primary text-black hover:bg-primary/90"
              : "bg-destructive text-white hover:bg-destructive/90"
          }`}
        >
          {side === "long" ? "Buy / Long" : "Sell / Short"}
        </Button>

        {/* Quick Close */}
        <Button
          variant="outline"
          className="w-full border-muted-foreground text-muted-foreground hover:border-foreground hover:text-foreground bg-transparent"
        >
          Close All Positions
        </Button>
      </div>
    </div>
  )
}
