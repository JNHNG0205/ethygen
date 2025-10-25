"use client";

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import SEPOLIA_CHAIN from "@/lib/chains";
import { toast } from "sonner";

export type GaslessTxParams = Record<string, any>;

export const useSmartWallet = () => {
	const { client, getClientForChain } = useSmartWallets();

	const getSepoliaClient = async () => {
		if (!client) throw new Error("No smart wallet client");
		const chainClient = await getClientForChain({ id: SEPOLIA_CHAIN.id });
		if (!chainClient) throw new Error(`Smart wallet client unavailable for ${SEPOLIA_CHAIN.name}`);
		return chainClient;
	};

	const executeGaslessTx = async (txParams: GaslessTxParams, uiTitle = "Confirm Tx") => {
		try {
			const baseClient = await getSepoliaClient();
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

	return { client, getSepoliaClient, executeGaslessTx };
};
