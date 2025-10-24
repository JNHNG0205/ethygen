"use client"
import { useCallback } from "react"
import { useWallets } from "@privy-io/react-auth"
import SEPOLIA_CHAIN from "@/lib/chains"
import { createPublicClient, custom, encodeFunctionData } from "viem"
import { parseUnits } from "viem"
import { useSmartWallet } from "@/hooks/use-smart-wallet"
import { USDC_VAULT_ADDRESS, USDC_VAULT_ABI, USDC_ADDRESS, MOCK_TOKEN_ABI } from "@/lib/contracts"

export const useVaultContract = () => {
  const { wallets } = useWallets()
  const { executeGaslessTx } = useSmartWallet()

  const resolvePrimary = () => wallets.find((w: any) => w.walletClientType === "privy") || wallets[0]

  const getEip1193Provider = async () => {
    const primary = resolvePrimary()
    if (!primary) throw new Error("No wallet connected")
    const getProvider = (primary as any)?.getEthereumProvider
    const eip1193: any = getProvider ? await getProvider.call(primary) : (primary as any)?.provider
    if (!eip1193) throw new Error("No EIP-1193 provider available")
    return { eip1193, address: (primary as any)?.address }
  }

  const publicClientFor = (eip1193: any) => createPublicClient({ chain: SEPOLIA_CHAIN.chain, transport: custom(eip1193) })

  // Read-only: get eth->usdc rate
  const getEthToUsdcRate = useCallback(async () => {
    const { eip1193 } = await getEip1193Provider()
    const publicClient = publicClientFor(eip1193)
    const rate = await publicClient.readContract({
      address: USDC_VAULT_ADDRESS,
      abi: USDC_VAULT_ABI,
      functionName: "ethToUsdcRate",
      args: [],
    })
    return rate as bigint
  }, [wallets])

  // Gasless deposit ETH: uses Privy smart wallet's sendTransaction via executeGaslessTx
  const depositETHGasless = useCallback(
    async (amountEther: string) => {
      try {
        const { eip1193 } = await getEip1193Provider()
        const amountWei = parseUnits(amountEther || "0", 18)
        const calldata = encodeFunctionData({ abi: USDC_VAULT_ABI as any, functionName: "depositETH", args: [] })
        const hash = await executeGaslessTx({ to: USDC_VAULT_ADDRESS, data: calldata, value: amountWei })
        return { success: true, hash }
      } catch (err) {
        return { success: false, error: (err as Error)?.message || String(err) }
      }
    },
    [wallets, executeGaslessTx]
  )

  // Signed deposit ETH fallback for non-gasless wallets (eth_sendTransaction via EIP-1193)
  const depositETHSigned = useCallback(
    async (amountEther: string) => {
      try {
        const { eip1193, address } = await getEip1193Provider()
        const amountWei = parseUnits(amountEther || "0", 18)
        const calldata = encodeFunctionData({ abi: USDC_VAULT_ABI as any, functionName: "depositETH", args: [] })

        // build tx params for eth_sendTransaction
        const txParams: any = {
          from: address,
          to: USDC_VAULT_ADDRESS,
          data: calldata,
          value: `0x${amountWei.toString(16)}`,
        }

        // Use EIP-1193 request to prompt the user's wallet to send the tx
        if (typeof eip1193.request === "function") {
          const res = await eip1193.request({ method: "eth_sendTransaction", params: [txParams] })
          return { success: true, hash: res as string }
        }

        throw new Error("EIP-1193 provider does not support request()");
      } catch (err) {
        return { success: false, error: (err as Error)?.message || String(err) }
      }
    },
    [wallets]
  )

  // Unified deposit: try gasless first, fallback to signed tx
  const depositETH = useCallback(
    async (amountEther: string) => {
      // Prefer gasless when available
      try {
        const gasless = await depositETHGasless(amountEther)
        if (gasless.success) return gasless
        // otherwise fallthrough to signed
      } catch (e) {
        // ignore and try signed
      }

      const signed = await depositETHSigned(amountEther)
      return signed
    },
    [depositETHGasless, depositETHSigned]
  )

  // Gasless withdraw (call withdraw with susdeAmount)
  const withdrawGasless = useCallback(
    async (susdeAmount: bigint) => {
      try {
        const { eip1193 } = await getEip1193Provider()
        const calldata = encodeFunctionData({ abi: USDC_VAULT_ABI as any, functionName: "withdraw", args: [susdeAmount] })
        const hash = await executeGaslessTx({ to: USDC_VAULT_ADDRESS, data: calldata })
        return { success: true, hash }
      } catch (err) {
        return { success: false, error: (err as Error)?.message || String(err) }
      }
    },
    [wallets, executeGaslessTx]
  )

  const calculateWithdrawAmount = useCallback(
    async (userAddress: `0x${string}`, susdeAmount: bigint) => {
      const { eip1193 } = await getEip1193Provider()
      const publicClient = publicClientFor(eip1193)
      const res = await publicClient.readContract({
        address: USDC_VAULT_ADDRESS,
        abi: USDC_VAULT_ABI,
        functionName: "calculateWithdrawAmount",
        args: [userAddress, susdeAmount],
      })
      return res as bigint
    },
    [wallets]
  )

  // Deposit USDC: tries gasless approve+deposit then signed fallback
  const depositUSDC = useCallback(
    async (amount: string) => {
      if (!USDC_ADDRESS) return { success: false, error: "USDC address not configured" }
      try {
        const { eip1193, address } = await getEip1193Provider()
        const publicClient = publicClientFor(eip1193)
        const amountBase = parseUnits(amount || "0", 6) // USDC has 6 decimals

        // check allowance
        const allowance = await publicClient.readContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: MOCK_TOKEN_ABI as any,
          functionName: "allowance",
          args: [address as `0x${string}`, USDC_VAULT_ADDRESS as `0x${string}`],
        }) as bigint

        // encode approve calldata if needed
        if (allowance < amountBase) {
          const approveCalldata = encodeFunctionData({ abi: MOCK_TOKEN_ABI as any, functionName: "approve", args: [USDC_VAULT_ADDRESS, amountBase] })
          // try gasless approve
          try {
            await executeGaslessTx({ to: USDC_ADDRESS, data: approveCalldata })
          } catch (_) {
            // signed approve fallback
            if (typeof eip1193.request === "function") {
              const txParams = { from: address, to: USDC_ADDRESS, data: approveCalldata }
              await eip1193.request({ method: "eth_sendTransaction", params: [txParams] })
            } else {
              throw new Error("No provider request() for approve")
            }
          }
        }

        // now call depositUSDC on vault
        const depositCalldata = encodeFunctionData({ abi: USDC_VAULT_ABI as any, functionName: "depositUSDC", args: [amountBase] })

        // try gasless deposit
        try {
          const hash = await executeGaslessTx({ to: USDC_VAULT_ADDRESS, data: depositCalldata })
          return { success: true, hash }
        } catch (e) {
          // signed fallback
          if (typeof eip1193.request === "function") {
            const txParams = { from: address, to: USDC_VAULT_ADDRESS, data: depositCalldata }
            const res = await eip1193.request({ method: "eth_sendTransaction", params: [txParams] })
            return { success: true, hash: res as string }
          }
          throw e
        }
      } catch (err) {
        return { success: false, error: (err as Error)?.message || String(err) }
      }
    },
    [wallets, executeGaslessTx]
  )

  return { getEthToUsdcRate, depositETHGasless, depositETHSigned, depositETH, depositUSDC, withdrawGasless, calculateWithdrawAmount }
}

export default useVaultContract
