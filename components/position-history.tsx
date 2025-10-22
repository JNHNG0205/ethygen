"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { usePositions } from "@/hooks/use-positions"

export function PositionHistory() {
  const { history } = usePositions()

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

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <TrendingDown className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Position History</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your closed positions will appear here once you close your first trade.
          </p>
        </div>
      ) : (
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
      )}
    </Card>
  )
}
