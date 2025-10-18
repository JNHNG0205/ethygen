"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ChartBarIcon, CurrencyDollarIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">🧬 Ethygen</span>
          </h1>
          <p className="text-center text-lg mb-4">
            Gasless DeFi Platform for Cross-Chain Yield & Perpetual Trading
          </p>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BanknotesIcon className="h-8 w-8 fill-secondary" />
              <p>
                Manage your unified collateral and yield with the{" "}
                <Link href="/vault" passHref className="link">
                  Vault
                </Link>{" "}
                dashboard.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CurrencyDollarIcon className="h-8 w-8 fill-secondary" />
              <p>
                Execute perpetual trades using your yield-bearing collateral in the{" "}
                <Link href="/trade" passHref className="link">
                  Trading
                </Link>{" "}
                interface.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ChartBarIcon className="h-8 w-8 fill-secondary" />
              <p>
                View your portfolio performance and analytics on the{" "}
                <Link href="/dashboard" passHref className="link">
                  Dashboard
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
