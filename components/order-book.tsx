"use client"

import { useEffect, useState } from "react"

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

export function OrderBook() {
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    // Mock order book data - replace with real Pyth/API data
    const mockAsks: OrderBookEntry[] = Array.from({ length: 15 }, (_, i) => ({
      price: 2450.5 + i * 0.5,
      size: Math.random() * 10,
      total: Math.random() * 100,
    })).reverse()

    const mockBids: OrderBookEntry[] = Array.from({ length: 15 }, (_, i) => ({
      price: 2450.0 - i * 0.5,
      size: Math.random() * 10,
      total: Math.random() * 100,
    }))

    setAsks(mockAsks)
    setBids(mockBids)
    setSpread(mockAsks[mockAsks.length - 1].price - mockBids[0].price)
  }, [])

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="p-3 border-b border-[#1e1e1e]">
        <h3 className="text-sm font-semibold text-foreground">Order Book</h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col text-xs font-mono">
        {/* Header */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2 text-muted-foreground border-b border-[#1e1e1e]">
          <div className="text-left">Price</div>
          <div className="text-right">Size</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sells) */}
        <div className="flex-1 overflow-y-auto">
          {asks.map((ask, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1 hover:bg-[#1e1e1e] relative group">
              <div className="absolute inset-0 bg-destructive/10" style={{ width: `${(ask.total / 100) * 100}%` }} />
              <div className="text-destructive relative z-10">{ask.price.toFixed(2)}</div>
              <div className="text-right text-foreground relative z-10">{ask.size.toFixed(4)}</div>
              <div className="text-right text-muted-foreground relative z-10">{ask.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-3 py-2 bg-[#0f0f0f] border-y border-primary/30 text-center">
          <span className="text-primary font-semibold">Spread: ${spread.toFixed(2)}</span>
        </div>

        {/* Bids (Buys) */}
        <div className="flex-1 overflow-y-auto">
          {bids.map((bid, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 gap-2 px-3 py-1 hover:bg-[#1e1e1e] relative group">
              <div className="absolute inset-0 bg-primary/10" style={{ width: `${(bid.total / 100) * 100}%` }} />
              <div className="text-primary relative z-10">{bid.price.toFixed(2)}</div>
              <div className="text-right text-foreground relative z-10">{bid.size.toFixed(4)}</div>
              <div className="text-right text-muted-foreground relative z-10">{bid.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
