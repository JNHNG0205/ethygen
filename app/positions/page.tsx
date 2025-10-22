import { TopNav } from "@/components/top-nav"
import { BottomBar } from "@/components/bottom-bar"
import { ActivePositions } from "@/components/active-positions"
import { PositionHistory } from "@/components/position-history"

export default function PositionsPage() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      <TopNav />

      <main className="flex-1 mt-[60px] mb-[80px] overflow-hidden">
        <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
          {/* Page Header */}
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl font-bold text-foreground">Positions</h1>
            <p className="text-muted-foreground">Manage your active and historical positions</p>
          </div>

          {/* Two-panels layout: stays within viewport; each panel scrolls when content grows */}
          <div className="flex-1 min-h-0 grid grid-rows-2 lg:grid-rows-1 grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="min-h-0 h-full overflow-y-auto">
              <ActivePositions />
            </div>
            <div className="min-h-0 h-full overflow-y-auto">
              <PositionHistory />
            </div>
          </div>
        </div>
      </main>

      <BottomBar />
    </div>
  )
}
