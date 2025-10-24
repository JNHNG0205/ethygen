"use client";
import { useState } from "react";
import { TopNav } from "@/components/top-nav";
import { BottomBar } from "@/components/bottom-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Filter, Download, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import { useNexus } from "@/providers/nexus-provider";
import { UnifiedBalanceCard } from "@/components/unified-balance-card";
import { DepositModal } from "@/components/deposit-modal";
import { useRouter } from "next/navigation";
import { usePythPush } from "@/hooks/use-pyth-push";
import { FundingHelperModal } from "@/components/funding-helper-modal";

// Fresh user: all stats and tables are zero/empty
const summary = [
	{ label: "Total Equity", value: "$0.00", accent: "text-cyan-400" },
	{ label: "Unrealized PnL", value: "$0.00 (0.0%)", accent: "text-cyan-400" },
	{ label: "Margin Used", value: "$0.00 / $0.00", accent: "text-yellow-400" },
	{ label: "Win Rate", value: "0%", accent: "text-cyan-400" },
];
const chartData = [
	{ date: "10/18", pnl: 0 },
	{ date: "10/19", pnl: 0 },
	{ date: "10/20", pnl: 0 },
	{ date: "10/21", pnl: 0 },
	{ date: "10/22", pnl: 0 },
];

const activePositions: Array<{
	id: number;
	asset: string;
	side: string;
	size: number;
	entry: number;
	mark: number;
	unrealPnl: number;
	liq: number;
	margin: number;
}> = [];
const closedPositions: typeof activePositions = [];

