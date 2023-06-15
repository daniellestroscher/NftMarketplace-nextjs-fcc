//import { useMoralis } from "react-moralis";
import { useNetwork, useAccount } from "wagmi";
import { useEffect, useState } from "react";
import networkMapping from "../constants/networkMapping.json";
//import { BannerStrip } from "web3uikit";

const isValidNetwork = (network: string) => {
  if (networkMapping.hasOwnProperty(network)) {
    return true;
  }
  return false;
};

const NetworkBanner = () => {
  const { connector: activeConnector, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [currentChainId, setCurrentChainId] = useState<number | undefined>(
    undefined
  );

  const getChainId = async () => {
    if (isConnected && chain) {
      const chainId = chain.id;
      setCurrentChainId(chainId ?? 0);
    }
    return 0;
  };

  useEffect(() => {
    getChainId();
  }, [isConnected, chain]);

  // Moralis.onChainChanged(() => {
  //   window.location.reload();
  // });

  const [showNetworkSwitcherDialog, setShowNetworkSwitcherDialog] =
    useState(false);

  useEffect(() => {
    if (
      currentChainId === undefined ||
      isValidNetwork(currentChainId ? currentChainId?.toString() : "")
    ) {
      setShowNetworkSwitcherDialog(false);
    } else {
      setShowNetworkSwitcherDialog(true);
    }
  }, [currentChainId]);

  return (
    <>
      {showNetworkSwitcherDialog && (
        // <BannerStrip
        //   type="error"
        //   text="Connected to unsupported network"
        //   id={"1"}
        // />
        <div>Connected to unsupported network</div>
      )}
    </>
  );
};

export default NetworkBanner;
