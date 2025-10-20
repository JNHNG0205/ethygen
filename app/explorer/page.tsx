"use client"

import { useState, useEffect } from "react"
import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"

interface Transaction {
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats>({
    totalVolume24h: 0,
    totalTrades24h: 0,
    totalTraders24h: 0,
    avgTradeSize: 0,
  })
  const [filter, setFilter] = useState<"all" | "long" | "short" | "close" | "liquidation">("all")

  // Generate mock transaction data
  useEffect(() => {
    const generateTransactions = () => {
      const types: Transaction["type"][] = ["Long", "Short", "Close", "Liquidation"]
      const pairs = ["ETH/USDC", "BTC/USDC", "SOL/USDC", "ARB/USDC"]
      const statuses: Transaction["status"][] = ["Success", "Success", "Success", "Pending"]

      const txs: Transaction[] = Array.from({ length: 50 }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)]
        const pair = pairs[Math.floor(Math.random() * pairs.length)]
        const size = Math.random() * 10 + 0.1
        const price = pair.includes("ETH")
          ? 3000 + Math.random() * 200
          : pair.includes("BTC")
            ? 65000 + Math.random() * 5000
            : pair.includes("SOL")
              ? 100 + Math.random() * 20
              : 1.5 + Math.random() * 0.5

        return {
          hash: `0x${Math.random().toString(16).slice(2, 18)}...${Math.random().toString(16).slice(2, 6)}`,
          type,
          pair,
          size: Number(size.toFixed(4)),
          price: Number(price.toFixed(2)),
          timestamp: Date.now() - Math.random() * 3600000,
          trader: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          pnl: type === "Close" ? (Math.random() - 0.5) * 1000 : undefined,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        }
      })

      setTransactions(txs)

      // Calculate stats
      const volume = txs.reduce((acc, tx) => acc + tx.size * tx.price, 0)
      const uniqueTraders = new Set(txs.map((tx) => tx.trader)).size

      setStats({
        totalVolume24h: volume,
        totalTrades24h: txs.length,
        totalTraders24h: uniqueTraders,
        avgTradeSize: volume / txs.length,
      })
    }

    generateTransactions()
    const interval = setInterval(generateTransactions, 5000)
    return () => clearInterval(interval)
  }, [])

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
                {filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary hover:underline cursor-pointer">{tx.hash}</span>
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
                        className={`inline-flex items-center gap-1 text-xs ${
                          tx.status === "Success"
                            ? "text-primary"
                            : tx.status === "Pending"
                              ? "text-yellow-500"
                              : "text-destructive"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "Success"
                              ? "bg-primary"
                              : tx.status === "Pending"
                                ? "bg-yellow-500 animate-pulse"
                                : "bg-destructive"
                          }`}
                        />
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-muted-foreground">{formatTime(tx.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