export default function PortfolioPage() {
	const [tab, setTab] = useState("balances");
	const [filterAsset, setFilterAsset] = useState("All");
	const [search, setSearch] = useState("");
	const [showDepositModal, setShowDepositModal] = useState(false);
	const { balances, isInitialized, isLoading, refreshBalances } = useNexus();
	const router = useRouter();
	const { pushOnChain } = usePythPush();

    // Pyth push removed per request

	// Filtered positions (mock logic)
	const filteredActive = activePositions.filter(
		(p) => filterAsset === "All" || p.asset === filterAsset
	);
	const filteredClosed = closedPositions.filter(
		(p) => filterAsset === "All" || p.asset === filterAsset
	);

	return (
		<div className="h-screen bg-black overflow-y-auto">
			<TopNav />
			<main className="max-w-7xl mx-auto pt-[72px] pb-[80px] px-4">
				{/* Funding helper for fresh wallets (shows once unless dismissed) */}
				<FundingHelperModal onOpenDeposit={() => setShowDepositModal(true)} />
				{/* Summary Row */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 items-center">
					{summary.map((s, i) => (
						<Card key={i} className="p-4 flex flex-col items-center bg-[#0a0a0a]">
							<div className={`text-xl font-mono font-bold ${s.accent}`}>{s.value}</div>
							<div className="text-xs text-muted-foreground mt-1">{s.label}</div>
						</Card>
					))}
					<Card className="col-span-2 md:col-span-1 p-2 flex flex-col items-center bg-[#0a0a0a] h-full justify-center min-w-0">
						<div className="w-full h-[60px]" style={{ minWidth: 0, minHeight: 60 }}>
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
									<Line type="monotone" dataKey="pnl" stroke="#00d4ff" strokeWidth={2} dot={false} />
									<XAxis dataKey="date" hide />
									<YAxis hide />
								</LineChart>
							</ResponsiveContainer>
						</div>
						<div className="text-xs text-muted-foreground mt-1">PnL (7d)</div>
					</Card>
				</div>

				{/* Unified Balances summary card */}
				<div className="mb-4">
					<UnifiedBalanceCard />
				</div>

				{/* Sticky Filters Bar (hide on Balances tab) */}
				{tab !== "balances" && (
				<div className="sticky top-[72px] z-10 bg-black py-2 flex flex-wrap gap-2 items-center border-b border-[#1e1e1e] mb-2">
					<div className="flex gap-2 items-center">
						<select
							value={filterAsset}
							onChange={(e) => setFilterAsset(e.target.value)}
							className="bg-[#101c1a] text-sm rounded px-3 py-1 border border-[#222] text-foreground"
							aria-label="Filter by asset"
						>
							<option value="All">All Assets</option>
							<option value="ETH">ETH</option>
							<option value="BTC">BTC</option>
						</select>
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by tx or asset"
							className="bg-[#101c1a] text-sm rounded px-3 py-1 border border-[#222] text-foreground"
							aria-label="Search"
						/>
						<Button variant="ghost" size="sm" className="text-xs px-2 py-0 h-7 flex items-center gap-1"><Filter className="w-3 h-3 mr-1" />Filter</Button>
					</div>
					<div className="ml-auto flex gap-2 items-center">
						<Button variant="ghost" size="sm" className="text-xs px-2 py-0 h-7 flex items-center gap-1"><Download className="w-3 h-3 mr-1" />Export CSV</Button>
					</div>
				</div>
				)}

				{/* Tabs */}
								<div className="flex gap-2 mb-2">
										<Button onClick={() => setTab("balances")} variant={tab === "balances" ? "default" : "ghost"} className="rounded-t px-6 py-2 text-sm">Balances ({balances?.length || 0})</Button>
										<Button onClick={() => setTab("active")} variant={tab === "active" ? "default" : "ghost"} className="rounded-t px-6 py-2 text-sm">Active ({filteredActive.length})</Button>
										<Button onClick={() => setTab("closed")} variant={tab === "closed" ? "default" : "ghost"} className="rounded-t px-6 py-2 text-sm">Closed ({filteredClosed.length})</Button>
								</div>

								{/* Balances Tab Content */}
								{tab === "balances" ? (
									<Card className="p-4 bg-[#0a0a0a]">
										<div className="flex items-center justify-between mb-3">
											<div className="text-sm text-muted-foreground">Multi-chain balances via Nexus</div>
											<div className="flex gap-2">
												<Button onClick={() => setShowDepositModal(true)} size="sm" className="text-xs bg-cyan-400 hover:bg-cyan-300 text-black">
													Bridge & Deposit
													<ArrowRight className="ml-1 w-3 h-3" />
												</Button>
												<Button onClick={refreshBalances} size="sm" disabled={!isInitialized || isLoading} variant="outline" className="text-xs">
													{isLoading ? 'Refreshing…' : 'Refresh'}
												</Button>

											</div>
										</div>
										{(balances?.length || 0) === 0 ? (
											<div className="py-8 flex flex-col items-center justify-center gap-3">
												<div className="text-muted-foreground text-sm text-center">No assets detected yet</div>
												<Button onClick={() => setShowDepositModal(true)} size="sm" className="bg-cyan-400 hover:bg-cyan-300 text-black">
													Bridge & Deposit to Get Started
													<ArrowRight className="ml-1 w-4 h-4" />
												</Button>
											</div>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
												{balances.map((b: any, idx: number) => {
													const chainMap: Record<string, string> = {}
													;(b.breakdown || []).forEach((d: any) => {
														const chainName = (d.chain?.name || d.network || '').toLowerCase()
														if (chainName.includes('ethereum') || chainName.includes('eth sepolia')) chainMap['eth'] = d.balance
														else if (chainName.includes('base')) chainMap['base'] = d.balance
														else if (chainName.includes('arbitrum') || chainName.includes('arb')) chainMap['arb'] = d.balance
														else if (chainName.includes('optimism') || chainName.includes('op')) chainMap['op'] = d.balance
													})
													return (
														<Card key={idx} className="p-4 bg-[#0a0a0a] border border-[#1e1e1e] hover:border-cyan-400/20 transition-colors">
															<div className="flex items-start justify-between mb-3">
																<div>
																	<div className="font-mono font-bold text-lg">{b.symbol || b.name || '—'}</div>
																	<div className="text-muted-foreground text-xs">
																		{b.balanceInFiat ? `$${Number(b.balanceInFiat).toLocaleString()}` : '$0'}
																	</div>
																</div>
																<div className="text-right">
																	<div className="font-mono text-sm text-cyan-400">{b.balance ?? '0'}</div>
																	<div className="text-[10px] text-muted-foreground">Total</div>
																</div>
															</div>
															<div className="grid grid-cols-2 gap-2 text-[10px]">
																<div className="bg-[#101c1a] rounded px-2 py-1.5 flex items-center justify-between">
																	<span className="text-muted-foreground">Eth</span>
																	<span className="font-mono">{chainMap['eth'] || '0'}</span>
																</div>
																<div className="bg-[#101c1a] rounded px-2 py-1.5 flex items-center justify-between">
																	<span className="text-muted-foreground">Base</span>
																	<span className="font-mono">{chainMap['base'] || '0'}</span>
																</div>
																<div className="bg-[#101c1a] rounded px-2 py-1.5 flex items-center justify-between">
																	<span className="text-muted-foreground">Arb</span>
																	<span className="font-mono">{chainMap['arb'] || '0'}</span>
																</div>
																<div className="bg-[#101c1a] rounded px-2 py-1.5 flex items-center justify-between">
																	<span className="text-muted-foreground">OP</span>
																	<span className="font-mono">{chainMap['op'] || '0'}</span>
																</div>
															</div>
														</Card>
													)
												})}
											</div>
										)}
									</Card>
								) : (
								<>
								{/* Table */}
				<div className="bg-[#0a0a0a] rounded-xl overflow-x-auto">
					<table className="w-full text-xs" aria-label={tab === "active" ? "Active Positions" : "Closed Positions"}>
						<thead className="bg-[#101c1a] text-muted-foreground">
							<tr>
								<th className="p-3 text-left">Asset</th>
								<th>Side</th>
								<th>Size</th>
								<th>Entry Price</th>
								<th>Mark Price</th>
								<th>Unreal PnL</th>
								<th>Liq. Price</th>
								<th>Margin</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{(tab === "active" ? filteredActive : filteredClosed).length === 0 ? (
								<tr>
									<td colSpan={9} className="text-center text-muted-foreground py-8">No {tab} positions yet</td>
								</tr>
							) : (
								(tab === "active" ? filteredActive : filteredClosed).map((pos) => (
									<motion.tr key={pos.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-[#1e1e1e] hover:bg-[#101c1a]">
										<td className="p-3 font-mono">{pos.asset}</td>
										<td className={pos.side === "Long" ? "text-cyan-400" : "text-red-500"}>
											{pos.side === "Long" ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
											{pos.side}
										</td>
										<td>${pos.size.toLocaleString()}</td>
										<td>${pos.entry}</td>
										<td>${pos.mark}</td>
										<td className={pos.unrealPnl > 0 ? "text-cyan-400" : "text-red-500"}>${pos.unrealPnl} ({((pos.unrealPnl / pos.size * 100).toFixed(1))}%)</td>
										<td>${pos.liq}</td>
										<td>{pos.margin} yUSDe</td>
										<td>
											<Button size="sm" variant="outline" className="text-xs px-2 py-1">Close</Button>
										</td>
									</motion.tr>
								))
							)}
						</tbody>
					</table>
				</div>
				{/* Footer row for totals, if history */}
				{tab === "closed" && (
					<div className="flex justify-end text-xs text-muted-foreground mt-2">Net Realized PnL: $0.00</div>
				)}
								</>
								)}

			{/* Deposit Modal */}
			<DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} />
			</main>
			<BottomBar />
		</div>
	);
}
