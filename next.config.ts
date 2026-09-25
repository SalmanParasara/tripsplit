import type { NextConfig } from "next";
// Trip pages use runtime route parameters (for example, /trips/[tripId]).
// Vercel supports those routes directly; static export does not.
const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
