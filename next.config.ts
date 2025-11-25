import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // recommended for catching React issues

  compiler: {
    // optional: if you later use styled-components or similar
    styledComponents: true,
  },

  typescript: {
    // fail build on type errors
    ignoreBuildErrors: false,
  },

  // Optional redirects example
  async redirects() {
    return [
      {
        source: "/dashboard",
        missing: [
          {
            type: "cookie",
            key: "token",
          },
        ],
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
