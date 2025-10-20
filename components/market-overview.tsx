"use client"

import { Card } from "@/components/ui/card"
import { PriceTicker } from "@/components/price-ticker"

const MARKETS = [
  { asset: "ETH/USDC", name: "Ethereum" },
  { asset: "BTC/USDC", name: "Bitcoin" },
  { asset: "SOL/USDC", name: "Solana" },
  { asset: "ARB/USDC", name: "Arbitrum" },
]

export function MarketOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {MARKETS.map((market) => (
        <Card key={market.asset} className="bg-card border-border p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{market.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{market.asset}</span>
            </div>
            <PriceTicker asset={market.asset} showChange={true} />
          </div>
        </Card>
      ))}
    </div>
  )
}
