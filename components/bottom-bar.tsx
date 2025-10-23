"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useMarket } from "@/hooks/use-market"
import { usePriceFeed } from "@/hooks/use-price-feed"
import { usePositions } from "@/hooks/use-positions"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

export function BottomBar() {
  const { asset } = useMarket()
  const { price, change24h, isConnected } = usePriceFeed(asset)
  const { activePositions } = usePositions()
  const { authenticated, login } = usePrivy()
  const router = useRouter()

  // Fresh user defaults
  const totalEquity = 0
  const availableMargin = 0
  const openPositions = activePositions.length
  const fundingRate = 0 // Placeholder; source from venue when available

  const handleDeposit = () => {
    if (!authenticated) {
      login()
      return
    }
    router.push("/vault")
  }

  const hasPrice = typeof price === "number" && !Number.isNaN(price)
  const isPositive = (change24h || 0) >= 0

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-black border-t border-[#1e1e1e] z-40 flex items-center justify-between px-6">
      {/* Left: Market Price (Pyth) and Margin */}
      <div className="flex items-center gap-8">
        <div>
          <div className="text-xs text-muted-foreground mb-1">{asset} Price</div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-mono font-bold text-foreground">
              {hasPrice ? `$${price!.toLocaleString()}` : <span className="animate-pulse text-muted-foreground">Loading…</span>}
            </div>
            {hasPrice && (
              <div className={`text-xs font-mono flex items-center gap-1 ${isPositive ? "text-primary" : "text-destructive"}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}
                {(change24h ?? 0).toFixed(2)}%
                {isConnected && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            )}
          </div>
        </div>

        <div className="h-12 w-px bg-border" />

      </div>

      {/* Center: Open Positions */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-1">Open Positions</div>
        <div className="text-2xl font-mono font-bold text-foreground">{openPositions}</div>
      </div>

      {/* Right: Funding Rate and Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Funding Rate</div>
          <div className={`text-lg font-mono font-semibold ${fundingRate < 0 ? "text-destructive" : "text-primary"}`}>
            {fundingRate > 0 ? "+" : ""}
            {(fundingRate * 100).toFixed(4)}%
          </div>
        </div>

        <div className="h-12 w-px bg-border" />

        <Button onClick={handleDeposit} className="bg-primary text-black hover:bg-primary/90 font-semibold neon-glow">
          {authenticated ? "Deposit" : "Connect to Deposit"}
        </Button>
      </div>
    </div>
  )
}
