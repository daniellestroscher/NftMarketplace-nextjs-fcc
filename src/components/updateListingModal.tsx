import { useState } from "react";
import { prepareWriteContract, writeContract } from "@wagmi/core";
import { ethers } from "ethers";
import { Box, Button, CircularProgress, Input, Modal } from "@mui/material";
import { Abi } from "abitype";

export interface UpdateListingModalProps {
  isVisible: boolean;
  onClose: () => void;
  nftMarketplaceAbi: Abi;
  nftMarketplaceAddress: string;
  nftAddress: string;
  tokenId: string;
  imageURI: string | undefined;
  currentPrice: number | undefined;
}

export const UpdateListingModal = ({
  isVisible,
  onClose,
  nftMarketplaceAbi,
  nftMarketplaceAddress,
  nftAddress,
  tokenId,
  imageURI,
  currentPrice,
}: UpdateListingModalProps) => {
  //const dispatch = useNotification();

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState<
    string | undefined
  >();

  const handleUpdateListingSuccess = () => {
    // dispatch({
    //   type: "success",
    //   message: "Listing updated successfully",
    //   title: "Listing Updated",
    //   position: "topR",
    // });
    alert("updated listing successfully");
    onClose && onClose();
  };

  const handleCancelListingSuccess = () => {
    // dispatch({
    //   type: "success",
    //   message: "Listing canceled successfully",
    //   title: "Listing Canceled",
    //   position: "topR",
    // });
    alert("canceled listing successfully");
    onClose && onClose();
  };

  async function cancelListing() {
    const { request } = await prepareWriteContract({
      address: nftMarketplaceAddress as `0x${string}`,
      abi: nftMarketplaceAbi,
      functionName: "cancelListing",
      args: [nftAddress, tokenId],
    });
    const { hash } = await writeContract(request);
    if (hash) {
      handleCancelListingSuccess();
    }
  }

  async function updateListing() {
    if (!priceToUpdateListingWith) {
      console.log("No price to update listing with...");
    } else {
      const { request } = await prepareWriteContract({
        address: nftMarketplaceAddress as `0x${string}`,
        abi: nftMarketplaceAbi,
        functionName: "updateListing",
        args: [
          nftAddress,
          tokenId,
          ethers.utils.parseEther(priceToUpdateListingWith),
        ],
      });
      const { hash } = await writeContract(request);
      if (hash) {
        handleUpdateListingSuccess();
      }
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
        <p className="p-4 text-lg">
          This is your listing. You may either update the listing price or
          cancel it.
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
          <div className="font-bold">
            {ethers.utils.formatEther(currentPrice || 0)} ETH
          </div>
        </div>
        <div className="p-6 flex items-end gap-2">
          <Button
            variant="outlined"
            color="error"
            //startIcon={<DeleteIcon />}
            id="cancel-listing"
            onClick={() => cancelListing()}
          >
            Cancel Listing
          </Button>
          <Input
            placeholder="Update listing price"
            name="New listing price"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPriceToUpdateListingWith(event.target.value);
            }}
            type="number"
            color="primary"
          />
          <Button
            variant="outlined"
            disabled={!priceToUpdateListingWith}
            onClick={updateListing}
          >
            Update Listing
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
