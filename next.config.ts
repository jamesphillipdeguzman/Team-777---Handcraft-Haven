import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // recommended for catching React issues
  productionBrowserSourceMaps: false, // disable source maps in production for security/performance
  compiler: {
    // optional: if you later use styled-components or similar
    styledComponents: true,
  },

  typescript: {
    // fail build on type errors
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        //pathname: '/**',  // allow all paths
        pathname: '/dego6hgcb/image/upload/**',
      },
    ],
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
