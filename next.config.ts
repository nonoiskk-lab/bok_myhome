import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local property placeholders are SVGs (see scripts/gen-placeholder-images.mjs);
    // swap for real photography via the admin image pipeline in production.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
