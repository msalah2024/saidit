import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        // Optionally, you can restrict to specific pathnames:
        // pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'padywywmpdhyockgqjbh.supabase.co',
      },
    ],
  },
};

export default nextConfig;
