import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // The parent folder is a separate Vite project with its own lockfile.
  // Pin the workspace root to this app so module resolution + Turbopack
  // never reach up into the parent's node_modules.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
