import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { DepositFlowDemo } from "@/components/deposit-flow-demo"
import { TradingFlowDemo } from "@/components/trading-flow-demo"
import { WithdrawFlowDemo } from "@/components/withdraw-flow-demo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DemoPage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Complete User Flow Demo</h1>
            <p className="text-muted-foreground">
              Interactive demonstration of deposit, trading, and withdraw flows with hardcoded data
            </p>
          </div>

          {/* Flow Tabs */}
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit">💰 Deposit Flow</TabsTrigger>
              <TabsTrigger value="trading">📈 Trading Flow</TabsTrigger>
              <TabsTrigger value="withdraw">💸 Withdraw Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-6">
              <DepositFlowDemo />
            </TabsContent>

            <TabsContent value="trading" className="mt-6">
              <TradingFlowDemo />
            </TabsContent>

            <TabsContent value="withdraw" className="mt-6">
              <WithdrawFlowDemo />
            </TabsContent>
          </Tabs>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="text-sm font-medium mb-2">🔄 Multi-Chain Aggregation</div>
              <div className="text-xs text-muted-foreground">
                Nexus aggregates balances across all EVM chains into a unified view
              </div>
            </div>
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="text-sm font-medium mb-2">⚡ Continuous Yield</div>
              <div className="text-xs text-muted-foreground">
                yUSDe earns 8% APY even while being used as trading collateral
              </div>
            </div>
            <div className="p-4 bg-[#101010] rounded-lg border border-[#1e1e1e]">
              <div className="text-sm font-medium mb-2">🎯 Zero Idle Time</div>
              <div className="text-xs text-muted-foreground">
                No unused funds - every dollar earns yield or generates trading alpha
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
