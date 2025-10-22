"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import { PriceFeedService } from "@/lib/price-feed"

export type PositionSide = "long" | "short"

export interface Position {
  id: string
  asset: string
  side: PositionSide
  entryPrice: number
  currentPrice: number
  size: number
  leverage: number
  margin: number
  pnl: number
  pnlPercent: number
  liquidationPrice: number
}

export interface HistoricalPosition {
  id: string
  asset: string
  side: PositionSide
  entryPrice: number
  exitPrice: number
  size: number
  leverage: number
  pnl: number
  pnlPercent: number
  closedAt: Date
}

interface OpenPositionParams {
  asset: string
  side: PositionSide
  entryPrice: number
  margin: number
  leverage: number
}

interface PositionsContextValue {
  activePositions: Position[]
  history: HistoricalPosition[]
  openPosition: (params: OpenPositionParams) => string
  closePosition: (id: string, exitPrice?: number) => void
  clearAll: () => void
}

const PositionsContext = createContext<PositionsContextValue | undefined>(undefined)

export function PositionsProvider({ children }: { children: React.ReactNode }) {
  const [activePositions, setActivePositions] = useState<Position[]>([])
  const [history, setHistory] = useState<HistoricalPosition[]>([])

  const calcLiquidation = useCallback((side: PositionSide, entryPrice: number, margin: number, leverage: number) => {
    // Simple illustrative liquidation calc
    const positionSize = margin * leverage
    const maintenanceMargin = 0.05
    const liquidationDistance = (margin * (1 - maintenanceMargin)) / (positionSize / entryPrice)
    return side === "long" ? entryPrice - liquidationDistance : entryPrice + liquidationDistance
  }, [])

  const openPosition = useCallback((params: OpenPositionParams) => {
    const id = `pos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const size = params.margin * params.leverage
    const liquidationPrice = calcLiquidation(params.side, params.entryPrice, params.margin, params.leverage)
    const newPos: Position = {
      id,
      asset: params.asset,
      side: params.side,
      entryPrice: Number(params.entryPrice.toFixed(2)),
      currentPrice: Number(params.entryPrice.toFixed(2)),
      size: Number(size.toFixed(2)),
      leverage: params.leverage,
      margin: Number(params.margin.toFixed(2)),
      pnl: 0,
      pnlPercent: 0,
      liquidationPrice: Number(liquidationPrice.toFixed(2)),
    }

    setActivePositions((prev) => [newPos, ...prev])
    return id
  }, [calcLiquidation])

  const closePosition = useCallback((id: string, exitPrice?: number) => {
    setActivePositions((prev) => {
      const pos = prev.find((p) => p.id === id)
      if (!pos) return prev

      // Determine exit price if not provided from the live price feed
      let price = exitPrice
      if (price === undefined) {
        const feed = PriceFeedService.getInstance().getCurrentPrice(pos.asset)
        price = feed?.price ?? pos.entryPrice
      }

      const pnl = pos.side === "long"
        ? (price - pos.entryPrice) * (pos.size / pos.entryPrice)
        : (pos.entryPrice - price) * (pos.size / pos.entryPrice)
      const pnlPercent = (pnl / pos.margin) * 100

      const hist: HistoricalPosition = {
        id: pos.id,
        asset: pos.asset,
        side: pos.side,
        entryPrice: pos.entryPrice,
        exitPrice: Number((price ?? pos.entryPrice).toFixed(2)),
        size: pos.size,
        leverage: pos.leverage,
        pnl: Number(pnl.toFixed(2)),
        pnlPercent: Number(pnlPercent.toFixed(2)),
        closedAt: new Date(),
      }

      setHistory((h) => [hist, ...h])
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setActivePositions([])
    setHistory([])
  }, [])

  const value = useMemo(
    () => ({ activePositions, history, openPosition, closePosition, clearAll }),
    [activePositions, history, openPosition, closePosition, clearAll]
  )

  return <PositionsContext.Provider value={value}>{children}</PositionsContext.Provider>
}

export function usePositionsContext() {
  const ctx = useContext(PositionsContext)
  if (!ctx) throw new Error("usePositionsContext must be used within PositionsProvider")
  return ctx
}
