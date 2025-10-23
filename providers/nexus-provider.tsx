'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'

const NexusContext = createContext<any>(null);

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

        // Resolve an EIP-1193 provider from Privy wallet
        const provider = walletProviderGetter
          ? await walletProviderGetter.call(primaryWallet)
          : fallbackProvider

        if (!provider) throw new Error('No EIP-1193 provider available')

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

        // Ensure provider is alive and chain is accessible before initializing
        try {
          if (typeof (provider as any)?.request === 'function') {
            await (provider as any).request({ method: 'eth_chainId' }).catch(() => undefined)
            await (provider as any).request({ method: 'eth_requestAccounts' }).catch(() => undefined)
          }
        } catch {}

        // Call SDK's initialize() method with provider (required per v1.1.0 docs)
        const doInit = async () => {
          if (typeof instance.initialize === 'function') {
            await instance.initialize(provider)
            console.log('[Nexus] SDK initialized with provider')
          } else {
            console.warn('[Nexus] No initialize method found')
          }
        }

        try {
          await doInit()
        } catch (e) {
          console.warn('[Nexus] First initialize attempt failed, retrying once…', e)
          await new Promise((r) => setTimeout(r, 1000))
          await doInit()
        }

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