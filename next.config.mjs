/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'egoera.es' }] },
  async redirects() {
    return [
      { source: '/pro', destination: '/', permanent: true },
      { source: '/pro/:path*', destination: '/', permanent: true },
      { source: '/conversa', destination: '/diario', permanent: false },
      { source: '/conversa/:path*', destination: '/diario', permanent: false },
    ];
  },
};
export default nextConfig;
