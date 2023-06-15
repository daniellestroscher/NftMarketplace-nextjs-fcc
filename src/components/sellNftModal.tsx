import React, { useState } from "react";
import { prepareWriteContract, writeContract, readContract } from "@wagmi/core";

import { ethers } from "ethers";
import { Abi } from "abitype";
import Image from "next/image";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CircularProgress, Input } from "@mui/material";

export interface SellNFTModalProps {
  isVisible: boolean;
  onClose: () => void;
  nftAbi: Abi;
  nftAddress: string;
  nftMarketplaceAbi: Abi;
  nftMarketplaceAddress: string;
  tokenId: string;
  imageURI: string | undefined;
}

export const SellNFTModal = ({
  isVisible,
  onClose,
  nftAbi,
  nftAddress,
  nftMarketplaceAbi,
  nftMarketplaceAddress,
  tokenId,
  imageURI,
}: SellNFTModalProps) => {
  //const dispatch = useNotification();
  const [priceToListWith, setPriceToListWith] = useState<string | undefined>();

  const handleListItemSuccess = () => {
    // dispatch({
    //   type: "success",
    //   message: "Item listed successfully",
    //   title: "Item Listed",
    //   position: "topR",
    // });
    alert("listed nft successfully");
    onClose && onClose();
  };

  async function handleApproveSuccess(
    nftAddress: string,
    tokenId: string,
    price: string
  ) {
    console.log("Approve successful");

    const { request } = await prepareWriteContract({
      address: nftMarketplaceAddress as `0x${string}`,
      abi: nftMarketplaceAbi,
      functionName: "listItem",
      args: [nftAddress, tokenId, ethers.utils.parseEther(price)],
    });
    const { hash } = await writeContract(request);
    if (hash) {
      handleListItemSuccess();
      console.log("listed item successful");
    }
  }

  async function approveAndList() {
    if (!priceToListWith) {
      console.error("listing price not set");
      return;
    }

    const { request } = await prepareWriteContract({
      address: nftAddress as `0x${string}`,
      abi: nftAbi,
      functionName: "approve",
      args: [nftMarketplaceAddress, tokenId],
    });
    const { hash } = await writeContract(request);
    if (hash) {
      handleApproveSuccess(nftAddress, tokenId, priceToListWith);
    }
  }

  return (
    <Modal
      open={isVisible}
      onClose={onClose}
      aria-describedby="modal-modal-description"
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box className="flex flex-col items-center gap-4 bg-white">
        <p className="p-4 text-lg" id="modal-modal-description">
          Create a listing to allow others to purchase your NFT.
        </p>
        <div className="flex flex-col items-end gap-2 border-solid border-2 border-gray-400 rounded p-2">
          <div>#{tokenId}</div>
          {imageURI ? (
            <img
              src={imageURI}
              alt="NFT Image"
              style={{ height: "200px", width: "auto" }}
            />
          ) : (
            <CircularProgress />
          )}
        </div>
        <div className="flex p-6 gap-4">
          <Input
            placeholder="Set listing price"
            name="Listing price"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPriceToListWith(event.target.value);
            }}
            type="number"
            color="primary"
          />
          <Button disabled={!priceToListWith} onClick={approveAndList}>
            List Nft
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
