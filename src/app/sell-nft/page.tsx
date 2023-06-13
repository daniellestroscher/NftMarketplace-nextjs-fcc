"use client";
import type { NextPage } from "next";
import { Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis, useChain } from "react-moralis";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import networkMapping from "../../constants/networkMapping.json";
import { NetworkMappingType, Nft } from "@/types";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "@/constants/subgraphQueries";
import NftBox from "@/components/nftBox";

type chainType =
  | "eth"
  | "0x1"
  | "ropsten"
  | "0x3"
  | "rinkeby"
  | "0x4"
  | "goerli"
  | "0x5"
  | "kovan"
  | "0x2a"
  | "polygon"
  | "0x89"
  | "mumbai"
  | "0x13881"
  | "bsc"
  | "0x38"
  | "bsc testnet"
  | "0x61"
  | "avalanche"
  | "0xa86a"
  | "avalanche testnet"
  | "0xa869"
  | "fantom"
  | "0xfa";

const SellNft: NextPage = () => {
  const dispatch = useNotification();

  const { account } = useMoralis();
  const { chainId } = useChain();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const currentNetworkMapping = (networkMapping as NetworkMappingType)[
    chainString
  ];

  if (!currentNetworkMapping) {
    const error = `No entry in networkMapping.json matching the current chain ID of ${chainString}`;
    console.error(error);
    return <div>Error: {error}</div>;
  }

  const nftMarketplaceAddress = currentNetworkMapping.NftMarketplace[0];

  const [availableProceeds, setAvailableProceeds] = useState<
    BigNumber | undefined
  >(undefined);

  // @ts-ignore
  const { data, runContractFunction, isFetching, isLoading } = useWeb3Contract(
    {}
  );

  const fetchAvailableProceeds = async () => {
    const result = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
    });
    setAvailableProceeds(result as BigNumber);
  };

  useEffect(() => {
    fetchAvailableProceeds();
  }, [account]);

  const handleWithdraw = async () => {
    await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: nftMarketplaceAddress,
        functionName: "withdrawProceeds",
      },
      onSuccess: handleWithdrawSuccess,
    });
  };

  const handleWithdrawSuccess = () => {
    dispatch({
      type: "success",
      message: "Proceeds withdrawn successfully",
      title: "Proceeds Withdrawn",
      position: "topR",
    });
  };

  const { loading, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  const hasNonZeroAvailableProceeds =
    availableProceeds !== undefined && !availableProceeds.isZero();

  const getSellerAndPrice = (nftAddress: string, tokenId: string) => {
    const matchingListing = listedNfts.activeItems.find((nft: Nft) => {
      const { nftAddress: comparisonNftAddress, tokenId: comparisonTokenId } =
        nft;

      return (
        nftAddress === comparisonNftAddress && tokenId === comparisonTokenId
      );
    });

    return matchingListing
      ? {
          seller: matchingListing.seller,
          price: matchingListing.price,
        }
      : {
          seller: undefined,
          price: undefined,
        };
  };

  return (
    <div className="container mx-auto">
      <div className="py-4">
        <h2 className="text-2xl">Your NFTs</h2>
        <div className="flex flex-wrap">
          {!loading &&
            listedNfts.activeItems.map((nft: Nft) => {
              const { seller, price } = getSellerAndPrice(
                nft.nftAddress,
                nft.tokenId
              );

              return (
                <NftBox
                  nftAddress={nft.nftAddress}
                  nftMarketplaceAddress={nftMarketplaceAddress}
                  tokenId={nft.tokenId}
                  seller={seller}
                  price={price}
                  key={`${nft.nftAddress}${nft.tokenId}` as React.Key}
                />
              );
            })}
        </div>
      </div>
      <div className="py-4">
        <div className="flex flex-col gap-2 justify-items-start w-fit">
          <h2 className="text-2xl">Withdraw proceeds</h2>
          {hasNonZeroAvailableProceeds ? (
            <p>
              Sales proceeds available for withdrawal:{" "}
              {ethers.utils.formatEther(availableProceeds as BigNumber)} ЕТH
            </p>
          ) : (
            <p>No withdrawable proceeds detected</p>
          )}
          <Button
            disabled={!hasNonZeroAvailableProceeds}
            id="withdraw-proceeds"
            onClick={handleWithdraw}
            text="Withdraw"
            theme="outline"
            type="button"
          />
        </div>
      </div>
    </div>
  );
};
export default SellNft;
