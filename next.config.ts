import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // --- General Purpose Hostnames (from previous config) ---
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'padywywmpdhyockgqjbh.supabase.co',
      },

      // --- Hostnames for News API Seeding Script ---
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk', // BBC News source
      },
      {
        protocol: 'https',
        hostname: '**.reuters.com', // Reuters source
      },
      {
        protocol: 'https',
        hostname: '**.reutersmedia.net', // Reuters source alternate CDN
      },
      {
        protocol: 'https',
        hostname: 'www.aljazeera.com', // Al Jazeera source
      },
      {
        protocol: 'https',
        hostname: 'techcrunch.com', // TechCrunch source
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com', // The Verge source (Vox Media)
      },
      {
        protocol: 'https',
        hostname: 'apnews.com', // Associated Press source
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Associated Press source alternate CDN
      },
      {
        protocol: 'https',
        hostname: 's.yimg.com', // Yahoo News/Affiliates (from previous error)
      },
      {
        protocol: 'https',
        hostname: 'platform.theverge.com',
        port: '', // This can be left empty for default ports (80 for http, 443 for https)
        pathname: '/wp-content/uploads/**', // This makes it more secure by only allowing images from a specific path
      },
      {
        protocol: 'https',
        hostname: 'dims.apnews.com',
        port: '',
        pathname: '/dims4/default/**', // This is optional but more secure
      },
      {
        protocol: 'https',
        hostname: 'bloximages.chicago2.vip.townnews.com',
        port: '',
        pathname: '/thesunchronicle.com/content/tncms/assets/**',
      },

    ],
  },
};

export default nextConfig;
