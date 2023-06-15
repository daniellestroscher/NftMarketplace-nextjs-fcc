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

  output: "export",
};

module.exports = nextConfig;
