"use client"

import { usePriceFeed } from "@/hooks/use-price-feed"
import { useTradingViewPrice } from "@/hooks/use-tradingview-price"

interface UnifiedPriceResult {
  price: number | undefined
  change24h: number | undefined
  volume24h: number | undefined
  isConnected: boolean
  source: "pyth" | "tradingview"
}

export function useUnifiedPrice(asset: string): UnifiedPriceResult {
  const pyth = usePriceFeed(asset)
  const tv = useTradingViewPrice(asset)

  // Prefer Pyth feed when it has a valid numeric price
  const hasPyth = typeof pyth.price === "number" && !Number.isNaN(pyth.price)

  if (hasPyth) {
    return {
      price: pyth.price,
      change24h: pyth.change24h,
      volume24h: pyth.volume24h,
      isConnected: pyth.isConnected ?? false,
      source: "pyth",
    }
  }

  // Fallback to simulated TradingView price
  return {
    price: tv.price || undefined,
    change24h: tv.change24h || undefined,
    volume24h: tv.volume24h || undefined,
    isConnected: tv.isConnected || false,
    source: "tradingview",
  }
}
