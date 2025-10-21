import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { AdvancedTradingChart } from "@/components/advanced-trading-chart"
import { EnhancedOrderBook } from "@/components/enhanced-order-book"
import { EnhancedTradeExecutor } from "@/components/enhanced-trade-executor"
import { MarketOverview } from "@/components/market-overview"
import PythChart from "@/components/pyth-chart"

export default function TradePage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-hidden">
        {/* Market Overview Banner - Compact */}
        <div className="p-2 border-b border-[#1e1e1e] bg-[#0a0a0a]">
          <MarketOverview />
        </div>

        <div className="h-[calc(100%-80px)] grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Chart - 66.67% on desktop */}
          <div className="lg:col-span-8 border-r border-[#1e1e1e] h-full">
            <PythChart />
          </div>

          {/* Order Book - 16.67% on desktop (smaller) */}
          <div className="lg:col-span-2 border-r border-[#1e1e1e] h-full hidden lg:block">
            <EnhancedOrderBook />
          </div>

          {/* Trade Executor - 16.67% on desktop */}
          <div className="lg:col-span-2 h-full hidden lg:block">
            <EnhancedTradeExecutor />
          </div>
        </div>

        {/* Mobile: Stacked Layout */}
        <div className="lg:hidden flex flex-col h-full">
          <div className="flex-1 border-b border-[#1e1e1e]">
            <AdvancedTradingChart />
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
