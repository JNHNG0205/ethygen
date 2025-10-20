import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { ActivePositions } from "@/components/active-positions"
import { PositionHistory } from "@/components/position-history"

export default function PositionsPage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Positions</h1>
            <p className="text-muted-foreground">Manage your active and historical positions</p>
          </div>

          {/* Active Positions */}
          <ActivePositions />

          {/* Position History */}
          <PositionHistory />
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
