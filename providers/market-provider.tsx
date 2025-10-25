"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

type MarketContextValue = {
  asset: string
  setAsset: (asset: string) => void
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined)


const ALLOWED_ASSETS = ["ETH/yUSDe", "BTC/yUSDe"];

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [asset, setAssetState] = useState<string>("ETH/yUSDe");

  // Only allow ETH/yUSDe and BTC/yUSDe
  const setAsset = (a: string) => {
    if (ALLOWED_ASSETS.includes(a)) setAssetState(a);
  };

  const value = useMemo(() => ({ asset, setAsset }), [asset]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarketContext() {
  const ctx = useContext(MarketContext)
  if (!ctx) throw new Error("useMarketContext must be used within MarketProvider")
  return ctx
}
