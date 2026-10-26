/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/wallet',
        destination: '/deposit',
        permanent: false,
      },
      {
        source: '/vault',
        destination: '/accounts',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
