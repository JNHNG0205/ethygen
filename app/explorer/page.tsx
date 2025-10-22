"use client"

import { useState, useMemo } from "react"
import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import { useTradingEvents } from "@/hooks/use-trading-events"
import { usePrivy } from "@privy-io/react-auth"

type TxRow = {
  hash: string
  type: "Long" | "Short" | "Close" | "Liquidation"
  pair: string
  size: number
  price: number
  timestamp: number
  trader: string
  pnl?: number
  status: "Success" | "Pending" | "Failed"
}

interface Stats {
  totalVolume24h: number
  totalTrades24h: number
  totalTraders24h: number
  avgTradeSize: number
}

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "long" | "short" | "close" | "liquidation">("all")
  const { user } = usePrivy()
  const userAddress = (user as any)?.wallet?.address as string | undefined
  const { events, loading } = useTradingEvents({ user: userAddress, limit: 100, refetchMs: 5000 })

  // Map events to UI rows
  const transactions: TxRow[] = useMemo(() => {
    return events.map((e) => {
      const priceNum = Number(e.price)
      const sizeNum = Number(e.size)
      const type = e.side?.toLowerCase() === "long" ? "Long" : e.side?.toLowerCase() === "short" ? "Short" : "Long"
      return {
        hash: e.transactionHash,
        type,
        pair: "ETH/USDC", // If your index includes pair/market, replace here
        size: sizeNum,
        price: priceNum,
        timestamp: new Date(e.blockTimestamp).getTime(),
        trader: e.user,
        status: "Success" as const,
        pnl: undefined,
      }
    })
  }, [events])

  const stats: Stats = useMemo(() => {
    const volume = transactions.reduce((acc, tx) => acc + (tx.size || 0) * (tx.price || 0), 0)
    const uniqueTraders = new Set(transactions.map((tx) => tx.trader?.toLowerCase())).size
    return {
      totalVolume24h: volume,
      totalTrades24h: transactions.length,
      totalTraders24h: uniqueTraders,
      avgTradeSize: transactions.length ? volume / transactions.length : 0,
    }
  }, [transactions])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filter === "all" || tx.type.toLowerCase() === filter
    const matchesSearch =
      searchQuery === "" ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.trader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.pair.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <TopNav />

      <main className="mt-[60px] mb-[80px] px-4 py-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Explorer</h1>
          <p className="text-muted-foreground">Real-time transaction monitoring and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">24h Volume</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              ${stats.totalVolume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">24h Trades</span>
            </div>
            <p className="text-2xl font-bold font-mono">{stats.totalTrades24h.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Active Traders</span>
            </div>
            <p className="text-2xl font-bold font-mono">{stats.totalTraders24h.toLocaleString()}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg Trade Size</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              ${stats.avgTradeSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction hash, address, or pair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All
              </Button>
              <Button
                variant={filter === "long" ? "default" : "outline"}
                onClick={() => setFilter("long")}
                className={filter === "long" ? "bg-primary text-primary-foreground" : ""}
              >
                Long
              </Button>
              <Button
                variant={filter === "short" ? "default" : "outline"}
                onClick={() => setFilter("short")}
                className={filter === "short" ? "bg-primary text-primary-foreground" : ""}
              >
                Short
              </Button>
              <Button
                variant={filter === "close" ? "default" : "outline"}
                onClick={() => setFilter("close")}
                className={filter === "close" ? "bg-primary text-primary-foreground" : ""}
              >
                Close
              </Button>
              <Button
                variant={filter === "liquidation" ? "default" : "outline"}
                onClick={() => setFilter("liquidation")}
                className={filter === "liquidation" ? "bg-primary text-primary-foreground" : ""}
              >
                Liquidation
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction Hash</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pair</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Size</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">PnL</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Trader</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">Loading indexed trades…</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">No trades yet—start trading!</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </a>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "Long"
                            ? "bg-primary/20 text-primary"
                            : tx.type === "Short"
                              ? "bg-destructive/20 text-destructive"
                              : tx.type === "Liquidation"
                                ? "bg-orange-500/20 text-orange-500"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{tx.pair}</td>
                    <td className="p-4 text-right font-mono text-sm">{tx.size.toFixed(4)}</td>
                    <td className="p-4 text-right font-mono text-sm">${tx.price.toLocaleString()}</td>
                    <td className="p-4 text-right font-mono text-sm">
                      {tx.pnl !== undefined ? (
                        <span className={tx.pnl >= 0 ? "text-primary" : "text-destructive"}>
                          {tx.pnl >= 0 ? "+" : ""}${tx.pnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground hover:text-primary cursor-pointer">
                        {tx.trader}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs text-primary`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Success
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-muted-foreground">{formatTime(tx.timestamp)}</td>
                  </tr>
                ))) }
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
