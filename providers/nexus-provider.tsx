'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback, SetStateAction, Dispatch } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// Dynamic imports to avoid Buffer issues during module evaluation
let NexusSDK: any = null;

// Load SDK types dynamically with Buffer polyfill
const loadNexusTypes = async () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Ensure Buffer is available before loading SDK
    if (!window.Buffer) {
      const { Buffer } = await import('buffer');
      window.Buffer = Buffer;
    }
    
    const nexusCore = await import('@avail-project/nexus-core');
    NexusSDK = nexusCore.NexusSDK;
  } catch (error) {
    console.error('Failed to load Nexus SDK types:', error);
    throw error;
  }
};

interface NexusContextType {
  nexusSdk: any;
  isInitialized: boolean;
  allowanceModal: any;
  setAllowanceModal: Dispatch<SetStateAction<any>>;
  intentModal: any;
  setIntentModal: Dispatch<SetStateAction<any>>;
  cleanupSDK: () => void;
  unifiedBalances: any[];
  setUnifiedBalances: Dispatch<SetStateAction<any[]>>;
  balances: any[];
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => void;
}

const NexusContext = createContext<NexusContextType | undefined>(undefined);

interface NexusProviderProps {
  children: ReactNode;
}

export const NexusProvider: React.FC<NexusProviderProps> = ({
  children,
}) => {
  const [nexusSdk, setNexusSdk] = useState<any>(undefined);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [allowanceModal, setAllowanceModal] = useState<any>(null);
  const [intentModal, setIntentModal] = useState<any>(null);
  const [unifiedBalances, setUnifiedBalances] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { connector } = useAccount();

  // Prefer embedded Privy wallet if present, else first wallet
  const primaryWallet: any = wallets.find((w: any) => w.walletClientType === 'privy') || wallets[0];
  const address: string | undefined = (primaryWallet as any)?.address || wallets[0]?.address;

  const initializeSDK = useCallback(async () => {
    if (authenticated && !nexusSdk && connector) {
      try {
        // Load Nexus SDK types first
        await loadNexusTypes();
        
        if (!NexusSDK) {
          throw new Error("Failed to load Nexus SDK");
        }

        // Get the EIP-1193 provider from the connector
        const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNET === "true";
        console.log('Nexus SDK network mode:', isTestnet ? 'testnet' : 'mainnet');
        const provider = (await connector.getProvider()) as any;

        if (!provider) {
          throw new Error("No EIP-1193 provider available");
        }

        const sdk = new NexusSDK({
          network: isTestnet ? "testnet" : "mainnet",
          debug: false, // Disable debug to reduce API calls
        });

        // Initialize SDK with error handling
        try {
          await sdk.initialize(provider);
          setNexusSdk(sdk);
          setIsInitialized(true);
          
          console.log("Nexus SDK initialized successfully");
          
          // Set up hooks for smart wallet integration
          sdk.setOnAllowanceHook(async (data: any) => {
            // Auto-approve minimum allowances for smart wallets
            data.allow(['min']);
          });

          sdk.setOnIntentHook((data: any) => {
            // Auto-approve intents for smart wallets (gasless)
            data.allow();
          });

          // Try to get supported chains (optional)
          try {
            const chains = sdk.utils.getSupportedChains();
            console.log("Supported chains", chains);
          } catch (error) {
            console.warn('Could not get supported chains:', error);
          }

          // Balances will be fetched manually when needed via refreshBalances()
        } catch (initError) {
          console.error('SDK initialization failed:', initError);
          throw initError;
        }

      } catch (error) {
        console.error("Failed to initialize NexusSDK:", error);
        setIsInitialized(false);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        if (error instanceof Error && error.message.includes('Buffer')) {
          console.error('Buffer polyfill issue detected. Please refresh the page.');
        } else if (error instanceof Error && error.message.includes('404')) {
          console.warn('Nexus SDK service not available. This may be expected in development.');
          // Don't throw the error, just mark as not initialized
          setIsInitialized(false);
        }
      }
    }
  }, [authenticated, nexusSdk, connector]);

  const cleanupSDK = useCallback(() => {
    if (nexusSdk) {
      nexusSdk.deinit();
      setNexusSdk(undefined);
      setIsInitialized(false);
      setUnifiedBalances([]);
      setBalances([]);
    }
  }, [nexusSdk]);

  // Fetch balances function
  const refreshBalances = useCallback(async () => {
    if (!nexusSdk || isLoading) return;
    try {
      setIsLoading(true);
      setError(null);

      const balances = await nexusSdk.getUnifiedBalances();
      setUnifiedBalances(balances);
      setBalances(balances);
    } catch (err) {
      const msg = (err as Error)?.message || 'Unknown error';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [nexusSdk, isLoading]);

  useEffect(() => {
    if (!authenticated) {
      cleanupSDK();
    } else {
      initializeSDK();
    }

    return () => {
      cleanupSDK();
    };
  }, [authenticated, cleanupSDK, initializeSDK]);

  // Remove automatic balance refresh - balances will be fetched manually when needed

  const contextValue: NexusContextType = useMemo(
    () => ({
      nexusSdk,
      isInitialized,
      allowanceModal,
      setAllowanceModal,
      intentModal,
      setIntentModal,
      cleanupSDK,
      unifiedBalances,
      setUnifiedBalances,
      balances,
      isLoading,
      error,
      refreshBalances,
    }),
    [nexusSdk, isInitialized, allowanceModal, intentModal, cleanupSDK, unifiedBalances, balances, isLoading, error, refreshBalances],
  );

  return (
    <NexusContext.Provider value={contextValue}>
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
};