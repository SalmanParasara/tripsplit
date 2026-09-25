import type { NextConfig } from "next";
// TripSplit uses the Firebase client SDK only, so it can be exported as a free static site.
const nextConfig: NextConfig = { reactStrictMode: true, output: "export" };
export default nextConfig;
