"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { useAccount } from "wagmi";
import { BanknotesIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Vault: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<"deposit" | "stake" | "redeem">("deposit");
  const [depositAmount, setDepositAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");

  const handleDeposit = () => {
    // TODO: Implement deposit functionality
    console.log("Deposit:", depositAmount);
  };

  const handleStake = () => {
    // TODO: Implement staking functionality
    console.log("Stake:", stakeAmount);
  };

  const handleRedeem = () => {
    // TODO: Implement redemption functionality
    console.log("Redeem:", redeemAmount);
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-3xl font-bold">🏦 Yield Vault</span>
            <p className="text-lg mt-2 text-base-content/70">
              Deposit, stake, and earn yield on your unified collateral
            </p>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {/* Vault Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Total Deposited</p>
                  <p className="text-2xl font-bold">0 USDe</p>
                  <p className="text-sm text-base-content/70">$0.00 USD</p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Staked Amount</p>
                  <p className="text-2xl font-bold">0 sUSDe</p>
                  <p className="text-sm text-success">APY: 8.5%</p>
                </div>
                <ArrowUpIcon className="h-8 w-8 text-success" />
              </div>
            </div>
          </div>

          {/* Action Tabs */}
          <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "deposit"
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
                onClick={() => setActiveTab("deposit")}
              >
                Deposit USDC → USDe
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "stake"
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
                onClick={() => setActiveTab("stake")}
              >
                Stake USDe → sUSDe
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "redeem"
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content hover:bg-base-300"
                }`}
                onClick={() => setActiveTab("redeem")}
              >
                Redeem sUSDe → USDe
              </button>
            </div>

            {/* Deposit Tab */}
            {activeTab === "deposit" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deposit USDC to USDe</h3>
                <p className="text-sm text-base-content/70">
                  Convert your USDC to USDe (Unified Stable Dollar) for yield-bearing staking
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="input input-bordered w-full"
                    />
                  </div>
                  
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exchange Rate:</span>
                      <span className="font-medium">1 USDC = 1 USDe</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">You will receive:</span>
                      <span className="font-bold">{depositAmount || "0"} USDe</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDeposit}
                    className="btn btn-primary w-full"
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  >
                    Deposit USDC
                  </button>
                </div>
              </div>
            )}

            {/* Stake Tab */}
            {activeTab === "stake" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stake USDe to sUSDe</h3>
                <p className="text-sm text-base-content/70">
                  Stake your USDe to earn yield and receive sUSDe tokens
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (USDe)</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="input input-bordered w-full"
                    />
                  </div>
                  
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current APY:</span>
                      <span className="font-medium text-success">8.5%</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">You will receive:</span>
                      <span className="font-bold">{stakeAmount || "0"} sUSDe</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStake}
                    className="btn btn-primary w-full"
                    disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                  >
                    Stake USDe
                  </button>
                </div>
              </div>
            )}

            {/* Redeem Tab */}
            {activeTab === "redeem" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Redeem sUSDe to USDe</h3>
                <p className="text-sm text-base-content/70">
                  Redeem your staked USDe tokens back to USDe (includes accrued yield)
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (sUSDe)</label>
                    <input
                      type="number"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      placeholder="0.00"
                      className="input input-bordered w-full"
                    />
                  </div>
                  
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Yield Earned:</span>
                      <span className="font-medium text-success">+0.00 USDe</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">You will receive:</span>
                      <span className="font-bold">{redeemAmount || "0"} USDe</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRedeem}
                    className="btn btn-primary w-full"
                    disabled={!redeemAmount || parseFloat(redeemAmount) <= 0}
                  >
                    Redeem sUSDe
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Yield Information */}
          <div className="bg-base-100 p-6 rounded-3xl shadow-lg mt-8">
            <h2 className="text-xl font-bold mb-4">Yield Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Current Yield Sources</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Aave USDC Lending:</span>
                    <span className="text-success">4.2%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Compound USDC:</span>
                    <span className="text-success">3.8%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Strategy Fee:</span>
                    <span className="text-error">-0.5%</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Yield Distribution</h3>
                <p className="text-sm text-base-content/70 mb-2">
                  Yield is automatically compounded and reflected in your sUSDe balance
                </p>
                <p className="text-sm text-base-content/70">
                  No manual claiming required - yield accrues continuously
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vault;
