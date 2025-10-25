"use client"

import { Card } from "@/components/ui/card"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface Transaction {
  id: string
  type: "deposit" | "withdraw"
  amount: number
  timestamp: Date
  txHash: string
}

export function VaultHistory() {
  // Empty state - no dummy data for fresh users
  const transactions: Transaction[] = []

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mb-3">
            <ArrowDownToLine className="w-7 h-7 text-muted-foreground" />
          </div>
          <h4 className="text-base font-semibold text-foreground mb-1">No Transactions Yet</h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your deposit and withdrawal history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 bg-background rounded-md border border-border"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === "deposit" ? "bg-primary/10" : "bg-destructive/10"
                }`}
              >
                {tx.type === "deposit" ? (
                  <ArrowDownToLine className="w-5 h-5 text-primary" />
                ) : (
                  <ArrowUpFromLine className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground capitalize">{tx.type}</div>
                <div className="text-xs text-muted-foreground">{formatTime(tx.timestamp)}</div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-sm font-mono font-semibold ${tx.type === "deposit" ? "text-primary" : "text-destructive"}`}
              >
                {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{tx.txHash}</div>
            </div>
          </div>
        ))}
        </div>
      )}
    </Card>
  )
}
