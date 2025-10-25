import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { VaultOverview } from "@/components/vault-overview"
import { VaultActions } from "@/components/vault-actions"
import { VaultHistory } from "@/components/vault-history"
import { ContractBalances } from "@/components/contract-balances"
import { VaultOperations } from "@/components/vault-operations"
import { PerpDEXTrading } from "@/components/perpdex-trading"
import { EnhancedContractTest } from "@/components/enhanced-contract-test"
import { TransactionStatus } from "@/components/transaction-status"

export default function VaultPage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Vault</h1>
            <p className="text-muted-foreground">Deposit yUSDe to start trading with leverage</p>
          </div>

          {/* Enhanced Contract Integration Test */}
          <EnhancedContractTest />

          {/* Contract Integration Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ContractBalances />
            <VaultOperations />
            <PerpDEXTrading />
          </div>

          {/* Transaction Status */}
          <TransactionStatus />

          {/* Original Vault Components */}
          <VaultOverview />

          {/* Deposit/Withdraw Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VaultActions />
            <VaultHistory />
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
