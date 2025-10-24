"use client"

import { useEffect, useState } from "react"

interface TradingViewPriceData {
  price: number
  change24h: number
  volume24h: number
  isConnected: boolean
}

// Base prices for each asset (realistic current prices)
const BASE_PRICES: Record<string, number> = {
  "ETH/yUSDe": 3974.85,
  "BTC/yUSDe": 67890.12,
  "SOL/yUSDe": 145.67,
  "ARB/yUSDe": 1.23,
}

export function useTradingViewPrice(asset: string) {
  const [priceData, setPriceData] = useState<TradingViewPriceData>({
    price: 0,
    change24h: 0,
    volume24h: 0,
    isConnected: false,
  })

  useEffect(() => {
    const basePrice = BASE_PRICES[asset]
    if (!basePrice) {
      console.warn(`No base price found for asset: ${asset}`)
      return
    }

    // Generate realistic price data
    const generatePriceData = () => {
      // Add realistic price variation (±0.5% max)
      const variation = (Math.random() - 0.5) * basePrice * 0.005
      const currentPrice = basePrice + variation
      
      // Generate realistic 24h change (-5% to +5%)
      const change24h = (Math.random() - 0.5) * 10
      
      setPriceData({
        price: Number(currentPrice.toFixed(2)),
        change24h: Number(change24h.toFixed(2)),
        volume24h: 45200000,
        isConnected: true,
      })
    }

    // Generate data immediately
    generatePriceData()

    // Update every 3 seconds to simulate live data
    const interval = setInterval(generatePriceData, 3000)

    return () => clearInterval(interval)
  }, [asset])

  return {
    price: priceData.price,
    change24h: priceData.change24h,
    volume24h: priceData.volume24h,
    isConnected: priceData.isConnected,
  }
}
