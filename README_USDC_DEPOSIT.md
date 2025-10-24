USDC Deposit Integration — Notes & Steps

What changed
- Added `contracts/USDCVault.sol` (local copy) which extends the original vault with a `depositUSDC(uint256 usdcAmount)` function that accepts ERC20 USDC deposits.
- Frontend: `lib/contracts.ts` now includes `depositUSDC` ABI and expanded ERC20 ABI (approve/allowance/transferFrom). It exposes `USDC_ADDRESS` via env var `NEXT_PUBLIC_USDC_ADDRESS`.
- Frontend hook: `hooks/use-vault-contract.ts` now implements `depositUSDC(amountString)` which:
  - Checks current allowance for the vault
  - Tries gasless `approve` (via Privy) if allowance insufficient, falls back to `eth_sendTransaction` signed `approve`
  - Calls `depositUSDC` on the vault (gasless preferred, signed fallback)
- UI: `components/deposit-modal.tsx` wired USDC deposits to call the hook.

Important: Deployment note
- These contract changes exist only in the repository. The deployed vault at `0x76f3580cb3914734Edc56441Df5a175125d5Ecf6` on Sepolia does NOT include `depositUSDC` unless you redeploy a new vault with the updated contract.

To deploy the updated vault (example using Hardhat)
1. Create a Hardhat project and copy `contracts/USDCVault.sol` into `contracts/`.
2. Configure `hardhat.config.ts` for Sepolia provider & private key.
3. Deploy script (pseudo):
   - Deploy MockUSDC (or use existing USDC address)
   - Deploy MockUSDe and MockSUSDe (or use your existing addresses)
   - Deploy `USDCVault` with constructor args: (mockUSDC.address, mockUSDe.address, mockSUSDe.address)

Frontend configuration
- Set the USDC token address in your `.env` (or hosting env):
  - NEXT_PUBLIC_USDC_ADDRESS=0xYourUsdcTokenAddress

Testing the deposit flow
1. Start the dev server (from repo root):
   - pnpm dev
2. Connect a wallet (Privy smart wallet for gasless path, and test with injected MetaMask for signed fallback).
3. Open the Deposit modal, choose USDC, enter amount (e.g., 100), and submit.
4. The UI will:
   - Check allowance; if insufficient, attempt gasless approve (Privy) or prompt wallet to sign approve.
   - Submit depositUSDC to the vault (gasless preferred, signed fallback).
   - On success, you'll see a tx hash in the modal and a toast.

Notes & limitations
- If you prefer permit-based approvals (ERC-2612) for gasless approvals without a prior approve tx, the token and vault need to support it; current mock token doesn't.
- The vault redeployment is required to accept USDC directly; otherwise, frontend calls will revert.

Next steps (I can do for you)
- Add a migration/deploy script (Hardhat/Foundry) and optionally a small test to verify `depositUSDC` behavior.
- Implement UI views for staked balances (sUSDe, yUSDe) and withdrawal flows.
