"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

type OrderBookView = "all" | "bids" | "asks"

export function EnhancedOrderBook() {
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)
  const [spreadPercent, setSpreadPercent] = useState(0)
  const [view, setView] = useState<OrderBookView>("all")
  const [maxTotal, setMaxTotal] = useState(0)

  // Generate and update order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 2450.0
      const numOrders = 20

      // Generate asks (sell orders)
      const newAsks: OrderBookEntry[] = []
      let askTotal = 0
      for (let i = 0; i < numOrders; i++) {
        const price = basePrice + 0.5 + i * 0.5
        const size = Math.random() * 5 + 0.5
        askTotal += size
        newAsks.push({
          price: Number.parseFloat(price.toFixed(2)),
          size: Number.parseFloat(size.toFixed(4)),
          total: Number.parseFloat(askTotal.toFixed(4)),
        })
      }

      // Generate bids (buy orders)
      const newBids: OrderBookEntry[] = []
      let bidTotal = 0
      for (let i = 0; i < numOrders; i++) {
        const price = basePrice - i * 0.5
        const size = Math.random() * 5 + 0.5
        bidTotal += size
        newBids.push({
          price: Number.parseFloat(price.toFixed(2)),
          size: Number.parseFloat(size.toFixed(4)),
          total: Number.parseFloat(bidTotal.toFixed(4)),
        })
      }

      setAsks(newAsks)
      setBids(newBids)

      // Calculate spread
      const bestAsk = newAsks[0].price
      const bestBid = newBids[0].price
      const spreadValue = bestAsk - bestBid
      setSpread(spreadValue)
      setSpreadPercent((spreadValue / bestBid) * 100)

      // Calculate max total for depth visualization
      setMaxTotal(Math.max(askTotal, bidTotal))
    }

    generateOrderBook()

    // Update order book every 1 second
    const interval = setInterval(() => {
      generateOrderBook()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handlePriceClick = (price: number) => {
    // This would trigger the trade executor to populate with the clicked price
    console.log("Price clicked:", price)
  }

  const renderOrderRow = (order: OrderBookEntry, type: "ask" | "bid", index: number) => {
    const depthPercent = (order.total / maxTotal) * 100
    const isAsk = type === "ask"

    return (
      <div
        key={`${type}-${index}`}
        className="grid grid-cols-3 gap-2 px-3 py-1 hover:bg-[#1e1e1e] relative group cursor-pointer transition-colors"
        onClick={() => handlePriceClick(order.price)}
      >
        {/* Depth visualization */}
        <div
          className={`absolute inset-0 ${isAsk ? "bg-destructive/10" : "bg-primary/10"} transition-all`}
          style={{ width: `${depthPercent}%`, right: isAsk ? 0 : "auto", left: isAsk ? "auto" : 0 }}
        />

        {/* Price */}
        <div className={`relative z-10 font-mono text-sm ${isAsk ? "text-destructive" : "text-primary"}`}>
          {order.price.toFixed(2)}
        </div>

        {/* Size */}
        <div className="text-right text-foreground relative z-10 font-mono text-sm">{order.size.toFixed(4)}</div>

        {/* Total */}
        <div className="text-right text-muted-foreground relative z-10 font-mono text-xs">{order.total.toFixed(2)}</div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Order Book</h3>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as OrderBookView)} className="h-7">
          <TabsList className="h-7 bg-card p-0.5">
            <TabsTrigger
              value="all"
              className="h-6 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="h-6 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Bids
            </TabsTrigger>
            <TabsTrigger
              value="asks"
              className="h-6 px-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              Asks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-muted-foreground border-b border-[#1e1e1e] font-mono">
        <div className="text-left">Price (USDC)</div>
        <div className="text-right">Size (ETH)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Order Book Content */}
      <div className="flex-1 overflow-hidden flex flex-col text-xs font-mono">
        {/* Asks (Sells) */}
        {(view === "all" || view === "asks") && (
          <div className={`${view === "all" ? "flex-1" : "flex-1"} overflow-y-auto flex flex-col-reverse`}>
            {asks.slice(0, view === "all" ? 10 : 20).map((ask, i) => renderOrderRow(ask, "ask", i))}
          </div>
        )}

        {/* Spread */}
        {view === "all" && (
          <div className="px-3 py-2 bg-[#0f0f0f] border-y border-primary/30 flex items-center justify-between">
            <span className="text-primary font-semibold text-sm">${spread.toFixed(2)}</span>
            <span className="text-muted-foreground text-xs">Spread {spreadPercent.toFixed(3)}%</span>
          </div>
        )}

        {/* Bids (Buys) */}
        {(view === "all" || view === "bids") && (
          <div className={`${view === "all" ? "flex-1" : "flex-1"} overflow-y-auto`}>
            {bids.slice(0, view === "all" ? 10 : 20).map((bid, i) => renderOrderRow(bid, "bid", i))}
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="p-3 border-t border-[#1e1e1e] grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-muted-foreground mb-1">24h Volume</div>
          <div className="font-mono font-semibold text-foreground">$45.2M</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">24h High/Low</div>
          <div className="font-mono text-xs">
            <span className="text-primary">$2,485</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-destructive">$2,398</span>
          </div>
        </div>
      </div>
    </div>
  )
}
