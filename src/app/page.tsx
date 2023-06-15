"use client";
import React, { useEffect, useState } from "react";

import { useNetwork, useAccount } from "wagmi";
import networkMapping from "../constants/networkMapping.json";
import { Nft, NetworkMappingType } from "@/types.ts";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "@/constants/subgraphQueries.ts";

import NftBox from "@/components/nftBox.tsx";

const networkMappingTyped = networkMapping as NetworkMappingType;

export default function Home() {
  const [hasMounted, setHasMounted] = useState<boolean>();
  const { connector: activeConnector, isConnected } = useAccount();
  const { chain } = useNetwork();

  const chainString = chain ? chain.id : "31337";
  const marketplaceAddress = networkMappingTyped[chainString].NftMarketplace[0];

  const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isConnected &&
          (loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.activeItems.map((nft: Nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              return (
                <NftBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  nftMarketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}` as React.Key}
                />
              );
            })
          ))}
      </div>
    </div>
  );
}
