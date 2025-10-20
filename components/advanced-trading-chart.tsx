"use client"

import { useEffect, useState } from "react"
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown } from "lucide-react"
import { usePriceFeed } from "@/hooks/use-price-feed"
import { ChartToolsSidebar, type ChartTool } from "@/components/chart-tools-sidebar"

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartData {
  time: string
  price: number
  volume: number
  ema20?: number
  ema50?: number
}

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"] as const
type Timeframe = (typeof TIMEFRAMES)[number]

export function AdvancedTradingChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("5m")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [showIndicators, setShowIndicators] = useState(true)
  const [activeTool, setActiveTool] = useState<ChartTool>("cursor")

  const { price: currentPrice, change24h, isConnected } = usePriceFeed("ETH/USDC")

  useEffect(() => {
    const generateData = () => {
      const data: ChartData[] = []
      let basePrice = currentPrice || 2400
      const dataPoints = 100

      for (let i = 0; i < dataPoints; i++) {
        const trend = Math.sin(i / 10) * 20
        const volatility = (Math.random() - 0.5) * 10
        const price = basePrice + trend + volatility

        const ema20 =
          data.length >= 20
            ? calculateEMA(
                data.slice(-20).map((d) => d.price),
                20,
              )
            : undefined
        const ema50 =
          data.length >= 50
            ? calculateEMA(
                data.slice(-50).map((d) => d.price),
                50,
              )
            : undefined

        data.push({
          time: new Date(Date.now() - (dataPoints - i) * 5 * 60 * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: Number.parseFloat(price.toFixed(2)),
          volume: Math.random() * 1000 + 500,
          ema20,
          ema50,
        })

        basePrice = price
      }

      return data
    }

    setChartData(generateData())
  }, [currentPrice, timeframe])

  useEffect(() => {
    if (!currentPrice) return

    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev.slice(1)]

        newData.push({
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: currentPrice,
          volume: Math.random() * 1000 + 500,
          ema20: calculateEMA(
            newData.slice(-20).map((d) => d.price),
            20,
          ),
          ema50: calculateEMA(
            newData.slice(-50).map((d) => d.price),
            50,
          ),
        })

        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [currentPrice])

  const calculateEMA = (prices: number[], period: number): number => {
    const k = 2 / (period + 1)
    let ema = prices[0]
    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k)
    }
    return Number.parseFloat(ema.toFixed(2))
  }

  const isPriceUp = (change24h || 0) >= 0

  const handleToolChange = (tool: ChartTool) => {
    if (tool === "clear") {
      console.log("[v0] Clearing all chart drawings")
      setActiveTool("cursor")
    } else {
      setActiveTool(tool)
      console.log("[v0] Active tool:", tool)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTool("cursor")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="h-full w-full bg-black flex">
      <ChartToolsSidebar activeTool={activeTool} onToolChange={handleToolChange} />

      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">ETH/USDC</div>
                {isConnected && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
              <div className={`text-2xl font-mono font-bold ${isPriceUp ? "text-primary" : "text-destructive"}`}>
                ${currentPrice?.toFixed(2) || "0.00"}
              </div>
              <div
                className={`text-xs font-mono flex items-center gap-1 ${isPriceUp ? "text-primary" : "text-destructive"}`}
              >
                {isPriceUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPriceUp ? "+" : ""}
                {change24h?.toFixed(2) || "0.00"}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={`h-7 px-3 text-xs font-mono ${
                  timeframe === tf ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tf}
              </Button>
            ))}
          </div>

          <Button
            variant={showIndicators ? "default" : "outline"}
            size="sm"
            onClick={() => setShowIndicators(!showIndicators)}
            className={showIndicators ? "bg-primary text-black" : ""}
          >
            Indicators
          </Button>
        </div>

        <div className="flex-1 p-4">
          <ResponsiveContainer width="100%" height="70%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPriceUp ? "#00d4ff" : "#d50000"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPriceUp ? "#00d4ff" : "#d50000"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="time" stroke="#a0a0a0" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis
                stroke="#a0a0a0"
                tick={{ fontSize: 10 }}
                domain={["dataMin - 10", "dataMax + 10"]}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1e1e1e",
                  borderRadius: "6px",
                  color: "#ffffff",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPriceUp ? "#00d4ff" : "#d50000"}
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
              {showIndicators && <Line type="monotone" dataKey="ema20" stroke="#00d4ff" strokeWidth={1} dot={false} />}
              {showIndicators && <Line type="monotone" dataKey="ema50" stroke="#ff9500" strokeWidth={1} dot={false} />}
            </AreaChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height="30%">
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="time" stroke="#a0a0a0" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis
                stroke="#a0a0a0"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1e1e1e",
                  borderRadius: "6px",
                  color: "#ffffff",
                }}
                formatter={(value: number) => [value.toFixed(0), "Volume"]}
              />
              <Bar dataKey="volume" fill="#333333" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {showIndicators && (
          <div className="px-4 pb-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-muted-foreground">EMA 20</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ff9500]" />
              <span className="text-muted-foreground">EMA 50</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
