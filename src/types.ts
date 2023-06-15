// import networkMapping from "./constants/networkMapping.json";
// export const networkMappingTyped = networkMapping as NetworkMappingType;

export interface NetworkMappingType {
  [key: string]: {
    NftMarketplace: string[];
  };
}
export interface Nft {
  price?: number;
  nftAddress: string;
  tokenId: string;
  seller?: string;
}
