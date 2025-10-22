"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Menu, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { motion } from "framer-motion"
import { useState } from "react"
import { useMarket } from "@/hooks/use-market"

export function TopNav() {
  const { asset: selectedAsset, setAsset: setSelectedAsset } = useMarket()
  const pathname = usePathname()
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()

  // Prefer embedded/smart wallet if present
  const smartWallet = wallets.find((w) => w.walletClientType === "privy")
  const address = smartWallet?.address
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const navLinks = [
    { href: "/", label: "Trade" },
    { href: "/positions", label: "Positions" },
    { href: "/vault", label: "Vault" },
    { href: "/portfolio", label: "Portfolio" }, // Added Portfolio navigation link after Vault
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
              <SelectItem value="ETH/yUSDe" className="font-mono">
                ETH/yUSDe
              </SelectItem>
              <SelectItem value="BTC/yUSDe" className="font-mono">
                BTC/yUSDe
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Right: Connect and Settings */}
      <div className="flex items-center gap-3">
        {!ready ? (
          <div className="px-3 py-2 text-sm text-muted-foreground bg-card rounded-md">Loading...</div>
        ) : authenticated ? (
          <div className="flex items-center space-x-3">
            {address && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs font-mono bg-[#0f0f10] px-3 py-1 rounded-full border border-[#1e1e1e] text-primary shadow-[0_0_8px_rgba(0,212,255,0.35)] transition cursor-pointer ${copied ? 'ring-2 ring-cyan-400' : ''}`}
                title={copied ? 'Copied!' : address}
                onClick={handleCopyAddress}
                type="button"
              >
                {copied ? 'Copied!' : `${address.slice(0, 6)}...${address.slice(-4)}`}
              </motion.button>
            )}
            <Button variant="ghost" onClick={logout} className="text-destructive hover:text-destructive/90">
              Logout
            </Button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={login}
            className="bg-primary text-black px-4 py-2 rounded-full font-semibold shadow-[0_0_12px_rgba(0,212,255,0.55)]"
          >
            Connect Privy
          </motion.button>
        )}

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  )
}
