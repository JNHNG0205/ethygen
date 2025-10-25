'use client'
import { Card } from '@/components/ui/card'
import { useNexus } from '@/providers/nexus-provider'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

export function UnifiedBalanceCard() {
  const { balances } = useNexus() as any

  const colors = ['#00d4ff', '#d50000', '#22c55e', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444']
  const MAX_SEGMENTS = 5

  const { pieData, total } = (() => {
    const raw = (balances || [])
      .map((b: any) => ({
        name: b.symbol || b.name || '—',
        value: Number(b.balanceInFiat || 0),
      }))
      .filter((d: any) => d.value > 0)
      .sort((a: any, b: any) => b.value - a.value)

    const sum = raw.reduce((acc: number, d: any) => acc + (Number.isFinite(d.value) ? d.value : 0), 0)

    if (raw.length <= MAX_SEGMENTS) return { pieData: raw, total: sum }

    const headCount = MAX_SEGMENTS - 1
    const head = raw.slice(0, headCount)
    const tailSum = raw.slice(headCount).reduce((acc: number, d: any) => acc + d.value, 0)
    return { pieData: [...head, { name: 'Others', value: tailSum }], total: sum }
  })()

  const fmt = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-3 bg-[#0a0a0a]">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-0.5">Unified Balance</div>
            <div className="text-2xl font-mono">${fmt(total)}</div>
            <div className="text-[10px] text-muted-foreground">USDC equivalent</div>
          </div>
          <div className="w-[180px] h-[120px] shrink-0" style={{ minWidth: 140, minHeight: 100 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={50}>
                  {pieData.map((_: { name: string; value: number }, i: number) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {pieData.length > 0 ? (
          <div className="mt-2 grid grid-cols-2 gap-1">
            {pieData.map((d: { name: string; value: number }, i: number) => (
              <div key={d.name + i} className="bg-[#101c1a] rounded px-2 py-1 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  {d.name}
                </span>
                <span className="font-mono">${fmt(d.value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-muted-foreground">No assets detected yet</div>
        )}
      </Card>
    </motion.div>
  )
}
