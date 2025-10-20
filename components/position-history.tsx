"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface HistoricalPosition {
  id: string
  asset: string
  side: "long" | "short"
  entryPrice: number
  exitPrice: number
  size: number
  leverage: number
  pnl: number
  pnlPercent: number
  closedAt: Date
}

export function PositionHistory() {
  const history: HistoricalPosition[] = [
    {
      id: "1",
      asset: "ETH/USDC",
      side: "long",
      entryPrice: 2380,
      exitPrice: 2420.5,
      size: 23800,
      leverage: 10,
      pnl: 405,
      pnlPercent: 17.02,
      closedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: "2",
      asset: "BTC/USDC",
      side: "short",
      entryPrice: 43200,
      exitPrice: 42500,
      size: 21600,
      leverage: 5,
      pnl: 350,
      pnlPercent: 8.1,
      closedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      asset: "ARB/USDC",
      side: "long",
      entryPrice: 1.85,
      exitPrice: 1.72,
      size: 9250,
      leverage: 5,
      pnl: -650,
      pnlPercent: -35.14,
      closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  return (
    <Card className="bg-card border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Position History</h2>

      <div className="space-y-3">
        {history.map((position) => {
          const isProfitable = position.pnl >= 0

          return (
            <div key={position.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-base font-bold font-mono text-foreground">{position.asset}</div>
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      position.side === "long" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {position.leverage}x {position.side.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTime(position.closedAt)}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-base font-mono font-bold flex items-center gap-1 justify-end ${isProfitable ? "text-primary" : "text-destructive"}`}
                  >
                    {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isProfitable ? "+" : ""}${position.pnl.toFixed(2)}
                  </div>
                  <div className={`text-xs font-mono ${isProfitable ? "text-primary" : "text-destructive"}`}>
                    {isProfitable ? "+" : ""}
                    {position.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Entry</div>
                  <div className="text-sm font-mono text-foreground">${position.entryPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Exit</div>
                  <div className="text-sm font-mono text-foreground">${position.exitPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Size</div>
                  <div className="text-sm font-mono text-foreground">${position.size.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
