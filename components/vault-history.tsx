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
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "deposit",
      amount: 5000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      txHash: "0x1234...5678",
    },
    {
      id: "2",
      type: "withdraw",
      amount: 1500,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      txHash: "0xabcd...efgh",
    },
    {
      id: "3",
      type: "deposit",
      amount: 3000,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      txHash: "0x9876...5432",
    },
  ]

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
    </Card>
  )
}
