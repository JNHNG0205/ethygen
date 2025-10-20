"use client"

import { usePriceFeed } from "@/hooks/use-price-feed"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PriceTickerProps {
  asset: string
  showChange?: boolean
  className?: string
}

export function PriceTicker({ asset, showChange = true, className = "" }: PriceTickerProps) {
  const { price, change24h, isConnected } = usePriceFeed(asset)

  if (!price) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-muted rounded w-24" />
      </div>
    )
  }

  const isPositive = (change24h || 0) >= 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {isConnected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        <span className={`font-mono font-bold ${isPositive ? "text-primary" : "text-destructive"}`}>
          ${price.toLocaleString()}
        </span>
      </div>
      {showChange && change24h !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-mono ${isPositive ? "text-primary" : "text-destructive"}`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? "+" : ""}
          {change24h.toFixed(2)}%
        </div>
      )}
    </div>
  )
}
