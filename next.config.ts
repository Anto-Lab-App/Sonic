import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger request bodies for audio/video uploads (default is ~4 MB).
  // Files recorded from microphone are typically 1-5 MB; videos can be larger.
  serverExternalPackages: ["@google-cloud/storage"],
};

export default nextConfig;
