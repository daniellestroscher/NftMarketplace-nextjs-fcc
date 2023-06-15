import nftAbi from "../constants/BasicNft.json";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";

import { useAccount } from "wagmi";
import { readContract, prepareWriteContract, writeContract } from "@wagmi/core";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { SellNFTModal } from "./sellNftModal.tsx";
import { UpdateListingModal } from "./updateListingModal.tsx";
import axios from "axios";
import { Card, Tooltip, CircularProgress } from "@mui/material";
import { Abi } from "abitype";

interface NftBoxProps {
  price?: number;
  nftAddress: string;
  tokenId: string;
  nftMarketplaceAddress: string;
  seller?: string;
}
const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr;

  const separator = "...";
  var sepLen = separator.length,
    charsToShow = strLen - sepLen,
    frontChars = Math.ceil(charsToShow / 2),
    backChars = Math.floor(charsToShow / 2);

  return (
    fullStr.slice(0, frontChars) +
    separator +
    fullStr.slice(fullStr.length - backChars)
  );
};

export default function NftBox({
  price,
  nftAddress,
  tokenId,
  nftMarketplaceAddress,
  seller,
}: NftBoxProps) {
  const { isConnected, address } = useAccount();
  const [imageURI, setImageURI] = useState<string | undefined>();
  const [tokenURI, setTokenURI] = useState<string | undefined>();
  const [tokenName, setTokenName] = useState<string | undefined>();
  const [tokenDescription, setTokenDescription] = useState<
    string | undefined
  >();
  // State to handle display of 'update listing' modal
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const isListed = seller !== undefined && price != undefined;

  //const dispatch = useNotification();

  async function getTokenURI() {
    const data = await readContract({
      address: nftAddress as `0x${string}`,
      abi: nftAbi,
      functionName: "tokenURI",
      args: [tokenId],
    });
    if (data) {
      setTokenURI(data.toString());
    }
  }

  async function buyItem() {
    const { request } = await prepareWriteContract({
      address: nftMarketplaceAddress as `0x${string}`,
      abi: nftMarketplaceAbi,
      functionName: "buyItem",
      args: [nftAddress, tokenId],
    });
    const { hash } = await writeContract(request);
    if (hash) {
      console.log("buy item successful");
    }
  }

  async function updateUI() {
    console.log(`TokenURI is: ${tokenURI}`);
    // We are cheating a bit here...
    if (tokenURI) {
      const requestURL = (tokenURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      const meta = await axios.get(requestURL);

      let imageURI = meta.data.image;
      imageURI = (imageURI as string).replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      setImageURI(imageURI);
      setTokenName(meta.data.name);
      setTokenDescription(meta.data.description);
    }
  }

  useEffect(() => {
    updateUI();
  }, [tokenURI]);

  useEffect(() => {
    isConnected && getTokenURI();
  }, [isConnected]);

  const isOwnedByUser =
    seller?.toLowerCase() === address?.toLowerCase() || seller === undefined;
  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);

  const handleCardClick = async function () {
    if (isOwnedByUser) {
      setShowModal(true);
    } else {
      console.log(nftMarketplaceAddress);
      try {
        await buyItem();
        alert("bought item successfully");
      } catch (err) {
        console.log(err);
        alert(`Error buying NFT: ${err}`);
      }
    }
  };

  const tooltipContent = isListed
    ? isOwnedByUser
      ? "Update listing"
      : "Buy me"
    : "Create listing";

  return (
    <div className="p-2">
      <SellNFTModal
        isVisible={showModal && !isListed}
        imageURI={imageURI}
        nftAbi={nftAbi as Abi}
        nftMarketplaceAbi={nftMarketplaceAbi as Abi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={nftMarketplaceAddress}
      />
      <UpdateListingModal
        isVisible={showModal && isListed}
        imageURI={imageURI}
        nftMarketplaceAbi={nftMarketplaceAbi as Abi}
        nftAddress={nftAddress}
        tokenId={tokenId}
        onClose={hideModal}
        nftMarketplaceAddress={nftMarketplaceAddress}
        currentPrice={price}
      />
      <Tooltip title={tooltipContent}>
        <Card
          variant="outlined"
          onClick={handleCardClick}
          className="p-2 w-60 hover:cursor-pointer"
        >
          {imageURI ? (
            <div className="flex flex-col items-end gap-2">
              <div>#{tokenId}</div>
              <div className="italic text-sm">
                Owned by {formattedSellerAddress}
              </div>
              <img
                src={imageURI}
                alt="NFT Image"
                style={{ width: "200px", height: "auto" }}
              />
              {price ? (
                <div className="font-bold">
                  {ethers.utils.formatEther(price)} ETH
                </div>
              ) : (
                <br />
              )}
              {tokenName && (
                <div>
                  <h6>
                    <b>{tokenName}</b>
                  </h6>
                  <p>{tokenDescription}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <CircularProgress />
              Loading...
            </div>
          )}
        </Card>
      </Tooltip>
    </div>
  );
}
