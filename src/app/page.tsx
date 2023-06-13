"use client";
import React from "react";
import { useMoralis } from "react-moralis";
import networkMapping from "../constants/networkMapping.json";
import { Nft, NetworkMappingType } from "@/types";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "@/constants/subgraphQueries";

import NftBox from "@/components/nftBox";

const networkMappingTyped = networkMapping as NetworkMappingType;

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMappingTyped[chainString].NftMarketplace[0];

  const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled &&
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
