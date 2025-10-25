"use client"

// Pyth Network price feed IDs for different assets
// yUSDe pairs mirror USDC prices (1:1 peg assumption)
export const PRICE_FEED_IDS: Record<string, string> = {
  "ETH/USDC": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "BTC/USDC": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "SOL/USDC": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "ARB/USDC": "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
  // yUSDe pairs - mirror USDC prices
  "ETH/yUSDe": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  "BTC/yUSDe": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  "SOL/yUSDe": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "ARB/yUSDe": "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
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

  private async fetchPythPrice(asset: string): Promise<void> {
    const feedId = PRICE_FEED_IDS[asset as keyof typeof PRICE_FEED_IDS]
    if (!feedId) return

    try {
      const configured = process.env.NEXT_PUBLIC_PYTH_HERMES_URL?.trim()
      const network = (process.env.NEXT_PUBLIC_PYTH_NETWORK || "mainnet").toLowerCase().trim()
      const defaultBase = network === "testnet" ? "https://hermes-beta.pyth.network" : "https://hermes.pyth.network"
      const baseUrl = (configured || defaultBase).replace(/\/$/, "")
      const url = `${baseUrl}/v2/updates/price/latest?ids[]=${feedId}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.parsed && data.parsed[0]) {
        const priceData = data.parsed[0].price
        const price = Number(priceData.price) * Math.pow(10, priceData.expo)
        const confidence = Number(priceData.conf) * Math.pow(10, priceData.expo)
        
        // Get previous price for 24h change calculation
        const previousPrice = this.prices.get(asset)
        const change24h = previousPrice 
          ? ((price - previousPrice.price) / previousPrice.price) * 100 
          : 0

        const updatedData: PriceData = {
          price: Number(price.toFixed(2)),
          confidence: Number(confidence.toFixed(2)),
          timestamp: Date.now(),
          change24h: Number(change24h.toFixed(2)),
          volume24h: previousPrice?.volume24h || 45200000, // Volume not available from Pyth, use default
        }

        this.prices.set(asset, updatedData)

        // Notify subscribers
        const subscribers = this.subscribers.get(asset)
        if (subscribers) {
          subscribers.forEach((callback) => callback(updatedData))
        }
      }
    } catch (error) {
      console.error(`Failed to fetch Pyth price for ${asset}:`, error)
    }
  }

  private startPriceUpdates() {
    // Fetch all prices immediately
    Object.keys(PRICE_FEED_IDS).forEach(asset => {
      this.fetchPythPrice(asset)
    })

    // Update prices every 3 seconds from Pyth Network
    this.updateInterval = setInterval(() => {
      Object.keys(PRICE_FEED_IDS).forEach(asset => {
        this.fetchPythPrice(asset)
      })
    }, 3000) // Update every 3 seconds
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
