"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Wallet, Lock, Zap } from "lucide-react"

export function VaultOverview() {
  const stats = [
    {
      label: "Total Balance",
      value: "$12,450.32",
      change: "+$245.67 (2.01%)",
      icon: Wallet,
      positive: true,
    },
    {
      label: "Available Margin",
      value: "$8,234.50",
      subtitle: "Ready to trade",
      icon: Zap,
    },
    {
      label: "In Positions",
      value: "$4,215.82",
      subtitle: "3 active positions",
      icon: Lock,
    },
    {
      label: "Total PnL (24h)",
      value: "+$156.23",
      change: "+1.27%",
      icon: TrendingUp,
      positive: true,
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
