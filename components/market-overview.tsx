"use client"

import { Card } from "@/components/ui/card"
import { PriceTicker } from "@/components/price-ticker"

const MARKETS = [
  { asset: "ETH/yUSDe", name: "Ethereum" },
  { asset: "BTC/yUSDe", name: "Bitcoin" },
  { asset: "SOL/yUSDe", name: "Solana" },
  { asset: "ARB/yUSDe", name: "Arbitrum" },
]

export function MarketOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {MARKETS.map((market) => (
        <Card key={market.asset} className="bg-card border-border p-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{market.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{market.asset}</span>
            </div>
            <PriceTicker asset={market.asset} showChange={true} className="text-sm" />
          </div>
        </Card>
      ))}
    </div>
  )
}
