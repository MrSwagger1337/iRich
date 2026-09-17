/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@irich/core',
    '@irich/plugin-sdk',
    '@irich/renderer',
    '@irich/rich-text',
    '@irich/ui',
    '@irich/react',
  ],
};

export default nextConfig;
