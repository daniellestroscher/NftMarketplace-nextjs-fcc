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
  trailingSlash: true,
  output: "export",
  //output: "standalone",
};

module.exports = nextConfig;
