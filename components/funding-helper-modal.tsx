"use client"
import { useEffect, useMemo, useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { useNexus } from "@/providers/nexus-provider"

function shorten(addr?: string) {
  if (!addr) return "—"
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export interface FundingHelperModalProps {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  onOpenDeposit?: () => void
}

export function FundingHelperModal({ open, onOpenChange, onOpenDeposit }: FundingHelperModalProps) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { balances } = useNexus()
  const [internalOpen, setInternalOpen] = useState(false)

  const primary = useMemo(() => (wallets as any[])?.find((w) => (w as any).walletClientType === "privy") || wallets[0], [wallets])
  const address: string | undefined = (primary as any)?.address || wallets[0]?.address

  const isEmpty = (balances?.length || 0) === 0

  useEffect(() => {
    const dismissed = typeof window !== "undefined" ? localStorage.getItem("funding-helper-dismissed") : "1"
    if (open !== undefined) return
    if (authenticated && isEmpty && dismissed !== "1") {
      setInternalOpen(true)
    }
  }, [authenticated, isEmpty, open])

  const effectiveOpen = open ?? internalOpen
  const handleOpenChange = (v: boolean) => {
    if (onOpenChange) onOpenChange(v)
    else setInternalOpen(v)
  }

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      toast.success("Address copied")
    } catch (e) {
      toast.error("Failed to copy")
    }
  }

  const dismiss = () => {
    try { localStorage.setItem("funding-helper-dismissed", "1") } catch {}
    handleOpenChange(false)
  }

  return (
    <Dialog open={effectiveOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-black border border-[#1e1e1e]">
        <DialogHeader>
          <DialogTitle className="text-lg">New wallet? Fund it in 2 minutes</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Privy smart wallets start empty. Grab a bit of testnet ETH/USDC, then deposit gaslessly. On Base Sepolia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="p-3 bg-[#0a0a0a]">
            <div className="text-xs text-muted-foreground mb-2">Your wallet address</div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm break-all">{address || "Connect Privy to continue"}</div>
              <Button size="sm" variant="outline" onClick={copyAddress} disabled={!address}>Copy</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-3 bg-[#0a0a0a]">
              <div className="font-medium mb-1">Circle Faucet</div>
              <div className="text-xs text-muted-foreground mb-2">Get test funds via Circle's faucet.</div>
              <div className="flex gap-2">
                <a target="_blank" rel="noreferrer" href="https://faucet.circle.com/">
                  <Button size="sm" className="bg-cyan-400 text-black hover:bg-cyan-300">Open Circle Faucet</Button>
                </a>
              </div>
            </Card>

            <Card className="p-3 bg-[#0a0a0a]">
              <div className="font-medium mb-1">Google Cloud Web3 Faucet</div>
              <div className="text-xs text-muted-foreground mb-2">Google Cloud's Web3 faucet tooling.</div>
              <div className="flex gap-2">
                <a target="_blank" rel="noreferrer" href="https://cloud.google.com/application/web3/faucet">
                  <Button size="sm" variant="outline">Open Google Cloud Faucet</Button>
                </a>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Tip: WETH/USDC are most broadly supported for bridging on testnet.
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={dismiss}>Dismiss</Button>
              <Button onClick={onOpenDeposit} className="bg-cyan-400 text-black hover:bg-cyan-300">Open Deposit</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FundingHelperModal
