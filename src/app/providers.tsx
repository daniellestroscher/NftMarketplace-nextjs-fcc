"use client";
import React from "react";
import Header from "@/components/header";

import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import NetworkBanner from "@/components/networkBanner";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/48328/nft-marketplace/version/latest",
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={client}>
        <NotificationProvider>
          <NetworkBanner />
          <Header />
          {children}
        </NotificationProvider>
      </ApolloProvider>
    </MoralisProvider>
  );
}
