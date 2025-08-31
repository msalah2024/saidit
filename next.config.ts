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
      {
        protocol: 'https',
        hostname: 'www.aljazeera.com',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk', // Hostname for BBC News images
      },
      {
        protocol: 'https',
        hostname: '**.reuters.com', // Wildcard for all reuters.com subdomains
      },
      {
        protocol: 'https',
        hostname: 'media.zenfs.com', // Common host for AP images via Yahoo News
      },
      {
        protocol: 'https',
        hostname: 'techcrunch.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com', // Hostname for The Verge images
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // For sources that use Google Cloud Storage
      },
    ],
  },
};

export default nextConfig;
