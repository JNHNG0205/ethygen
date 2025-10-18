"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Dashboard: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <h1 className="text-center mb-8">
            <span className="block text-3xl font-bold">📊 Portfolio Dashboard</span>
            <p className="text-lg mt-2 text-base-content/70">
              Track your unified cross-chain assets and trading performance
            </p>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Total Portfolio Value</p>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-sm text-success">+0.00% (24h)</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Staked USDe</p>
                  <p className="text-2xl font-bold">0 sUSDe</p>
                  <p className="text-sm text-success">APY: 8.5%</p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-success" />
              </div>
            </div>

            <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Active Positions</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-base-content/70">PnL: $0.00</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-info" />
              </div>
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="bg-base-100 p-6 rounded-3xl shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Asset Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content font-bold">
                    U
                  </div>
                  <div>
                    <p className="font-medium">USDe (Unified Collateral)</p>
                    <p className="text-sm text-base-content/70">Staked on Avail Nexus</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">0 USDe</p>
                  <p className="text-sm text-base-content/70">$0.00</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-success-content font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-medium">sUSDe (Staked USDe)</p>
                    <p className="text-sm text-base-content/70">Yield-bearing tokens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">0 sUSDe</p>
                  <p className="text-sm text-base-content/70">$0.00</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center text-warning-content font-bold">
                    Y
                  </div>
                  <div>
                    <p className="font-medium">yUSDe (Margin Tokens)</p>
                    <p className="text-sm text-base-content/70">Trading collateral (0.8:1 ratio)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">0 yUSDe</p>
                  <p className="text-sm text-base-content/70">$0.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading History */}
          <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Recent Trading Activity</h2>
            <div className="text-center py-8 text-base-content/70">
              <p>No trading activity yet</p>
              <p className="text-sm mt-2">Start trading to see your history here</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
