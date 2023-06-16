"use client";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import Header from "@/components/header";
import NetworkBanner from "@/components/networkBanner";

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/48328/nft-marketplace/version/latest",
});

import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, polygon, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
const WALLET_CONNECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
console.log(WALLET_CONNECT_PROJECT_ID, "id");

const { chains, publicClient } = configureChains(
  [sepolia, mainnet, polygon],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <MoralisProvider initializeOnMount={false}>
    <WagmiConfig config={wagmiConfig}>
      <ApolloProvider client={apolloClient}>
        {/* <NotificationProvider> */}
        <RainbowKitProvider
          chains={chains}
          modalSize="compact"
          theme={darkTheme({
            accentColor: "skyblue",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <NetworkBanner />
          <Header />
          {children}
        </RainbowKitProvider>
        {/* </NotificationProvider> */}
      </ApolloProvider>
    </WagmiConfig>
    // {/* </MoralisProvider> */}
  );
}
