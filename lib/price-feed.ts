"use client"

// Pyth Network price feed IDs for different assets
export const PRICE_FEED_IDS = {
  "ETH/USDC": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "BTC/USDC": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "SOL/USDC": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "ARB/USDC": "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
}

export interface PriceData {
  price: number
  confidence: number
  timestamp: number
  change24h: number
  volume24h: number
}

export class PriceFeedService {
  private static instance: PriceFeedService
  private subscribers: Map<string, Set<(data: PriceData) => void>> = new Map()
  private prices: Map<string, PriceData> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startPriceUpdates()
  }

  static getInstance(): PriceFeedService {
    if (!PriceFeedService.instance) {
      PriceFeedService.instance = new PriceFeedService()
    }
    return PriceFeedService.instance
  }

  private startPriceUpdates() {
    // Initialize with base prices
    this.prices.set("ETH/USDC", {
      price: 2450.32,
      confidence: 0.5,
      timestamp: Date.now(),
      change24h: 2.45,
      volume24h: 45200000,
    })
    this.prices.set("BTC/USDC", {
      price: 42350.0,
      confidence: 1.2,
      timestamp: Date.now(),
      change24h: -0.85,
      volume24h: 892000000,
    })
    this.prices.set("SOL/USDC", {
      price: 96.2,
      confidence: 0.1,
      timestamp: Date.now(),
      change24h: 5.67,
      volume24h: 12300000,
    })
    this.prices.set("ARB/USDC", {
      price: 1.72,
      confidence: 0.01,
      timestamp: Date.now(),
      change24h: -1.23,
      volume24h: 3400000,
    })

    // Simulate real-time price updates
    this.updateInterval = setInterval(() => {
      this.prices.forEach((priceData, asset) => {
        // Simulate price movement with volatility
        const volatility = priceData.price * 0.001 // 0.1% volatility
        const change = (Math.random() - 0.5) * volatility * 2
        const newPrice = priceData.price + change

        const updatedData: PriceData = {
          price: Number.parseFloat(newPrice.toFixed(2)),
          confidence: priceData.confidence,
          timestamp: Date.now(),
          change24h: priceData.change24h + (Math.random() - 0.5) * 0.1,
          volume24h: priceData.volume24h,
        }

        this.prices.set(asset, updatedData)

        // Notify subscribers
        const subscribers = this.subscribers.get(asset)
        if (subscribers) {
          subscribers.forEach((callback) => callback(updatedData))
        }
      })
    }, 1000) // Update every second
  }

  subscribe(asset: string, callback: (data: PriceData) => void): () => void {
    if (!this.subscribers.has(asset)) {
      this.subscribers.set(asset, new Set())
    }

    this.subscribers.get(asset)!.add(callback)

    // Send initial price
    const currentPrice = this.prices.get(asset)
    if (currentPrice) {
      callback(currentPrice)
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(asset)
      if (subscribers) {
        subscribers.delete(callback)
      }
    }
  }

  getCurrentPrice(asset: string): PriceData | undefined {
    return this.prices.get(asset)
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
  }
}
