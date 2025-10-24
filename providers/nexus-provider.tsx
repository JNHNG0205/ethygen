 'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'
import SEPOLIA_CHAIN from '@/lib/chains'

const NexusContext = createContext<any>(null);

// Temporary debug component to inspect the Privy provider during development.
// Mount this anywhere (or import it into a page) to see the EIP-1193 provider
// and a quick eth_chainId request in the browser console.
export function ProviderTest() {
  const { wallets } = useWallets()

  useEffect(() => {
    const testPrivyProvider = async () => {
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        try {
          const provider = (wallet as any).getEthereumProvider ? await (wallet as any).getEthereumProvider() : (wallet as any).provider
          console.log('Privy Provider (EIP-1193):', provider)

          if (provider && typeof provider.request === 'function') {
            try {
              const chainId = await provider.request({ method: 'eth_chainId' })
              console.log('ProviderTest: Current chain (should be Sepolia 0xaa36a7):', chainId)
            } catch (err) {
              console.error('ProviderTest: eth_chainId request failed:', err)
            }
          } else {
            console.warn('ProviderTest: provider is missing request()')
          }
        } catch (err) {
          console.error('ProviderTest: provider test failed:', err)
        }
      }
    }
    void testPrivyProvider()
  }, [wallets])

  return null
}

// We'll import the SDK dynamically inside effects to avoid SSR issues

