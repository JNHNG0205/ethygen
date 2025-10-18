"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { useAccount } from "wagmi";
import { CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Trade: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState("1");
  const [tradeAmount, setTradeAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ETH");

  const handleOpenPosition = () => {
    // TODO: Implement position opening
    console.log("Open position:", { tradeType, leverage, tradeAmount, selectedAsset });
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-6xl">
          <h1 className="text-center mb-8">
            <span className="block text-3xl font-bold">📈 Perpetual Trading</span>
            <p className="text-lg mt-2 text-base-content/70">
              Trade perpetuals using your yield-bearing collateral
            </p>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trading Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Overview */}
              <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Market Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">ETH/USD</span>
                      <span className="text-success">↗</span>
                    </div>
                    <div className="text-2xl font-bold">$2,450.32</div>
                    <div className="text-sm text-success">+2.34% (24h)</div>
                  </div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">BTC/USD</span>
                      <span className="text-success">↗</span>
                    </div>
                    <div className="text-2xl font-bold">$43,120.15</div>
                    <div className="text-sm text-success">+1.87% (24h)</div>
                  </div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">SOL/USD</span>
                      <span className="text-error">↘</span>
                    </div>
                    <div className="text-2xl font-bold">$98.45</div>
                    <div className="text-sm text-error">-0.52% (24h)</div>
                  </div>
                </div>
              </div>

              {/* Trading Form */}
              <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Open Position</h2>
                
                <div className="space-y-4">
                  {/* Trade Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Position Type</label>
                    <div className="flex space-x-2">
                      <button
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          tradeType === "long"
                            ? "bg-success text-success-content"
                            : "bg-base-200 text-base-content hover:bg-base-300"
                        }`}
                        onClick={() => setTradeType("long")}
                      >
                        <ArrowUpIcon className="h-5 w-5 inline mr-2" />
                        Long
                      </button>
                      <button
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          tradeType === "short"
                            ? "bg-error text-error-content"
                            : "bg-base-200 text-base-content hover:bg-base-300"
                        }`}
                        onClick={() => setTradeType("short")}
                      >
                        <ArrowDownIcon className="h-5 w-5 inline mr-2" />
                        Short
                      </button>
                    </div>
                  </div>

                  {/* Asset Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Asset</label>
                    <select
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="ETH">ETH/USD</option>
                      <option value="BTC">BTC/USD</option>
                      <option value="SOL">SOL/USD</option>
                    </select>
                  </div>

                  {/* Leverage */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Leverage</label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="1">1x</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="5">5x</option>
                      <option value="10">10x</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Margin Amount (yUSDe)</label>
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.00"
                      className="input input-bordered w-full"
                    />
                  </div>

                  {/* Position Summary */}
                  <div className="bg-base-200 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Position Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Position Size:</span>
                        <span className="font-medium">
                          ${(parseFloat(tradeAmount || "0") * parseFloat(leverage)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margin Required:</span>
                        <span className="font-medium">{tradeAmount || "0"} yUSDe</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Liquidation Price:</span>
                        <span className="font-medium text-warning">
                          {tradeType === "long" ? "$2,100.00" : "$2,800.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenPosition}
                    className="btn btn-primary w-full"
                    disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                  >
                    Open {tradeType === "long" ? "Long" : "Short"} Position
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Balance */}
              <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Your Balance</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-primary" />
                      <span>yUSDe (Margin)</span>
                    </div>
                    <span className="font-bold">0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <ChartBarIcon className="h-5 w-5 text-success" />
                      <span>sUSDe (Staked)</span>
                    </div>
                    <span className="font-bold">0.00</span>
                  </div>
                </div>
                <button className="btn btn-outline w-full mt-4">
                  Convert sUSDe → yUSDe
                </button>
              </div>

              {/* Active Positions */}
              <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Active Positions</h2>
                <div className="text-center py-8 text-base-content/70">
                  <p>No active positions</p>
                  <p className="text-sm mt-2">Open a position to see it here</p>
                </div>
              </div>

              {/* Trading History */}
              <div className="bg-base-100 p-6 rounded-3xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
                <div className="text-center py-8 text-base-content/70">
                  <p>No trading history</p>
                  <p className="text-sm mt-2">Your trades will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trade;
