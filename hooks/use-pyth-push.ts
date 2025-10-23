"use client"
import { useCallback } from "react"
import { useWallets } from "@privy-io/react-auth"
import { baseSepolia } from "viem/chains"
import { createPublicClient, custom, encodeFunctionData } from "viem"
import { PRICE_FEED_IDS } from "@/lib/price-feed"
import { getPythAddress, PYTH_ABI } from "@/lib/pyth-evm"
import { useSmartWallet } from "@/hooks/use-smart-wallet"
import { toast } from "sonner"

type Asset = keyof typeof PRICE_FEED_IDS

async function fetchHermesUpdateData(feedIds: string[]): Promise<`0x${string}`[]> {
  const configured = process.env.NEXT_PUBLIC_PYTH_HERMES_URL?.trim()
  const network = (process.env.NEXT_PUBLIC_PYTH_NETWORK || "mainnet").toLowerCase()
  const defaultBase = network === "testnet" ? "https://hermes-beta.pyth.network" : "https://hermes.pyth.network"
  const baseUrl = (configured || defaultBase).replace(/\/$/, "")
  const base = `${baseUrl}/v2/updates/price/latest`

  // Try multiple query variants and base hosts to accommodate API differences and misconfig
  const variants: Array<{ params: Record<string, string>; base: string; idKey: string; path: string }> = []
  const hosts = [baseUrl, "https://hermes-beta.pyth.network", "https://hermes.pyth.network"]
  const paramShapes: Record<string, string>[] = [
    { encoding: "hex" },
    { encoding: "hex", binary: "true" },
    { encoding: "hex", parsed: "false" },
  ]
  const idKeys = ["ids[]", "ids", "price_ids[]"]
  const paths = ["/v2/updates/price/latest"]
  for (const host of hosts) {
    for (const p of paramShapes) {
      for (const key of idKeys) {
        for (const path of paths) {
          variants.push({ params: p, base: host, idKey: key, path })
        }
      }
    }
  }

  let lastError: any = null
  for (const { params, base: host, idKey, path } of variants) {
    try {
      const url = new URL(base)
      url.hostname = new URL(host).hostname
      url.protocol = new URL(host).protocol
      url.pathname = path
      // Primary shape
      feedIds.forEach((id) => url.searchParams.append(idKey, id))
      Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(`Hermes fetch failed: ${res.status}`)
      const json = await res.json()

      // Known shapes:
      // - { binary: [] }
      // - { binary: { data: [] }}
      // - { data: { binary: [] } }
      // - { updates: [{ binary }] }
      // - Edge case arrays: { data: [{ binary }]} (defensive)
      const binaries: string[] =
        (json?.binary as string[]) ||
        (json?.binary?.data as string[]) ||
        (json?.data?.binary as string[]) ||
        (Array.isArray(json?.data)
          ? (json.data as any[])
              .map((u: any) => (Array.isArray(u?.binary) ? u.binary : u?.binary))
              .flat()
              .filter(Boolean)
          : []) ||
        (Array.isArray(json?.updates)
          ? (json.updates as any[]).map((u: any) => u?.binary).filter(Boolean)
          : [])

      if (Array.isArray(binaries) && binaries.length > 0) {
        return binaries.map((b) => (b.startsWith("0x") ? (b as `0x${string}`) : (`0x${b}` as `0x${string}`)))
      }

      // Helpful debug
      // eslint-disable-next-line no-console
      console.warn("[Pyth] No binary in variant:", { host, params, idKey, path, url: url.toString() }, "keys:", Object.keys(json || {}))
      lastError = new Error("Hermes returned no updateData (no binary field)")
    } catch (err) {
      lastError = err
      // eslint-disable-next-line no-console
      console.warn("[Pyth] Variant failed:", { host, params, idKey, path }, err)
    }
  }

  throw lastError || new Error("Hermes returned no updateData")
}

export function usePythPush() {
  const { wallets } = useWallets()
  const { executeGaslessTx } = useSmartWallet()

  const pushOnChain = useCallback(
    async (assets: Asset[] = ["ETH/yUSDe", "BTC/yUSDe"]) => {
      try {
        const primary = wallets.find((w: any) => w.walletClientType === "privy") || wallets[0]
        if (!primary) throw new Error("No wallet connected")

        const getProvider = (primary as any)?.getEthereumProvider
        const eip1193: any = getProvider ? await getProvider.call(primary) : (primary as any)?.provider
        if (!eip1193) throw new Error("No EIP-1193 provider available")

        const chainId = baseSepolia.id
        const pyth = getPythAddress(chainId)

        const feedIds = assets
          .map((a) => PRICE_FEED_IDS[a])
          .filter(Boolean) as string[]
        if (feedIds.length === 0) throw new Error("No feed IDs resolved for selected assets")

  const updateData = await fetchHermesUpdateData(feedIds)

        // Read fee via viem public client using the wallet provider
        const publicClient = createPublicClient({ chain: baseSepolia, transport: custom(eip1193) })
        const fee = (await publicClient.readContract({
          address: pyth,
          abi: PYTH_ABI,
          functionName: "getUpdateFee",
          args: [updateData],
        })) as bigint

        const calldata = encodeFunctionData({
          abi: PYTH_ABI,
          functionName: "updatePriceFeeds",
          args: [updateData],
        })

        const hash = await executeGaslessTx({ to: pyth, data: calldata, value: fee })
        toast.success(`Pushed Pyth updates. Tx: ${hash.slice(0, 10)}...`)
        return { success: true, hash }
      } catch (err) {
        const msg = (err as Error)?.message || "Unknown error"
        toast.error(`Push failed: ${msg}`)
        // eslint-disable-next-line no-console
        console.error("[Pyth Push] Error:", err)
        return { success: false, error: msg }
      }
    },
    [wallets, executeGaslessTx]
  )

  return { pushOnChain }
}
