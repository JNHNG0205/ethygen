"use client"

import { useEffect, useRef } from "react"
import SEPOLIA_CHAIN from "@/lib/chains"

/**
 * InjectedChainBootstrap
 * Run as early as possible in the app to attempt switching any injected wallet
 * (MetaMask / other EIP-1193 providers) to the application's desired chain (Sepolia).
 * This runs outside of the Privy lifecycle so the injected provider will be
 * prompted before sign-in flows that rely on window.ethereum.
 */
export default function InjectedChainBootstrap() {
  const requestedRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return
    const injected: any = (window as any).ethereum
    const hexChainId = SEPOLIA_CHAIN.hexId

    const trySwitch = async () => {
      if (requestedRef.current) return
      requestedRef.current = true
      try {
        const current = await injected.request({ method: "eth_chainId" }).catch(() => null)
        if (current === hexChainId) return

        try {
          await injected.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexChainId }] })
        } catch (err: any) {
          // If chain not recognized, try to add it (will prompt user)
          if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
            try {
              await injected.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: hexChainId,
                    chainName: SEPOLIA_CHAIN.name,
                    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                    rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                    blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
                  },
                ],
              })
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore failures; non-fatal
      }
    }

    void trySwitch()

    // Defensive: wrap provider.request so any signature/tx requests will first
    // attempt to switch to Sepolia. This helps when SDKs trigger sign requests
    // before our initial trySwitch completes or when the user triggers actions
    // quickly.
    let origRequest: any = null
    try {
      if (typeof injected.request === 'function') {
        origRequest = injected.request.bind(injected)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        injected.request = async (payload: any) => {
          try {
            const method = typeof payload === 'string' ? payload : payload?.method
            const signatureLike = [
              'personal_sign',
              'eth_sign',
              'eth_signTypedData',
              'eth_signTypedData_v3',
              'eth_signTypedData_v4',
              'eth_sendTransaction',
              'eth_sendRawTransaction',
            ]

            if (method && signatureLike.includes(method)) {
              const current = await origRequest({ method: 'eth_chainId' }).catch(() => null)
              if (current !== hexChainId) {
                // Attempt a switch before proceeding with the signature/tx request
                try {
                  await origRequest({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChainId }] })
                } catch (err: any) {
                  if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
                    try {
                      await origRequest({
                        method: 'wallet_addEthereumChain',
                        params: [
                          {
                            chainId: hexChainId,
                            chainName: SEPOLIA_CHAIN.name,
                            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                            blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
                          },
                        ],
                      })
                    } catch {
                      // ignore
                    }
                  }
                }
              }
            }
          } catch {
            // ignore and fallback to original request
          }
          return origRequest(payload)
        }
      }
    } catch {
      // ignore
    }

    // If the user manually changes network, re-run the switch attempt so future flows still prompt
    const onChainChanged = (chainId: string) => {
      if (chainId !== hexChainId) {
        requestedRef.current = false
        void trySwitch()
      }
    }

    try {
      injected.on && injected.on("chainChanged", onChainChanged)
    } catch {
      // ignore
    }

    return () => {
      try {
        // restore original request implementation if we wrapped it
        if (origRequest) injected.request = origRequest
        injected.removeListener && injected.removeListener("chainChanged", onChainChanged)
      } catch {
        // ignore
      }
    }
  }, [])

  return null
}
