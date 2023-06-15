"use client";
import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Button from "@mui/material/Button";
import { useAccount, useNetwork } from "wagmi";
import { prepareWriteContract, writeContract, readContract } from "@wagmi/core";
import nftMarketplaceAbi from "../../constants/NftMarketplace.json";
import networkMapping from "../../constants/networkMapping.json";
import { NetworkMappingType, Nft } from "@/types.ts";
import { BigNumber, ethers } from "ethers";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "@/constants/subgraphQueries.ts";
import NftBox from "@/components/nftBox.tsx";
import { Divider, Input } from "@mui/material";
import { SellNFTModal } from "@/components/sellNftModal.tsx";
import { Abi } from "abitype";

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
  // const dispatch = useNotification();
  const [nftContractAddress, setNftContractAddress] = useState<string>("");
  const [nftTokenId, setNftTokenId] = useState<string>("");
  const [displayUnlisted, setDisplayUnlisted] = useState(false);

  //const hideModal = () => setShowModal(false);

  const { address } = useAccount();
  const { chain } = useNetwork();

  const chainString = chain ? chain.id : "31337";
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

  async function fetchAvailableProceeds() {
    const data = (await readContract({
      address: nftMarketplaceAddress as `0x${string}`,
      abi: nftMarketplaceAbi,
      functionName: "getProceeds",
      args: [address],
    })) as BigNumber;
    if (data) {
      let availableProceeds = BigNumber.from(data.toString());
      setAvailableProceeds(availableProceeds);
    }
  }

  useEffect(() => {
    fetchAvailableProceeds();
  }, [address]);

  const handleWithdraw = async () => {
    const { request } = await prepareWriteContract({
      address: nftMarketplaceAddress as `0x${string}`,
      abi: nftMarketplaceAbi,
      functionName: "withdrawProceeds",
    });
    const { hash } = await writeContract(request);
    if (hash) {
      alert("withdraw successful");
    }
  };

  //const handleWithdrawSuccess = () => {
  // dispatch({
  //   type: "success",
  //   message: "Proceeds withdrawn successfully",
  //   title: "Proceeds Withdrawn",
  //   position: "topR",
  // });
  //alert("withdraw successful");
  //};

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

  const unlistedAddedNfts: Nft[] = [];
  const handleAddNft = () => {
    console.log("in handle listing");
    setDisplayUnlisted(true);
    const NFT = { nftAddress: nftContractAddress, tokenId: nftTokenId };
    unlistedAddedNfts.push(NFT);
    console.log(unlistedAddedNfts, "unlistedAddedNfts");
  };

  return (
    <div className="container mx-auto">
      <div className="py-4">
        <h2 className="text-2xl">Your NFTs</h2>
        <div className="flex flex-wrap">
          {!loading && listedNfts.activeItems.length == 0 && (
            <div>No Nfts Listed</div>
          )}
          {!loading && nftContractAddress && nftTokenId && (
            <div className="">
              <NftBox
                nftAddress={nftContractAddress}
                nftMarketplaceAddress={nftMarketplaceAddress}
                tokenId={nftTokenId}
                seller={address}
                price={undefined}
              />
            </div>
          )}
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
        <div className="flex flex-col gap-6 justify-items-end w-fit p-2">
          <h2 className="text-2xl">List New NFT</h2>
          <Input
            placeholder="NFT Contract Address"
            name="Nft Contract Address"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNftContractAddress(event.target.value);
            }}
            type="text"
            color="primary"
          ></Input>
          <Input
            placeholder="Token ID"
            name="Token ID"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNftTokenId(event.target.value);
            }}
            type="number"
            color="primary"
          ></Input>
        </div>

        <div className="flex flex-col gap-2 justify-items-start w-fit fixed bottom-10 right-5 bg-sky-500/20 p-3 rounded">
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
            variant="outlined"
            disabled={!hasNonZeroAvailableProceeds}
            id="withdraw-proceeds"
            onClick={handleWithdraw}
            type="button"
          >
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SellNft;
