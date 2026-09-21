import type { NextConfig } from "next";

const removedCatalog = ["sale", "folding", "plastic", "covers", "bedding", "banquet"];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return removedCatalog.map((id) => ({
      source: `/catalog/${id}`,
      destination: "/catalog",
      permanent: true,
    }));
  },
};

export default nextConfig;
