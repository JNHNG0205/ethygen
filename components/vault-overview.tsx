"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Wallet, Lock, Zap } from "lucide-react"

export function VaultOverview() {
  // Empty state for fresh users
  const stats = [
    {
      label: "Total Balance",
      value: "$0.00",
      change: "$0.00 (0.00%)",
      icon: Wallet,
      positive: false,
    },
    {
      label: "Available Margin",
      value: "$0.00",
      subtitle: "Deposit to start trading",
      icon: Zap,
    },
    {
      label: "In Positions",
      value: "$0.00",
      subtitle: "0 active positions",
      icon: Lock,
    },
    {
      label: "Total PnL (24h)",
      value: "$0.00",
      change: "0.00%",
      icon: TrendingUp,
      positive: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-card border-border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold font-mono ${stat.positive ? "text-primary" : "text-foreground"}`}>
              {stat.value}
            </div>
            {stat.change && (
              <div className={`text-xs font-mono ${stat.positive ? "text-primary" : "text-muted-foreground"}`}>
                {stat.change}
              </div>
            )}
            {stat.subtitle && <div className="text-xs text-muted-foreground">{stat.subtitle}</div>}
          </div>
        </Card>
      ))}
    </div>
  )
}
