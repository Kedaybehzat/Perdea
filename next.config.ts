import type { NextConfig } from "next";

// iCloud sync: `.next` → `.next.nosync` symlink (ai_docs/core/tuzaklar.md).
// lucide-react dev compile çok yavaş — modüler import optimizasyonu.
const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
