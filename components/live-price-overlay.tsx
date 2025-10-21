"use client"

import { usePriceFeed } from "@/hooks/use-price-feed"
import { TrendingUp, TrendingDown } from "lucide-react"

interface LivePriceOverlayProps {
  asset: string
}

export function LivePriceOverlay({ asset }: LivePriceOverlayProps) {
  const { price, change24h, isConnected } = usePriceFeed(asset)

  if (!price) return null

  const isPositive = (change24h || 0) >= 0

  return (
    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm border border-[#1e1e1e] rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Live Pyth Price" />
          )}
          <span className="text-xs text-muted-foreground font-medium">{asset}</span>
        </div>
        <div className={`text-2xl font-bold font-mono ${isPositive ? "text-primary" : "text-destructive"}`}>
          ${price.toLocaleString()}
        </div>
        {change24h !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-mono ${isPositive ? "text-primary" : "text-destructive"}`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? "+" : ""}
            {change24h.toFixed(2)}%
          </div>
        )}
      </div>
    </div>
  )
}
