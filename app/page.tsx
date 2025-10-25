"use client"

import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { EnhancedOrderBook } from "@/components/enhanced-order-book"
import { EnhancedTradeExecutor } from "@/components/enhanced-trade-executor"
import { MarketOverview } from "@/components/market-overview"
import { ContractBalances } from "@/components/contract-balances"
import { NetworkSwitch } from "@/components/network-switch"
import { useUnifiedPrice } from "@/hooks/use-unified-price"
import dynamic from "next/dynamic"

const PythChart = dynamic(() => import("@/components/pyth-chart"), { ssr: false })

// Debug component to test the unified hook
function DebugPriceFeed() {
  const { price, isConnected, source } = useUnifiedPrice("ETH/yUSDe")

  return (
    <div className="fixed top-20 right-4 bg-red-900 text-white p-2 rounded text-xs z-50">
      <div>ETH/yUSDe: {price ? `$${price}` : 'Loading...'}</div>
      <div>Connected: {isConnected ? 'Yes' : 'No'} ({source})</div>
    </div>
  )
}

export default function TradePage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />
      <DebugPriceFeed />
      
      {/* Network Switch - shows when not on Sepolia */}
      <div className="px-4 py-2">
        <NetworkSwitch />
      </div>

      <main className="flex-1 mt-[60px] mb-[80px] overflow-hidden">
        {/* Market Overview Banner - Compact */}
        <div className="p-2 border-b border-[#1e1e1e] bg-[#0a0a0a]">
          <MarketOverview />
        </div>

        <div className="h-[calc(100%-80px)] grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Chart - 50% on desktop */}
          <div className="lg:col-span-6 border-r border-[#1e1e1e] h-full">
            <PythChart />
          </div>

          {/* Contract Balances - 25% on desktop */}
          <div className="lg:col-span-3 border-r border-[#1e1e1e] h-full hidden lg:block p-4">
            <ContractBalances />
          </div>

          {/* Order Book - 12.5% on desktop */}
          <div className="lg:col-span-1 border-r border-[#1e1e1e] h-full hidden lg:block">
            <EnhancedOrderBook />
          </div>

          {/* Trade Executor - 12.5% on desktop */}
          <div className="lg:col-span-2 h-full hidden lg:block">
            <EnhancedTradeExecutor />
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="lg:hidden flex flex-col h-full">
          <div className="flex-1 border-b border-[#1e1e1e]">
            <PythChart />
          </div>
          <div className="h-[300px] border-b border-[#1e1e1e]">
            <EnhancedOrderBook />
          </div>
          <div className="h-[400px]">
            <EnhancedTradeExecutor />
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
