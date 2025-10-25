"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletConnectButton() {
  const { login, logout, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [copied, setCopied] = useState(false)

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === "privy")
  const address = embeddedWallet?.address

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!authenticated) {
    return (
      <Button
        onClick={login}
        className="bg-black border-primary text-primary hover:bg-primary hover:text-black transition-all neon-glow"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-primary text-black hover:bg-primary/90 neon-glow-strong">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
          {address ? formatAddress(address) : "Connected"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email?.address || "Embedded Wallet"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {address && (
          <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            <span className="font-mono text-xs">{formatAddress(address)}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="cursor-pointer">
          <Wallet className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
