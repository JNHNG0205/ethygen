"use client"

import { useState } from "react"
import { ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"

const generatePortfolioData = () => {
  const data = []
  const baseValue = 10000
  let currentValue = baseValue

  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.45) * 500
    currentValue += change
    data.push({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: currentValue,
      pnl: currentValue - baseValue,
    })
  }
  return data
}

const portfolioData = generatePortfolioData()

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "perp" | "earn">("overview")
  const [chartView, setChartView] = useState<"account" | "pnl">("account")
  const [timeframe, setTimeframe] = useState<"24H" | "7D" | "14D" | "30D" | "all">("7D")

  // Fresh user state - all zeros
  const totalEquity = 0
  const unrealizedPnL = 0
  const realizedPnL = 0
  const totalVolume = 0
  const marginUsed = 0
  const availableMargin = 0
  const winRate = 0
  const totalTrades = 0
  const fundingPaid = 0

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-y-auto">
        <div className="max-w-[1800px] mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">Portfolio</h1>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 px-1 text-lg font-medium transition-colors relative ${
                  activeTab === "overview" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Overview
                {activeTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
              </button>
              <button
                onClick={() => setActiveTab("perp")}
                className={`pb-3 px-1 text-lg font-medium transition-colors relative ${
                  activeTab === "perp" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Perp
                {activeTab === "perp" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
              </button>
              <button
                onClick={() => setActiveTab("earn")}
                className={`pb-3 px-1 text-lg font-medium transition-colors relative ${
                  activeTab === "earn" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Earn
                {activeTab === "earn" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mb-6">
            {/* Left Sidebar */}
            <div className="space-y-4">
              {/* Account Balance Card */}
              <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Total Equity
                </h3>
                <div className="text-3xl font-bold text-foreground mb-4">
                  ${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2 border-t border-border">
                    <span className="text-sm text-muted-foreground">Unrealized PnL</span>
                    <span
                      className={`text-sm font-mono font-medium ${unrealizedPnL >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {unrealizedPnL >= 0 ? "+" : ""}${unrealizedPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Realized PnL</span>
                    <span
                      className={`text-sm font-mono font-medium ${realizedPnL >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {realizedPnL >= 0 ? "+" : ""}${realizedPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Total Volume (30D)</span>
                    <span className="text-sm font-mono text-foreground">
                      ${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Margin Card */}
              <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Margin</h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Used</span>
                    <span className="text-sm font-mono text-foreground">
                      ${marginUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="text-sm font-mono text-primary">
                      ${availableMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Usage</span>
                      <span className="text-xs font-mono text-foreground">
                        {((marginUsed / totalEquity) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(marginUsed / totalEquity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Stats Card */}
              <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Trading Stats
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="text-sm font-mono text-primary">{winRate}%</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Total Trades</span>
                    <span className="text-sm font-mono text-foreground">{totalTrades}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Funding Paid</span>
                    <span className={`text-sm font-mono ${fundingPaid >= 0 ? "text-primary" : "text-destructive"}`}>
                      ${fundingPaid.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Products</h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Perp Balance</span>
                    <span className="text-sm font-mono text-foreground">$8,234.50</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Spot Balance</span>
                    <span className="text-sm font-mono text-foreground">$2,456.78</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">Earn Balance</span>
                    <span className="text-sm font-mono text-foreground">$2,156.04</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Chart Area */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-6">
              {/* Chart Controls */}
              <div className="flex items-center justify-between mb-6">
                {/* Account/PnL Toggle */}
                <div className="flex items-center gap-2 bg-black border border-border rounded-lg p-1">
                  <button
                    onClick={() => setChartView("account")}
                    className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                      chartView === "account"
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setChartView("pnl")}
                    className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                      chartView === "pnl" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    PnL
                  </button>
                </div>

                {/* Timeframe Selectors */}
                <div className="flex items-center gap-2">
                  {(["24H", "7D", "14D", "30D", "all"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
                        timeframe === tf
                          ? "bg-card border-border text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf === "all" ? "All time" : tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "account" ? (
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="accountGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                      <XAxis dataKey="date" stroke="#666666" style={{ fontSize: "12px" }} tick={{ fill: "#666666" }} />
                      <YAxis
                        stroke="#666666"
                        style={{ fontSize: "12px" }}
                        tick={{ fill: "#666666" }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: "1px solid #1e1e1e",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Account Value"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#00d4ff"
                        strokeWidth={2}
                        fill="url(#accountGradient)"
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={portfolioData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                      <XAxis dataKey="date" stroke="#666666" style={{ fontSize: "12px" }} tick={{ fill: "#666666" }} />
                      <YAxis
                        stroke="#666666"
                        style={{ fontSize: "12px" }}
                        tick={{ fill: "#666666" }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0a0a",
                          border: "1px solid #1e1e1e",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "PnL"]}
                      />
                      <Line type="monotone" dataKey="pnl" stroke="#00d4ff" strokeWidth={2} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Perp Card */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Perpetuals</h3>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
                >
                  Trade now
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Balance</p>
                  <p className="text-2xl font-bold text-foreground">$8,234.50</p>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Margin Used</span>
                    <span className="text-sm font-mono text-foreground">$3,200.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unrealized PnL</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-sm font-mono text-primary">+$847.32</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Open Positions</span>
                    <span className="text-sm font-mono text-foreground">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spot Card */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Spot</h3>
                <Link
                  href="/"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
                >
                  Trade now
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Balance</p>
                  <p className="text-2xl font-bold text-foreground">$2,456.78</p>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available</span>
                    <span className="text-sm font-mono text-primary">$2,156.78</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In Orders</span>
                    <span className="text-sm font-mono text-foreground">$300.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assets</span>
                    <span className="text-sm font-mono text-foreground">5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earn Card */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Earn</h3>
                <Link
                  href="/stake"
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
                >
                  Stake now
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Balance</p>
                  <p className="text-2xl font-bold text-foreground">$2,156.04</p>
                </div>

                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Principal</span>
                    <span className="text-sm font-mono text-foreground">$2,000.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Yield Earned</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      <span className="text-sm font-mono text-primary">+$156.04</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="text-sm font-mono text-primary">7.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
