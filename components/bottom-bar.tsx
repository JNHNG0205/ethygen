"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"

export function BottomBar() {
  const totalEquity = 12450.32
  const pnl = 245.67
  const isProfitable = pnl > 0
  const availableMargin = 8234.5
  const openPositions = 3
  const fundingRate = -0.0023

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-black border-t border-[#1e1e1e] z-40 flex items-center justify-between px-6">
      {/* Left: Equity and Margin */}
      <div className="flex items-center gap-8">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Total Equity</div>
          <div className={`text-xl font-mono font-bold ${isProfitable ? "text-primary" : "text-destructive"}`}>
            ${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div
            className={`text-xs font-mono flex items-center gap-1 ${isProfitable ? "text-primary" : "text-destructive"}`}
          >
            {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isProfitable ? "+" : ""}
            {pnl.toFixed(2)} ({((pnl / totalEquity) * 100).toFixed(2)}%)
          </div>
        </div>

        <div className="h-12 w-px bg-border" />

        <div>
          <div className="text-xs text-muted-foreground mb-1">Available Margin</div>
          <div className="text-lg font-mono font-semibold text-foreground">
            ${availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground">yUSDe Balance</div>
        </div>
      </div>

      {/* Center: Open Positions */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Open Positions</div>
        <div className="text-2xl font-mono font-bold text-foreground">{openPositions}</div>
      </div>

      {/* Right: Funding Rate and Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Funding Rate</div>
          <div className={`text-lg font-mono font-semibold ${fundingRate < 0 ? "text-destructive" : "text-primary"}`}>
            {fundingRate > 0 ? "+" : ""}
            {(fundingRate * 100).toFixed(4)}%
          </div>
        </div>

        <div className="h-12 w-px bg-border" />

        <Button className="bg-primary text-black hover:bg-primary/90 font-semibold neon-glow">Deposit</Button>
      </div>
    </div>
  )
}
