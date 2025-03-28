/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["image.tmdb.org"],
  },
  experimental: {
    serverActions: true,
    mdxRs: true,
    serverExternalPackages: ["mongoose"],
  },
};

export default nextConfig;
