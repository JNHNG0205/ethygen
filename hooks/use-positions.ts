"use client"

import { usePositionsContext } from "@/providers/positions-provider"

export const usePositions = () => {
  return usePositionsContext()
}
