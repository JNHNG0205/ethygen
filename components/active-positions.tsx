"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePositions } from "@/hooks/use-positions"
import { usePriceFeed } from "@/hooks/use-price-feed"
import React from "react"

export function ActivePositions() {
  const { toast } = useToast()
  const { activePositions, closePosition } = usePositions()

  const handleClosePosition = (id: string) => {
    closePosition(id)
    toast({
      title: "Position Closed",
      description: `Position was closed and moved to history`,
    })
  }

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Active Positions</h2>
        <div className="text-sm text-muted-foreground">{activePositions.length} open</div>
      </div>

      {activePositions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Positions</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            You don't have any open positions yet. Start trading to see your positions here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activePositions.map((position) => (
            <PositionRow key={position.id} position={position} onClose={() => handleClosePosition(position.id)} />
          ))}
        </div>
      )}
    </Card>
  )
}

function PositionRow({ position, onClose }: { position: any; onClose: () => void }) {
  const { price: livePrice } = usePriceFeed(position.asset)
  const current = livePrice ?? position.currentPrice ?? position.entryPrice
  const positionNotional = position.size
  const priceMove = position.side === "long" ? current - position.entryPrice : position.entryPrice - current
  const pnl = (priceMove / position.entryPrice) * positionNotional
  const pnlPercent = (pnl / position.margin) * 100
  const isProfitable = pnl >= 0

  return (
    <div className="p-4 bg-background rounded-lg border border-border space-y-4">
      {/* Position Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold font-mono text-foreground">{position.asset}</div>
          <div
            className={`px-2 py-1 rounded text-xs font-semibold ${
              position.side === "long" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {position.leverage}x {position.side.toUpperCase()}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-destructive">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Position Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
          <div className="text-sm font-mono font-semibold text-foreground">${position.entryPrice.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current Price</div>
          <div className="text-sm font-mono font-semibold text-foreground">${current.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Position Size</div>
          <div className="text-sm font-mono font-semibold text-foreground">${position.size.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Margin</div>
          <div className="text-sm font-mono font-semibold text-foreground">${position.margin.toLocaleString()}</div>
        </div>
      </div>

      {/* PnL and Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Unrealized PnL</div>
            <div
              className={`text-lg font-mono font-bold flex items-center gap-1 ${isProfitable ? "text-primary" : "text-destructive"}`}
            >
              {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isProfitable ? "+" : ""}${pnl.toFixed(2)} ({isProfitable ? "+" : ""}
              {pnlPercent.toFixed(2)}%)
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Liquidation Price</div>
            <div className="text-sm font-mono font-semibold text-destructive">
              ${position.liquidationPrice.toLocaleString()}
            </div>
          </div>
        </div>
        <Button onClick={onClose} className="bg-primary text-black hover:bg-primary/90 font-semibold">
          Close Position
        </Button>
      </div>
    </div>
  )
}
