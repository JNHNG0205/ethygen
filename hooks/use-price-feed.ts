"use client"

import { useEffect, useState } from "react"
import { PriceFeedService, type PriceData } from "@/lib/price-feed"

export function usePriceFeed(asset: string) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const priceFeed = PriceFeedService.getInstance()
    setIsConnected(true)

    // Normalize aliases: treat yUSDe pairs as equivalent to USDC pairs for live Pyth data
    const canonicalAsset = asset.includes("yUSDe") ? asset.replace("/yUSDe", "/USDC") : asset

    const unsubscribe = priceFeed.subscribe(canonicalAsset, (data) => {
      setPriceData(data)
    })

    // If asset is an alias (e.g., BTC/yUSDe), also seed the local map so components expecting the alias still work
    // Note: PriceFeedService will update canonicalAsset; components still request with their alias but receive canonical data.

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [asset])

  return {
    priceData,
    isConnected,
    price: priceData?.price,
    change24h: priceData?.change24h,
    volume24h: priceData?.volume24h,
  }
}
