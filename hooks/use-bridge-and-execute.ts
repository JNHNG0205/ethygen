"use client";
import { useCallback } from "react";
import { useNexus } from "@/providers/nexus-provider";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { parseUnits } from "viem";
import SEPOLIA_CHAIN from "@/lib/chains";

export interface BridgeResult {
  success: boolean;
  executeTxHash?: string;
  bridgeTxHash?: string;
  error?: string;
  bridgeSkipped: boolean;
}

// Minimal local metadata fallback for common tokens. Extend as needed.
const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  USDT: 6,
  DAI: 18,
  ETH: 18,
  WETH: 18,
};

export interface ExecuteContractConfig {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
}

export const useBridgeAndExecute = () => {
  const { sdk, balances } = useNexus() as any;
  const { executeGaslessTx } = useSmartWallet();

  const bridgeAndExecute = useCallback(
    async (
  token: string, // e.g., 'USDC' | 'ETH' | 'WETH'
  amount: string, // human-readable, e.g., '100'
  sourceChains: number[] = [SEPOLIA_CHAIN.id], // default to Ethereum Sepolia as source (will auto-derive if possible)
      executeContract?: ExecuteContractConfig,
      receiver?: `0x${string}` // optional receiver for execute step
    ): Promise<BridgeResult> => {
      try {
        if (!sdk) throw new Error("Nexus SDK not initialized");

        // Resolve methods from SDK regardless of surface
        // Resolve and bind methods to preserve `this` context (SDK uses instance state like nexusAdapter)
        const resolveAndBind = (holder: any, methodName: string) => {
          const fn = holder?.[methodName]
          return typeof fn === 'function' ? fn.bind(holder) : undefined
        }

        const simulate =
          resolveAndBind(sdk, 'simulateBridgeAndExecute') ||
          resolveAndBind(sdk?.bridge, 'simulateBridgeAndExecute') ||
          resolveAndBind(sdk?.client, 'simulateBridgeAndExecute')

        const exec =
          resolveAndBind(sdk, 'bridgeAndExecute') ||
          resolveAndBind(sdk?.bridge, 'bridgeAndExecute') ||
          resolveAndBind(sdk?.client, 'bridgeAndExecute')

        if (typeof simulate !== "function" || typeof exec !== "function") {
          // eslint-disable-next-line no-console
          console.error("[useBridgeAndExecute] SDK methods missing. Keys:", Object.keys(sdk || {}));
          throw new Error("Nexus SDK does not expose bridgeAndExecute methods");
        }

  // Normalize token for Nexus testnet: many bridges expect WETH instead of native ETH
  const normalizedToken = token.toUpperCase() === 'ETH' ? 'WETH' : token.toUpperCase();
  const decimals = TOKEN_DECIMALS[normalizedToken] ?? TOKEN_DECIMALS[token] ?? 18;

        // Auto-derive source chains from unified balances if available and default was left as [1]
        let derivedSourceChains: number[] = sourceChains
        try {
          if (Array.isArray(balances) && sourceChains?.length === 1 && sourceChains[0] === 1) {
            const chainsWithBalance = balances
              .filter((b: any) => (b?.symbol || b?.token || '').toUpperCase() === token.toUpperCase())
              .filter((b: any) => {
                const v = Number(b?.balance ?? b?.amount ?? b?.value ?? 0)
                return !Number.isNaN(v) && v > 0
              })
              .map((b: any) => Number(b?.chainId ?? b?.chain?.id))
              .filter((id: any) => Number.isInteger(id))
            if (chainsWithBalance.length > 0) {
              derivedSourceChains = Array.from(new Set(chainsWithBalance))
            }
          }
        } catch (_) {
          // noop - fallback to provided default
        }

        // Prepare execute config if provided
        const maybeExecuteCfg = executeContract
          ? {
              contractAddress: executeContract.address,
              contractAbi: executeContract.abi,
              functionName: executeContract.functionName,
              buildFunctionParams: (
                _token: string,
                humanAmount: string,
                _toChainId: number,
                userAddr: `0x${string}`
              ) => {
                const amtWei = parseUnits(humanAmount, decimals);
                // Many vault mints follow pattern mint(amount, receiver)
                return { functionParams: receiver ? [amtWei, receiver] : [amtWei, userAddr] };
              },
              tokenApproval: { token: normalizedToken, amount },
            }
          : undefined;

        // Default to Ethereum Sepolia
        const simResult = await simulate!({
          toChainId: SEPOLIA_CHAIN.id,
          token: normalizedToken,
          amount,
          sourceChains: derivedSourceChains,
          execute: maybeExecuteCfg,
        });

        if (!simResult?.success) {
          throw new Error(simResult?.error || "Simulation failed");
        }

        // Execute; prefer using prepared execution data from simulation if present
        const execParams: any = {
          toChainId: SEPOLIA_CHAIN.id,
          token: normalizedToken,
          amount,
          sourceChains: derivedSourceChains,
          execute: simResult.execute || maybeExecuteCfg,
          waitForReceipt: true,
          requiredConfirmations: 1,
        };

  const result = await exec!(execParams);

        // If SDK returns a transaction request to sign for the execute leg, try gasless send
        const txReq = (result as any)?.executeTransactionRequest || (simResult as any)?.executeTransactionRequest;
        if (txReq && txReq.to && txReq.data) {
          try {
            await executeGaslessTx({ to: txReq.to as `0x${string}`, data: txReq.data as `0x${string}`, value: txReq.value ?? 0n });
          } catch (signErr) {
            // Non-fatal: we still return the hashes SDK produced if any
            console.warn("Gasless execution attempt failed:", signErr);
          }
        }

        return {
          success: !!result?.success,
          executeTxHash: (result as any)?.executeTransactionHash,
          bridgeTxHash: (result as any)?.bridgeTransactionHash,
          bridgeSkipped: !!(result as any)?.bridgeSkipped,
        };
      } catch (error) {
        const msg = (error as any)?.message || "Unknown error";
        // Provide clearer hints for common backend messages
        let friendly = msg;
        if (/insufficient balance/i.test(msg)) {
          friendly = "Insufficient balance on selected source chains. Top up or choose a chain with funds.";
        } else if (/universe is not supported|not supported/i.test(msg)) {
          friendly = "This token/chain combination isn't supported in the current testnet universe. Try WETH or USDC, or a supported source chain (e.g., Arbitrum/OP Sepolia).";
        }
        return {
          success: false,
          error: friendly,
          bridgeSkipped: false,
        };
      }
    },
    [sdk, executeGaslessTx, balances]
  );

  return { bridgeAndExecute };
};
