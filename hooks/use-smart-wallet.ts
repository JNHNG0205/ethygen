"use client";

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { baseSepolia } from "viem/chains";
import { toast } from "sonner";

export type GaslessTxParams = Record<string, any>;

export const useSmartWallet = () => {
	const { client, getClientForChain } = useSmartWallets();

	const getBaseSepoliaClient = async () => {
		if (!client) throw new Error("No smart wallet client");
		const chainClient = await getClientForChain({ id: baseSepolia.id });
		if (!chainClient) throw new Error("Smart wallet client unavailable for Base Sepolia");
		return chainClient;
	};

	const executeGaslessTx = async (txParams: GaslessTxParams, uiTitle = "Confirm Tx") => {
		try {
			const baseClient = await getBaseSepoliaClient();
			const hash = await baseClient.sendTransaction({
				...txParams,
			});
			toast.success(`Tx sent: ${hash.slice(0, 10)}... (Gasless!)`);
			return hash;
		} catch (error) {
			const message = (error as Error)?.message ?? "Unknown error";
			toast.error("Tx failed: " + message);
			throw error;
		}
	};

	return { client, getBaseSepoliaClient, executeGaslessTx };
};
