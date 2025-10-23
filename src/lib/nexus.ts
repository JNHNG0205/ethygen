import { NexusSDK } from '@avail-project/nexus-core';

export const sdk = new NexusSDK({network: 'testnet'});

export function isInitialized() {
    return sdk.isInitialized();
}

export async function initalizeWithProvider(provider: any) {
    if (!provider) throw new Error('No EIP-1193 provider found');

    if (sdk.isInitialized()) return;

    await sdk.initialize(provider);
}

export async function deinit() {
    if (!sdk.isInitialized()) return;

    await sdk.deinit();
}

export async function getUnifiedBalances() {

    //Get unified balances from the SDK
    return await sdk.getUnifiedBalances();
}