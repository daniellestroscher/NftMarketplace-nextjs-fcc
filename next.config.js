/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
    ],
    unoptimized: true,
  },
  env: {
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
  },
  trailingSlash: true,
  output: "export",
  //output: "standalone",
};

module.exports = nextConfig;
