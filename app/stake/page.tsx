"use client"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowDownUp } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Mock price data for xSOL
const priceData = [
  { date: "Sep 23", price: 3200 },
  { date: "Sep 26", price: 2800 },
  { date: "Sep 29", price: 2400 },
  { date: "Oct 2", price: 2200 },
  { date: "Oct 5", price: 2600 },
  { date: "Oct 8", price: 2900 },
  { date: "Oct 11", price: 2400 },
  { date: "Oct 14", price: 2200 },
  { date: "Oct 17", price: 2500 },
  { date: "Oct 20", price: 1656 },
]

export default function StakePage() {
  const [activeTab, setActiveTab] = useState<"price" | "leverage">("price")
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("30d")
  const [overviewTab, setOverviewTab] = useState<"overview" | "position">("overview")
  const [supplyAmount, setSupplyAmount] = useState("")
  const [receiveAmount, setReceiveAmount] = useState("")

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-auto">
        <div className="container mx-auto p-8 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel - Market Overview Chart */}
            <div className="lg:col-span-5">
              <Card className="bg-[#0d0d0d] border-[#1f1f1f] p-8 h-full">
                <h2 className="text-2xl font-bold mb-8 text-white">Market Overview</h2>

                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-[#1f1f1f]">
                  <button
                    onClick={() => setActiveTab("price")}
                    className={`pb-4 relative transition-colors ${
                      activeTab === "price" ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base">Price</span>
                      <span className="text-sm text-green-400 font-medium">+2.72%</span>
                    </div>
                    {activeTab === "price" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
                  </button>
                  <button
                    onClick={() => setActiveTab("leverage")}
                    className={`pb-4 relative transition-colors ${
                      activeTab === "leverage" ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-base">Leverage</span>
                      <span className="text-sm text-green-400 font-medium">x2.08</span>
                    </div>
                    {activeTab === "leverage" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                    )}
                  </button>
                </div>

                {/* Timeframe Selector */}
                <div className="flex gap-3 mb-8">
                  {(["24h", "7d", "30d"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                        timeframe === tf
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-[#1a1a1a] text-muted-foreground hover:text-white hover:bg-[#222]"
                      }`}
                    >
                      {tf === "24h" ? "24 hours" : tf === "7d" ? "7 days" : "30 days"}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div className="h-[420px] -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#333"
                        tick={{ fill: "#666", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "#1f1f1f" }}
                      />
                      <YAxis
                        stroke="#333"
                        tick={{ fill: "#666", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "#1f1f1f" }}
                        domain={[1500, 3500]}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d0d0d",
                          border: "1px solid #2a2a2a",
                          borderRadius: "12px",
                          color: "#fff",
                          padding: "12px 16px",
                        }}
                        labelStyle={{ color: "#999", marginBottom: "4px" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                        fill="url(#priceGradient)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Current Price Label */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-base font-mono font-semibold shadow-lg shadow-indigo-600/20">
                    $1.656
                  </div>
                  <div className="text-muted-foreground text-sm font-mono">$1.500</div>
                </div>
              </Card>
            </div>

            {/* Right Panel - Overview & Minting */}
            <div className="lg:col-span-7">
              <Card className="bg-[#0d0d0d] border-[#1f1f1f] p-8">
                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-[#1f1f1f]">
                  <button
                    onClick={() => setOverviewTab("overview")}
                    className={`pb-4 relative transition-colors ${
                      overviewTab === "overview" ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <span className="font-semibold text-base">Overview</span>
                    {overviewTab === "overview" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                  </button>
                  <button
                    onClick={() => setOverviewTab("position")}
                    className={`pb-4 relative transition-colors ${
                      overviewTab === "position" ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <span className="font-semibold text-base">My Position</span>
                    {overviewTab === "position" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                  </button>
                </div>

                {overviewTab === "overview" ? (
                  <div className="space-y-8">
                    {/* Token Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                          <span className="text-white font-bold text-xl">≡</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">xSOL</h2>
                      </div>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30">
                        Mint →
                      </Button>
                    </div>

                    {/* Description */}
                    <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
                      <p className="text-muted-foreground leading-relaxed text-base">
                        Leveraged SOL token providing amplified exposure to SOL price movements without ongoing costs or
                        liquidation risk.
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
                        <div className="text-muted-foreground text-sm mb-2 font-medium">24H Price Change</div>
                        <div className="text-3xl font-bold text-green-400">2.722%</div>
                      </div>
                      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
                        <div className="text-muted-foreground text-sm mb-2 font-medium">Total Value</div>
                        <div className="text-3xl font-bold text-white">$23,326,847</div>
                      </div>
                      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
                        <div className="text-muted-foreground text-sm mb-2 font-medium">Price</div>
                        <div className="text-3xl font-bold text-white">$1.656</div>
                      </div>
                      <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-6">
                        <div className="text-muted-foreground text-sm mb-2 font-medium">Effective Leverage</div>
                        <div className="text-3xl font-bold text-green-400">x2.060</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#2a2a2a] h-14 text-base font-semibold justify-between group transition-all">
                      Go to Portfolio
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Token Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                          <span className="text-white font-bold text-xl">≡</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">xSOL</h2>
                      </div>
                      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2">
                        <div className="text-xs text-muted-foreground mb-0.5">APY</div>
                        <div className="text-sm font-semibold text-green-400">0.2%</div>
                      </div>
                    </div>

                    {/* Supply Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-medium text-muted-foreground">You supply</span>
                        <span className="text-sm font-mono text-muted-foreground">$0</span>
                      </div>
                      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-600/20">
                              <span className="text-white text-sm font-bold">$</span>
                            </div>
                            <span className="font-semibold text-white text-lg">hyUSD</span>
                          </div>
                          <Input
                            type="number"
                            value={supplyAmount}
                            onChange={(e) => setSupplyAmount(e.target.value)}
                            placeholder="0"
                            className="bg-transparent border-none text-right text-3xl font-bold w-40 p-0 h-auto focus-visible:ring-0 text-white"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Balance: 0</span>
                          <div className="flex gap-3">
                            <button className="text-muted-foreground hover:text-white font-semibold transition-colors">
                              HALF
                            </button>
                            <button className="text-muted-foreground hover:text-white font-semibold transition-colors">
                              MAX
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Swap Icon */}
                    <div className="flex justify-center -my-2">
                      <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-[#2a2a2a] flex items-center justify-center hover:border-indigo-600 transition-colors cursor-pointer">
                        <ArrowDownUp className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Receive Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-medium text-muted-foreground">You get</span>
                        <span className="text-sm font-mono text-muted-foreground">$0</span>
                      </div>
                      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                              <span className="text-white text-sm font-bold">≡</span>
                            </div>
                            <span className="font-semibold text-white text-lg">xSOL</span>
                          </div>
                          <Input
                            type="number"
                            value={receiveAmount}
                            onChange={(e) => setReceiveAmount(e.target.value)}
                            placeholder="0"
                            className="bg-transparent border-none text-right text-3xl font-bold w-40 p-0 h-auto focus-visible:ring-0 text-white"
                            readOnly
                          />
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground font-medium">Balance: 0</span>
                        </div>
                      </div>
                    </div>

                    {/* Mint Button */}
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 text-lg font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all">
                      Mint
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
