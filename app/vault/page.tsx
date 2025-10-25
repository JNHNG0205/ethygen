import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { DepositFlowDemo } from "@/components/deposit-flow-demo"
import { TradingFlowDemo } from "@/components/trading-flow-demo"
import { WithdrawFlowDemo } from "@/components/withdraw-flow-demo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VaultPage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Vault</h1>
            <p className="text-muted-foreground">Deposit, trading, and withdraw</p>
          </div>

          {/* Flow Tabs */}
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deposit">💰 Deposit</TabsTrigger>
              <TabsTrigger value="trading">📈 Trading</TabsTrigger>
              <TabsTrigger value="withdraw">💸 Withdraw</TabsTrigger>
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
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