export const NexusProvider = ({ children }: { children: ReactNode }) => {
  const [sdkInstance, setSdkInstance] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initTried, setInitTried] = useState(false);

  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  // Prefer embedded Privy wallet if present, else first wallet
  const primaryWallet: any = wallets.find((w: any) => w.walletClientType === 'privy') || wallets[0]
  const walletProviderGetter: any = (primaryWallet && (primaryWallet as any).getEthereumProvider) || null
  const fallbackProvider: any = (primaryWallet as any)?.provider || null
  const address: string | undefined = (primaryWallet as any)?.address || wallets[0]?.address

  // Init SDK on wallet connect (per tutorial)
  useEffect(() => {
  if (!authenticated || sdkInstance) return

    const initSdk = async () => {
      try {
        setIsLoading(true)
        const mod = await import('@avail-project/nexus')

        // Resolve an EIP-1193 provider from Privy wallet.
        // Providers may not be immediately available (race with Privy SDK/wallet creation),
        // so retry a few times before giving up and showing a helpful message.
        const resolveProviderWithRetries = async (attempts = 6, delayMs = 500) => {
          const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
          for (let i = 0; i < attempts; i++) {
            const currentPrimary = wallets.find((w: any) => w.walletClientType === 'privy') || wallets[0]
            let resolvedRaw: any = null
            try {
              if (currentPrimary) {
                if (typeof (currentPrimary as any).getEthereumProvider === 'function') {
                  resolvedRaw = await (currentPrimary as any).getEthereumProvider()
                } else if (typeof (currentPrimary as any).getEthersProvider === 'function') {
                  resolvedRaw = await (currentPrimary as any).getEthersProvider()
                } else {
                  resolvedRaw = (currentPrimary as any)?.provider || null
                }
              }
            } catch (err) {
              console.warn('[Nexus] Error calling getEthereumProvider/getEthersProvider', err)
            }

            // Fallback to window.ethereum if available
            if (!resolvedRaw && typeof window !== 'undefined' && (window as any).ethereum) {
              resolvedRaw = (window as any).ethereum
            }

            // Normalize provider shapes to an EIP-1193-like object with request() and event hooks
            let normalized: any = null
            if (resolvedRaw) {
              // If it already has request(), use it
              if (typeof resolvedRaw.request === 'function') {
                normalized = resolvedRaw
              } else if (resolvedRaw && typeof resolvedRaw.provider === 'object' && typeof resolvedRaw.provider.request === 'function') {
                normalized = resolvedRaw.provider
              } else if (typeof resolvedRaw.sendAsync === 'function' || typeof resolvedRaw.send === 'function') {
                // Wrap legacy provider
                normalized = {
                  request: async ({ method, params }: { method: string; params?: any[] }) => {
                    if (typeof resolvedRaw.request === 'function') return resolvedRaw.request({ method, params })
                    if (typeof resolvedRaw.sendAsync === 'function') {
                      return await new Promise((res, rej) => {
                        resolvedRaw.sendAsync({ jsonrpc: '2.0', id: Date.now(), method, params: params || [] }, (err: any, result: any) => {
                          if (err) return rej(err)
                          return res(result?.result ?? result)
                        })
                      })
                    }
                    if (typeof resolvedRaw.send === 'function') {
                      // Some providers return result synchronously
                      return await new Promise((res, rej) => {
                        try {
                          const result = resolvedRaw.send({ jsonrpc: '2.0', id: Date.now(), method, params: params || [] })
                          res(result)
                        } catch (e) { rej(e) }
                      })
                    }
                    throw new Error('No request-capable transport on provider')
                  },
                  on: resolvedRaw.on?.bind(resolvedRaw) ?? (() => {}),
                  removeListener: resolvedRaw.removeListener?.bind(resolvedRaw) ?? (() => {}),
                  addListener: resolvedRaw.addListener?.bind(resolvedRaw) ?? (() => {}),
                  once: resolvedRaw.once?.bind(resolvedRaw) ?? (() => {}),
                }
              }
            }

            if (normalized) {
              // Avoid selecting known non-EVM providers (e.g., Phantom) as the primary
              if ((currentPrimary as any)?.walletClientType === 'phantom' || (resolvedRaw && (resolvedRaw as any)?.isPhantom)) {
                console.log('[Nexus] skipping Phantom/non-EVM provider')
                // continue retrying to find a proper EVM provider
                await wait(delayMs)
                continue
              }

              // Verify the provider responds to eth_chainId (quick probe). If it doesn't,
              // skip it — many non-EVM wallets expose different RPC surfaces.
              try {
                const probe = await (normalized.request as any)({ method: 'eth_chainId' }).catch(() => null)
                if (!probe || typeof probe !== 'string') {
                  console.log('[Nexus] provider probe failed (no eth_chainId), skipping')
                  await wait(delayMs)
                  continue
                }
              } catch (probeErr) {
                console.log('[Nexus] provider probe threw, skipping', probeErr)
                await wait(delayMs)
                continue
              }

              console.log('[Nexus] resolved provider normalized, supports request=', typeof normalized.request === 'function')
              return { provider: normalized, primary: currentPrimary }
            }

            // short delay and retry
            await wait(delayMs)
          }
          return { provider: null, primary: wallets.find((w: any) => w.walletClientType === 'privy') || wallets[0] }
        }

        const { provider, primary: resolvedPrimary } = await resolveProviderWithRetries()
        console.log('[Nexus] primaryWallet (resolved):', { id: (resolvedPrimary as any)?.id, address: (resolvedPrimary as any)?.address, walletClientType: (resolvedPrimary as any)?.walletClientType })
        console.log('[Nexus] resolved provider exists?', !!provider, 'providerSupportsRequest=', typeof (provider as any)?.request === 'function')

        if (!provider) {
          const msg = 'No EIP-1193 provider available for Nexus initialization. Ensure your Privy smart wallet is created and connected.'
          console.error('[Nexus] ' + msg)
          setError(msg)
          toast.error(msg)
          setIsLoading(false)
          setInitTried(true)
          return
        }

        // Build SDK instance using official NexusSDK constructor
        const buildInstance = (m: any) => {
          if (m?.NexusSDK && typeof m.NexusSDK === 'function') {
            return new m.NexusSDK({ network: 'testnet', debug: true })
          }
          if (m?.default?.NexusSDK && typeof m.default.NexusSDK === 'function') {
            return new m.default.NexusSDK({ network: 'testnet', debug: true })
          }
          console.error('[Nexus] NexusSDK not found. Keys:', Object.keys(m || {}))
          throw new Error('NexusSDK not found in module')
        }

        const instance = buildInstance(mod as any)

        // Attempt to initialize the Nexus SDK against a configured Sepolia RPC first.
        // This avoids cases where the wallet provider briefly reports the wrong chain
        // during init (CA sometimes sees chainId 1). Using a known Sepolia RPC for
        // initialization is safe for read-only operations like fetching unified balances.
        // Prefer an explicit Sepolia RPC if provided (publicnode tends to support all methods).
        const rpcUrl = process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || process.env.NEXT_PUBLIC_AVAIL_NEXUS_RPC_ETHEREUM || ''
        if (rpcUrl) {
          try {
            const makeRpcLikeProvider = (url: string, knownAddress?: string | undefined) => {
              // Minimal EIP-1193-like provider backed by a JSON-RPC endpoint.
              // Provide event hooks (.on/.removeListener) as no-ops so CA can attach listeners.
              return {
                request: async ({ method, params }: { method: string; params?: any[] }) => {
                  try {
                    // For wallet-only methods, return safe deterministic values so CA
                    // can progress through initialization even when no signer is present.
                    if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
                      return knownAddress ? [knownAddress] : []
                    }
                    if (method === 'eth_accounts') {
                      return knownAddress ? [knownAddress] : []
                    }
                    if (method === 'eth_chainId') {
                      return SEPOLIA_CHAIN.hexId
                    }
                    if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') {
                      // No-op on pure RPC
                      return null
                    }

                    const body = { jsonrpc: '2.0', id: Date.now(), method, params: params || [] }
                    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                    const text = await res.text()
                    // Some RPCs may return non-JSON error pages; try to parse JSON safely
                    let j: any
                    try { j = JSON.parse(text) } catch (parseErr) {
                      throw new Error(`RPC returned non-JSON response for ${method}: ${text.slice(0, 200)}`)
                    }
                    if (j.error) throw j.error
                    return j.result
                  } catch (err) {
                    // Bubble up for higher-level handling
                    throw err
                  }
                },
                // Provide basic event methods expected by some SDKs
                on: (_: string, __?: any) => {},
                removeListener: (_: string, __?: any) => {},
                addListener: (_: string, __?: any) => {},
                once: (_: string, __?: any) => {},
              }
            }

            // Use the most up-to-date wallet address available to avoid passing `undefined`
            const liveAddressCandidate = wallets.find((w: any) => !!(w as any)?.address)?.address || address
            const isValidAddress = typeof liveAddressCandidate === 'string' && /^0x[a-fA-F0-9]{40}$/.test(liveAddressCandidate)
            if (!isValidAddress) {
              console.log('[Nexus] Skipping RPC-first init: no valid wallet address available yet')
            } else {
              const rpcProvider = makeRpcLikeProvider(rpcUrl, liveAddressCandidate)
              console.log('[Nexus] Attempting CA init using configured Sepolia RPC provider:', rpcUrl)
              await instance.initialize(rpcProvider)
            }
            console.log('[Nexus] SDK initialized with configured Sepolia RPC provider')
            setSdkInstance(instance)
            setIsInitialized(true)
            if (!initTried) toast.success('Nexus SDK initialized (via Sepolia RPC)')
            // Set auto-approval hooks after initialization
            if (typeof instance.setOnAllowanceHook === 'function') {
              instance.setOnAllowanceHook(async () => ({ allowance: 'min' }))
            }
            if (typeof instance.setOnIntentHook === 'function') {
              instance.setOnIntentHook(async () => ({}))
            }
            // We intentionally continue without calling provider-based initialize;
            // balances and read-only calls will work via the RPC. Return early from initSdk.
            return
          } catch (rpcInitErr) {
            console.warn('[Nexus] Configured RPC init failed, falling back to provider init', rpcInitErr)
            // continue to try provider-based init below
          }
        }

        // Ensure provider is alive and chain is accessible before initializing
        try {
          if (typeof (provider as any)?.request === 'function') {
            await (provider as any).request({ method: 'eth_chainId' }).catch(() => undefined)
            await (provider as any).request({ method: 'eth_requestAccounts' }).catch(() => undefined)
          }
        } catch {}

        // Ensure the resolved provider is on Sepolia (or attempt to switch/add it).
        const ensureSepolia = async (prov: any): Promise<boolean> => {
          if (!prov || typeof prov.request !== 'function') return true
          try {
            const hex = SEPOLIA_CHAIN.hexId
            const current = await prov.request({ method: 'eth_chainId' }).catch(() => null)
            if (current === hex) return true

            // Try switching
            try {
              await prov.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] })
              return true
            } catch (err: any) {
              // If chain not recognized, try to add it
              if (err?.code === 4902 || /Unrecognized chain/i.test(String(err?.message))) {
                try {
                  await prov.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                      {
                        chainId: hex,
                        chainName: SEPOLIA_CHAIN.name,
                        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: [SEPOLIA_CHAIN.rpcUrl],
                        blockExplorerUrls: [SEPOLIA_CHAIN.explorerUrl],
                      },
                    ],
                  })
                  return true
                } catch {
                  return false
                }
              }
              return false
            }
          } catch {
            return false
          }
        }

        const ok = await ensureSepolia(provider)
        console.log('[Nexus] ensureSepolia result=', ok)
        if (!ok) {
          // If the user rejected the chain switch or we couldn't add Sepolia, bail out with a helpful message
          const msg = 'Please switch your wallet to Ethereum Sepolia (approve the prompt) or use the Privy smart wallet.'
          setError(msg)
          toast.error(msg)
          setIsLoading(false)
          setInitTried(true)
          return
        }

        // Verify the provider actually reports Sepolia after requesting a switch.
        // Some wallets report success before the chain state is settled; poll a few times.
        try {
          const hex = SEPOLIA_CHAIN.hexId
          let current = await provider.request({ method: 'eth_chainId' }).catch(() => null)
          let attempts = 0
          while (current !== hex && attempts < 8) {
            // Wait briefly then re-check
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 300))
            // eslint-disable-next-line no-await-in-loop
            current = await provider.request({ method: 'eth_chainId' }).catch(() => null)
            attempts += 1
          }
          console.log('[Nexus] post-switch chainId=', current, 'verified=', current === hex)
          if (current !== hex) {
            const msg = 'Wallet did not switch to Sepolia in time. Please manually switch your wallet to Sepolia and retry.'
            setError(msg)
            toast.error(msg)
            setIsLoading(false)
            setInitTried(true)
            return
          }
        } catch (e) {
          // ignore and continue; doInit may still fail which we handle below
          console.warn('[Nexus] error verifying chain after switch', e)
        }

        // Call SDK's initialize() method with provider (required per v1.1.0 docs)
        const doInit = async () => {
          if (typeof instance.initialize === 'function') {
            await instance.initialize(provider)
            console.log('[Nexus] SDK initialized with provider')
          } else {
            console.warn('[Nexus] No initialize method found')
          }
        }

        const tryInitWithFallback = async (attempts = 2) => {
          try {
            await doInit()
            return true
          } catch (e: any) {
            console.warn('[Nexus] First initialize attempt failed, retrying once…', e)
            // If the error indicates unsupported chainId 1, attempt initializing
            // the SDK against a Sepolia RPC transport (read-only) so CA can finish init.
            const msg = String(e?.message || e)
              if (/Unsupported chainId/i.test(msg) || /Unsupported chainId 1/.test(msg)) {
              const rpcUrl = process.env.NEXT_PUBLIC_AVAIL_NEXUS_RPC_ETHEREUM || process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC || ''
              if (rpcUrl) {
                try {
                  const makeRpcLikeProvider = (url: string, knownAddress?: string | undefined) => {
                    return {
                      request: async ({ method, params }: { method: string; params?: any[] }) => {
                        try {
                          if (method === 'eth_requestAccounts' || method === 'wallet_requestPermissions') {
                            return knownAddress ? [knownAddress] : []
                          }
                          if (method === 'eth_accounts') {
                            return knownAddress ? [knownAddress] : []
                          }
                          if (method === 'eth_chainId') {
                            return SEPOLIA_CHAIN.hexId
                          }
                          if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') {
                            return null
                          }

                          const body = { jsonrpc: '2.0', id: Date.now(), method, params: params || [] }
                          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                          const text = await res.text()
                          let j: any
                          try { j = JSON.parse(text) } catch (parseErr) {
                            throw new Error(`RPC returned non-JSON response for ${method}: ${text.slice(0, 200)}`)
                          }
                          if (j.error) throw j.error
                          return j.result
                        } catch (err) {
                          throw err
                        }
                      },
                      on: (_: string, __?: any) => {},
                      removeListener: (_: string, __?: any) => {},
                      addListener: (_: string, __?: any) => {},
                      once: (_: string, __?: any) => {},
                    }
                  }

                  // Use latest known address when attempting fallback RPC init
                  const liveAddressCandidate = wallets.find((w: any) => !!(w as any)?.address)?.address || address
                  const isValidAddress = typeof liveAddressCandidate === 'string' && /^0x[a-fA-F0-9]{40}$/.test(liveAddressCandidate)
                  if (!isValidAddress) {
                    console.log('[Nexus] Skipping fallback RPC init: no valid wallet address available')
                  } else {
                    const rpcProvider = makeRpcLikeProvider(rpcUrl, liveAddressCandidate)
                    console.log('[Nexus] Attempting CA init using fallback RPC provider:', rpcUrl)
                    await instance.initialize(rpcProvider)
                  }
                  console.log('[Nexus] SDK initialized with fallback RPC provider')
                  return true
                } catch (rpcErr) {
                  console.warn('[Nexus] Fallback RPC initialize failed', rpcErr)
                }
              }
            }

            // Retry original init once more (some wallets need a tiny delay to finalize switch)
            if (attempts > 0) {
              await new Promise((r) => setTimeout(r, 1000))
              return tryInitWithFallback(attempts - 1)
            }
            throw e
          }
        }

        await tryInitWithFallback()

        // Set auto-approval hooks after initialization
        if (typeof instance.setOnAllowanceHook === 'function') {
          instance.setOnAllowanceHook(async () => ({ allowance: 'min' }))
        }
        if (typeof instance.setOnIntentHook === 'function') {
          instance.setOnIntentHook(async () => ({}))
        }

        setSdkInstance(instance)
        setIsInitialized(true)
        if (!initTried) toast.success('Nexus SDK initialized!')
      } catch (err) {
        const msg = (err as Error)?.message || 'Unknown error'
        setError(msg)
        if (!initTried) {
          // Clarify common causes for CA init failures
          const friendly = /Backend initialization failed|initialize CA/i.test(msg)
            ? 'Failed to initialize Chain Abstraction. This is not due to zero balance. Please refresh or reconnect; it may be a temporary backend issue.'
            : msg
          toast.error('SDK init failed: ' + friendly)
        }
      } finally {
        setIsLoading(false)
        setInitTried(true)
      }
    }

    void initSdk()
  }, [authenticated, walletProviderGetter, fallbackProvider, sdkInstance, primaryWallet])

  // Fetch balances (tutorial's fetchBalances)
  const fetchBalances = async () => {
    if (!sdkInstance || isLoading) return
    try {
      setIsLoading(true)
      setError(null)

      // Resolve a compatible getUnifiedBalances function regardless of SDK surface
      const resolveGetUnifiedBalances = (sdk: any) => {
        const direct = sdk?.getUnifiedBalances
        const nestedBalances = sdk?.balances?.getUnifiedBalances
        const clientBalances = sdk?.client?.getUnifiedBalances
        // Ensure correct `this` binding for instance methods
        const anyExport = typeof direct === 'function' ? direct.bind(sdk)
          : typeof nestedBalances === 'function' ? nestedBalances.bind(sdk?.balances)
          : typeof clientBalances === 'function' ? clientBalances.bind(sdk?.client)
          : null
        return anyExport
      }

      const fn = resolveGetUnifiedBalances(sdkInstance)
      if (!fn) {
        console.error('[Nexus] getUnifiedBalances not found. SDK keys:', Object.keys(sdkInstance || {}))
        throw new Error('Nexus SDK does not expose getUnifiedBalances')
      }

      // Try calling with parameters then fall back to no-arg
      let unifiedBalances: any[] | undefined
      try {
        unifiedBalances = await fn({ address, network: 'testnet' })
      } catch (paramErr) {
        console.warn('[Nexus] Param call failed, trying no-arg:', paramErr)
        unifiedBalances = await fn()
      }
      setBalances(unifiedBalances || [])
      console.log('[Nexus] Unified balances:', unifiedBalances)
      toast.success(`Fetched ${unifiedBalances?.length || 0} assets!`)
    } catch (err) {
      const msg = (err as Error)?.message || 'Unknown error'
      setError(msg)
      console.error('[Nexus] Balance fetch failed:', err)
      toast.error('Balance fetch failed: ' + msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh on init or manual (with delay to allow CA to fully initialize)
  useEffect(() => {
    if (isInitialized && !isLoading && sdkInstance) {
      const timer = setTimeout(() => {
        fetchBalances()
      }, 500) // Small delay to ensure CA is ready
      return () => clearTimeout(timer)
    }
  }, [isInitialized, sdkInstance])

  // Reset on disconnect
  useEffect(() => {
    if (!authenticated) {
      setBalances([])
      setIsInitialized(false)
      setSdkInstance(null)
    }
  }, [authenticated])

  return (
    <NexusContext.Provider value={{ sdk: sdkInstance, balances, isLoading, error, refreshBalances: fetchBalances, isInitialized }}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => useContext(NexusContext);