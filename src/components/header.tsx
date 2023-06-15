import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h1 className="py-4 px4 font-bold text-3xl">NFT Marketplace</h1>
      <div className="flex flex-row items-center">
        <Link href="/" as={`/`} className="mr-4 p-6">
          Home
        </Link>
        <Link href="/sell-nft" as={`/sell-nft`} className="mr-4 p-6">
          Sell NFT
        </Link>
        <ConnectButton />
      </div>
    </nav>
  );
}
