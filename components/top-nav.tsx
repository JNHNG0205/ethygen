"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menu, Settings } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function TopNav() {
  const [selectedAsset, setSelectedAsset] = useState("ETH/USDC")
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Trade" },
    { href: "/positions", label: "Positions" },
    { href: "/vault", label: "Vault" },
    { href: "/portfolio", label: "Portfolio" }, // Added Portfolio navigation link after Vault
    { href: "/stake", label: "Stake" },
    { href: "/explorer", label: "Explorer" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-black border-b border-[#1e1e1e] z-50 flex items-center justify-between px-4">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center gap-6">
        <button className="lg:hidden">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>

        <Link href="/">
          <h1 className="text-xl font-bold text-primary tracking-wider cursor-pointer">ETHYGEN</h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={`${
                  pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Asset Selector - only on trade page */}
        {pathname === "/" && (
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-[140px] bg-card border-border text-foreground font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="ETH/USDC" className="font-mono">
                ETH/USDC
              </SelectItem>
              <SelectItem value="BTC/USDC" className="font-mono">
                BTC/USDC
              </SelectItem>
              <SelectItem value="SOL/USDC" className="font-mono">
                SOL/USDC
              </SelectItem>
              <SelectItem value="ARB/USDC" className="font-mono">
                ARB/USDC
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Right: Connect and Settings */}
      <div className="flex items-center gap-3">
        <WalletConnectButton />

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  )
}
