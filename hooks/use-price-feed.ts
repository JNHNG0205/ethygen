"use client"

import { useEffect, useState } from "react"
import { PriceFeedService, type PriceData } from "@/lib/price-feed"

export function usePriceFeed(asset: string) {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const priceFeed = PriceFeedService.getInstance()
    setIsConnected(true)

    const unsubscribe = priceFeed.subscribe(asset, (data) => {
      setPriceData(data)
    })

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
